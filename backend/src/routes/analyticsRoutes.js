const express = require("express");
const router = express.Router();
const { verifyToken, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const {
  getDashboardAnalytics,
  getExpenseAnalytics,
  getDepartmentAnalytics,
} = require("../controllers/analyticsController");

router.get("/dashboard", verifyToken, enforceHospitalScope, logAction("READ", "Analytics"), getDashboardAnalytics);
router.get("/expenses", verifyToken, enforceHospitalScope, logAction("READ", "Analytics"), getExpenseAnalytics);
router.get("/departments", verifyToken, enforceHospitalScope, getDepartmentAnalytics);

module.exports = router;
