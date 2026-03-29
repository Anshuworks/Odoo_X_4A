const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Use bcryptjs (pure JS) — native bcrypt often fails on Windows
const pool = require("../config/db");

// ✅ SIGNUP
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log("📩 Signup request body:", { name, email, role }); // Debug log

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  // Normalize role to lowercase, default to 'employee'
  const normalizedRole = (role || "employee").toLowerCase();
  const validRoles = ["admin", "manager", "employee"];
  if (!validRoles.includes(normalizedRole)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert a default company for this user (or find existing one)
    let companyId = null;
    const existingCompany = await pool.query(
      "SELECT id FROM companies LIMIT 1"
    );

    if (existingCompany.rows.length > 0) {
      companyId = existingCompany.rows[0].id;
    } else {
      // Create a default company
      const companyResult = await pool.query(
        "INSERT INTO companies (name, country, currency_code) VALUES ($1, $2, $3) RETURNING id",
        ["Default Company", "India", "INR"]
      );
      companyId = companyResult.rows[0].id;
    }

    // Insert user with correct column names matching the schema
    const userResult = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, company_id",
      [name, email, hashedPassword, normalizedRole, companyId]
    );

    const user = userResult.rows[0];

    // Create JWT token so user is logged in immediately after signup
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: user.company_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Signup successful for:", email);

    return res.json({
      message: "Signup successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    console.error("   Full error:", error);
    
    // Return specific error messages based on error type
    if (error.code === '23505') {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    if (error.code === '23503') {
      return res.status(500).json({ message: "Database reference error — please ensure migrations have been run" });
    }
    if (error.code === '42P01') {
      return res.status(500).json({ message: "Database table not found — please run the migration SQL" });
    }
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


// ✅ LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("📩 Login request body:", { email }); // Debug log

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found. Please sign up first." });
    }

    const user = result.rows[0];

    // Compare against password_hash column
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: user.company_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login successful for:", email);

    // Return both user object AND token (frontend expects both)
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    console.error("   Full error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
