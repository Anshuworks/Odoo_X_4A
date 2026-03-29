const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { isAdmin, isManager, isEmployee } = require("../middleware/role.middleware");
const billController = require("../controllers/bill.controller");

const upload = require("../middleware/multer");

// Diagnostic test route
router.get("/test", (req, res) => res.json({ message: "Bill routes are active" }));

// Employee: create bill & see own bills
router.post("/create", authenticate, isEmployee, billController.createBill);
router.get("/my", authenticate, billController.getMyBills);
router.post("/upload", authenticate, isEmployee, upload.single('receipt'), billController.uploadReceipt);
router.post("/scan", authenticate, isEmployee, billController.scanReceipt);

// Admin: see bills for review & approve/reject
router.get("/admin", authenticate, isAdmin, billController.getAdminBills);
router.patch("/admin/:id", authenticate, isAdmin, billController.adminAction);

// Manager: see bills for final review & approve/reject
router.get("/manager", authenticate, isManager, billController.getManagerBills);
router.patch("/manager/:id", authenticate, isManager, billController.managerAction);

module.exports = router;
