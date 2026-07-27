const express = require("express");
const router = express.Router();
const { verifyToken, requireRole, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const {
  bookAppointment,
  listAppointments,
  getAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");

router.post("/book", verifyToken, requireRole("hospital_admin", "receptionist", "patient"), enforceHospitalScope, logAction("CREATE", "Appointment"), bookAppointment);
router.get("/", verifyToken, enforceHospitalScope, logAction("READ", "Appointment"), listAppointments);
router.get("/:id", verifyToken, enforceHospitalScope, logAction("READ", "Appointment"), getAppointment);
router.put("/:id/status", verifyToken, requireRole("hospital_admin", "doctor", "receptionist"), enforceHospitalScope, logAction("UPDATE", "Appointment"), updateAppointmentStatus);
router.delete("/:id", verifyToken, requireRole("hospital_admin", "receptionist"), enforceHospitalScope, logAction("DELETE", "Appointment"), deleteAppointment);

module.exports = router;
