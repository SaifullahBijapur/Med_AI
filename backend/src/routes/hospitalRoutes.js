const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const {
  createHospital,
  listHospitals,
  getHospital,
  updateHospital,
  updateHospitalStatus,
  deleteHospital,
  getGlobalAnalytics,
} = require("../controllers/HospitalController");

router.post("/", verifyToken, requireRole("superadmin"), logAction("CREATE", "Hospital"), createHospital);
router.get("/", verifyToken, requireRole("superadmin"), logAction("READ", "Hospital"), listHospitals);
router.get("/analytics/global", verifyToken, requireRole("superadmin"), getGlobalAnalytics);
router.get("/:id", verifyToken, requireRole("superadmin"), getHospital);
router.put("/:id", verifyToken, requireRole("superadmin"), logAction("UPDATE", "Hospital"), updateHospital);
router.patch("/:id/status", verifyToken, requireRole("superadmin"), logAction("UPDATE", "Hospital"), updateHospitalStatus);
router.delete("/:id", verifyToken, requireRole("superadmin"), logAction("DELETE", "Hospital"), deleteHospital);

module.exports = router;
