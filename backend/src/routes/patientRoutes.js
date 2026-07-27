const express = require("express");
const router = express.Router();
const { verifyToken, requireRole, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const {
  patientRegister,
  viewAllPatients,
  getPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

router.get("/", verifyToken, enforceHospitalScope, logAction("READ", "Patient"), viewAllPatients);
router.post("/register", verifyToken, requireRole("hospital_admin", "receptionist", "doctor"), enforceHospitalScope, logAction("CREATE", "Patient"), patientRegister);
router.get("/:id", verifyToken, enforceHospitalScope, logAction("READ", "Patient"), getPatient);
router.put("/:id", verifyToken, requireRole("hospital_admin", "receptionist", "doctor"), enforceHospitalScope, logAction("UPDATE", "Patient"), updatePatient);
router.delete("/:id", verifyToken, requireRole("hospital_admin"), enforceHospitalScope, logAction("DELETE", "Patient"), deletePatient);

module.exports = router;
