const express = require("express");
const router = express.Router();
const { verifyToken, requireRole, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const {
  listDoctors,
  getDoctor,
  doctorRegister,
  updateDoctor,
  deleteDoctor,
  toggleAvailability,
} = require("../controllers/doctorController");

router.get("/", verifyToken, enforceHospitalScope, logAction("READ", "Doctor"), listDoctors);
router.post("/register", verifyToken, requireRole("hospital_admin"), enforceHospitalScope, logAction("CREATE", "Doctor"), doctorRegister);
router.get("/:id", verifyToken, enforceHospitalScope, logAction("READ", "Doctor"), getDoctor);
router.put("/:id", verifyToken, requireRole("hospital_admin"), enforceHospitalScope, logAction("UPDATE", "Doctor"), updateDoctor);
router.delete("/:id", verifyToken, requireRole("hospital_admin"), enforceHospitalScope, logAction("DELETE", "Doctor"), deleteDoctor);
router.patch("/:id/toggle-availability", verifyToken, requireRole("hospital_admin", "doctor"), enforceHospitalScope, logAction("UPDATE", "Doctor"), toggleAvailability);

module.exports = router;
