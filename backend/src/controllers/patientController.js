const Patient = require("../models/Patient");
const User = require("../models/User");

// Generate unique patient code
const generatePatientCode = async (hospitalId) => {
  const count = await Patient.countDocuments({ hospitalId });
  const Hospital = require("../models/Hospital");
  const hospital = await Hospital.findById(hospitalId);
  const prefix = hospital ? hospital.slug.substring(0, 3).toUpperCase() : "HOS";
  return `${prefix}-P${String(count + 1).padStart(4, "0")}`;
};

// ==================== REGISTER PATIENT ====================
const patientRegister = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      symptoms,
      medicalHistory,
      allergies,
      currentMedications,
      emergencyContact,
    } = req.body;

    if (!fullName?.trim()) {
      return res.status(400).json({ success: false, message: "Patient name is required" });
    }
    if (!age) {
      return res.status(400).json({ success: false, message: "Age is required" });
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone is required" });
    }

    const hospitalId = req.hospitalId;

    // Check for duplicate phone in same hospital
    const existingPatient = await Patient.findOne({ hospitalId, phone });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "A patient with this phone number already exists in this hospital.",
        patient: existingPatient,
      });
    }

    const patientCode = await generatePatientCode(hospitalId);

    const patient = await Patient.create({
      hospitalId,
      patientCode,
      fullName: fullName.trim(),
      age: parseInt(age),
      gender,
      phone,
      email: email || "",
      address,
      bloodGroup,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? symptoms.split(",").map(s => s.trim()).filter(Boolean) : []),
      medicalHistory: Array.isArray(medicalHistory) ? medicalHistory : [],
      allergies: Array.isArray(allergies) ? allergies : [],
      currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
      emergencyContact,
      registrationDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==================== VIEW ALL PATIENTS (Hospital-scoped) ====================
const viewAllPatients = async (req, res) => {
  try {
    const { search, limit = 0, page = 1 } = req.query;
    const hospitalId = req.hospitalId;

    const query = { hospitalId };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { patientCode: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    let dbQuery = Patient.find(query).sort({ createdAt: -1 });
    if (limitNum > 0) dbQuery = dbQuery.limit(limitNum).skip(skip);

    const patients = await dbQuery.lean();
    const total = await Patient.countDocuments(query);

    res.status(200).json({
      success: true,
      patients,
      pagination: limitNum > 0 ? {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      } : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==================== GET SINGLE PATIENT ====================
const getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;

    const patient = await Patient.findOne({ _id: id, hospitalId })
      .populate("userId", "name email");

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Get patient's appointment history
    const Appointment = require("../models/Appointment");
    const appointments = await Appointment.find({ hospitalId, patientId: id })
      .populate("doctorId", "name department")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      patient,
      recentAppointments: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==================== UPDATE PATIENT ====================
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;
    const updateData = req.body;

    // Prevent changing hospitalId
    delete updateData.hospitalId;
    delete updateData.patientCode;

    const patient = await Patient.findOneAndUpdate(
      { _id: id, hospitalId },
      { $set: updateData },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.status(200).json({ success: true, message: "Patient updated successfully", patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==================== DELETE PATIENT ====================
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;

    const patient = await Patient.findOneAndDelete({ _id: id, hospitalId });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  patientRegister,
  viewAllPatients,
  getPatient,
  updatePatient,
  deletePatient,
};
