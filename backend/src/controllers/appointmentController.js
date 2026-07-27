const { analyzeSymptoms } = require("../services/triageAgent");
const { assignDoctor } = require("../services/doctorAssignmentService");
const { createAppointment } = require("../services/appointmentService");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

// ==================== BOOK APPOINTMENT ====================
const bookAppointment = async (req, res) => {
  try {
    const { patientName, patientPhone, symptoms, department, emergency, status, patientId } = req.body;
    const hospitalId = req.hospitalId;

    if (!patientName?.trim()) {
      return res.status(400).json({ success: false, message: "Patient name is required" });
    }
    if (!symptoms?.length) {
      return res.status(400).json({ success: false, message: "Symptoms are required for triage" });
    }
    if (patientPhone && !/^\+?[\d\s\-().]{7,15}$/.test(patientPhone.trim())) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    const triage = await analyzeSymptoms(symptoms, hospitalId);

    // User-supplied emergency flag overrides triage
    if (emergency === true || emergency === "true") triage.emergency = true;
    // User-supplied department preference overrides triage (unless emergency)
    if (department && !triage.emergency) triage.department = department;

    const doctor = await assignDoctor(triage.department, triage.emergency, hospitalId);
    const appointmentId = `MH-${Date.now()}`;

    // If patientId provided, link to existing patient
    let linkedPatientId = patientId || null;
    if (!linkedPatientId && patientPhone) {
      const existingPatient = await Patient.findOne({ hospitalId, phone: patientPhone });
      if (existingPatient) linkedPatientId = existingPatient._id;
    }

    const appointment = await createAppointment({
      hospitalId,
      appointmentId,
      patientId: linkedPatientId,
      patientName: patientName.trim(),
      patientPhone: patientPhone?.trim() || "",
      symptoms,
      doctor,
      triage,
      status: status || "Pending",
      createdBy: req.userId,
    });

    // Update patient last visit if linked
    if (linkedPatientId) {
      await Patient.findByIdAndUpdate(linkedPatientId, {
        lastVisitDate: new Date(),
        $inc: { totalVisits: 1 },
      });
    }

    const result = appointment.toObject();
    result.doctorName = doctor.name;

    res.json({
      success: true,
      triage,
      doctor: { id: doctor._id, name: doctor.name, department: doctor.department },
      appointment: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LIST APPOINTMENTS (Hospital-scoped) ====================
const listAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date, emergency, page = 1, limit = 20 } = req.query;
    const hospitalId = req.hospitalId;

    const query = { hospitalId };
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (emergency === "true") query.emergency = true;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: start, $lte: end };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const appointments = await Appointment.find(query)
      .populate("doctorId", "name department")
      .populate("patientId", "fullName phone patientCode")
      .sort({ emergency: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET SINGLE APPOINTMENT ====================
const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;

    const appointment = await Appointment.findOne({ _id: id, hospitalId })
      .populate("doctorId", "name department phone")
      .populate("patientId", "fullName phone age gender bloodGroup medicalHistory");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE APPOINTMENT STATUS ====================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes, prescription } = req.body;
    const hospitalId = req.hospitalId;

    const updateData = {};
    if (status) updateData.status = status;
    if (doctorNotes) updateData.doctorNotes = doctorNotes;
    if (prescription) updateData.prescription = prescription;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, hospitalId },
      { $set: updateData },
      { new: true }
    ).populate("doctorId", "name department");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, message: "Appointment updated", appointment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE APPOINTMENT ====================
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;

    const appointment = await Appointment.findOneAndDelete({ _id: id, hospitalId });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Decrement doctor queue load
    const Doctor = require("../models/Doctor");
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      $inc: { currentQueueLoad: -1, patientsToday: -1 },
    });

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  listAppointments,
  getAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};
