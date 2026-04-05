const pool = require("../config/db");
const OCRService = require("../services/ocr.service");
const CurrencyService = require("../services/currency.service");

// ──────────────────────────────────────────
// 1. POST /bills/create  —  Employee creates a bill
// ──────────────────────────────────────────
exports.createBill = async (req, res) => {
  const { title, amount, description, category, currency, receipt_url } = req.body;
  const userId = req.user.id;

  console.log("📩 Create bill request:", { title, amount, category, userId, currency });

  if (!title || amount === undefined || amount === null) {
    return res.status(400).json({ success: false, message: "Title and amount are required" });
  }

  const selectedCurrency = currency || 'USD';
  
  try {
    // Calculate converted amount to USD (Base Currency)
    const conversionResult = await CurrencyService.convert(Number(amount), selectedCurrency, 'USD');
    const convertedAmount = conversionResult.convertedAmount;

    const result = await pool.query(
      `INSERT INTO bills (title, amount, description, category, user_id, admin_status, manager_status, current_stage, currency, converted_amount, receipt_url)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', 'admin_review', $6, $7, $8)
       RETURNING *`,
      [title, Number(amount), description || null, category || null, userId, selectedCurrency, convertedAmount, receipt_url || null]
    );

    console.log("✅ Bill created:", result.rows[0].id);

    return res.status(201).json({
      success: true,
      message: "Bill submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Create bill error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// 2. GET /bills/admin  —  Admin sees bills at admin_review stage
// ──────────────────────────────────────────
exports.getAdminBills = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name AS employee_name, u.email AS employee_email
       FROM bills b
       JOIN users u ON u.id = b.user_id
       WHERE u.company_id = $1
       ORDER BY b.created_at DESC`,
       [req.user.company_id]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ Get admin bills error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// 3. PATCH /bills/admin/:id  —  Admin approves or rejects
// ──────────────────────────────────────────
exports.adminAction = async (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body; // action: 'approved' | 'rejected'
  const adminId = req.user.id;

  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({ success: false, message: "Action must be 'approved' or 'rejected'" });
  }

  try {
    // Verify bill is at admin_review stage and belongs to same company
    const billCheck = await pool.query(
        "SELECT b.*, u.company_id FROM bills b JOIN users u ON u.id = b.user_id WHERE b.id = $1", 
        [id]
    );

    if (billCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    const bill = billCheck.rows[0];

    if (bill.company_id !== req.user.company_id) {
      return res.status(403).json({ success: false, message: "Unauthorized access to bill" });
    }

    if (bill.current_stage !== "admin_review") {
      return res.status(400).json({
        success: false,
        message: `Cannot perform admin action — bill is at '${bill.current_stage}' stage`,
      });
    }

    // Determine next stage
    let nextStage = "completed";
    let autoApproveManager = false;

    if (action === "approved") {
      const managerCheck = await pool.query(
        "SELECT id FROM users WHERE role = 'manager' AND company_id = $1 LIMIT 1",
        [req.user.company_id]
      );

      if (managerCheck.rows.length > 0) {
        nextStage = "manager_review";
      } else {
        nextStage = "completed";
        autoApproveManager = true;
      }
    }

    let result;
    if (autoApproveManager) {
      result = await pool.query(
        `UPDATE bills
         SET admin_status = $1,
             admin_comment = $2,
             admin_reviewed_at = NOW(),
             admin_reviewer_id = $3,
             manager_status = 'approved',
             manager_comment = 'Auto-approved (No manager)',
             manager_reviewed_at = NOW(),
             current_stage = $4
         WHERE id = $5
         RETURNING *`,
        [action, comment || null, adminId, nextStage, id]
      );
    } else {
      result = await pool.query(
        `UPDATE bills
         SET admin_status = $1,
             admin_comment = $2,
             admin_reviewed_at = NOW(),
             admin_reviewer_id = $3,
             current_stage = $4
         WHERE id = $5
         RETURNING *`,
        [action, comment || null, adminId, nextStage, id]
      );
    }

    console.log(`✅ Admin ${action} bill ${id} → stage: ${nextStage}`);

    return res.json({
      success: true,
      message: `Bill ${action} by admin`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Admin action error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// 4. GET /bills/manager  —  Manager sees bills at manager_review stage
// ──────────────────────────────────────────
exports.getManagerBills = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name AS employee_name, u.email AS employee_email
       FROM bills b
       JOIN users u ON u.id = b.user_id
       WHERE u.company_id = $1
       ORDER BY b.created_at DESC`,
       [req.user.company_id]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ Get manager bills error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// 5. PATCH /bills/manager/:id  —  Manager approves or rejects (final)
// ──────────────────────────────────────────
exports.managerAction = async (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body; // action: 'approved' | 'rejected'
  const managerId = req.user.id;

  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({ success: false, message: "Action must be 'approved' or 'rejected'" });
  }

  try {
    // Verify bill is at manager_review stage and belongs to same company
    const billCheck = await pool.query(
        "SELECT b.*, u.company_id FROM bills b JOIN users u ON u.id = b.user_id WHERE b.id = $1", 
        [id]
    );

    if (billCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    const bill = billCheck.rows[0];
    
    if (bill.company_id !== req.user.company_id) {
      return res.status(403).json({ success: false, message: "Unauthorized access to bill" });
    }

    if (bill.current_stage !== "manager_review") {
      return res.status(400).json({
        success: false,
        message: `Cannot perform manager action — bill is at '${bill.current_stage}' stage`,
      });
    }

    const result = await pool.query(
      `UPDATE bills
       SET manager_status = $1,
           manager_comment = $2,
           manager_reviewed_at = NOW(),
           manager_reviewer_id = $3,
           current_stage = 'completed'
       WHERE id = $4
       RETURNING *`,
      [action, comment || null, managerId, id]
    );

    console.log(`✅ Manager ${action} bill ${id} → completed`);

    return res.json({
      success: true,
      message: `Bill ${action} by manager (final)`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Manager action error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// 6. GET /bills/my  —  Employee sees their own bills
// ──────────────────────────────────────────
exports.getMyBills = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM bills WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ Get my bills error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// 7. POST /bills/scan  —  OCR Scan a receipt image
// ──────────────────────────────────────────
exports.scanReceipt = async (req, res) => {
  try {
    const { receiptUrl } = req.body;
    if (!receiptUrl) {
      return res.status(400).json({ success: false, message: "No receipt URL provided" });
    }

    // Since we're using local storage, receiptUrl is the local path
    const data = await OCRService.scanReceipt(receiptUrl);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Scan receipt error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// 8. POST /bills/upload  —  Upload receipt image via Multer
// ──────────────────────────────────────────
exports.uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { filename, path: filePath } = req.file;
    // In a real app, this would be a public URL. For now, we return the local path for the OCR service.
    return res.json({
      success: true,
      data: {
        filename,
        filePath,
        url: filePath 
      }
    });
  } catch (error) {
    console.error("❌ Upload receipt error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
