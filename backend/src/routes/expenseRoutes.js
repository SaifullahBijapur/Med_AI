const express = require("express");
const router = express.Router();
const { verifyToken, requireRole, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const {
  getExpenseAnalytics,
  createExpense,
  listExpenses,
} = require("../controllers/expenseController");

router.get("/analytics", verifyToken, enforceHospitalScope, logAction("READ", "Expense"), getExpenseAnalytics);
router.get("/", verifyToken, enforceHospitalScope, logAction("READ", "Expense"), listExpenses);
router.post("/", verifyToken, requireRole("hospital_admin"), enforceHospitalScope, logAction("CREATE", "Expense"), createExpense);

module.exports = router;
