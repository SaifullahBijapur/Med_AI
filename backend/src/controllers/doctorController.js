const Doctor = require("../models/Doctor");
const User = require("../models/User");

// Generate unique doctor code
const generateDoctorCode = async (hospitalId) => {
  const count = await Doctor.countDocuments({ hospitalId });
  const Hospital = require("../models/Hospital");
  const hospital = await Hospital.findById(hospitalId);
  const prefix = hospital ? hospital.slug.substring(0, 3).toUpperCase() : "HOS";
  return `${prefix}-D${String(count + 1).padStart(4, "0")}`;
};

// ==================== LIST DOCTORS (Hospital-scoped) ====================
const listDoctors = async (req, res) => {
  try {
    const { department, availableOnly, limit = 0, page = 1, search } = req.query;
    const hospitalId = req.hospitalId;

    const query = { hospitalId, isActive: true };
    if (department) query.department = department;
    if (availableOnly === "true") query.available = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { doctorCode: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    let dbQuery = Doctor.find(query).sort({ department: 1, name: 1 });
    if (limitNum > 0) dbQuery = dbQuery.limit(limitNum).skip(skip);

    const doctors = await dbQuery.lean();
    const total = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      doctors,
      pagination: limitNum > 0 ? {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      } : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==================== GET SINGLE DOCTOR ====================
const getDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;

    const doctor = await Doctor.findOne({ _id: id, hospitalId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Get today's appointments
    const Appointment = require("../models/Appointment");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAppointments = await Appointment.find({
      hospitalId,
      doctorId: id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      doctor,
      todayAppointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==================== REGISTER DOCTOR ====================
const doctorRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      specialization,
      qualification,
      rating,
      maxPatientsPerDay,
      shift,
      experience,
      workingDays,
      consultationFee,
    } = req.body;

    const hospitalId = req.hospitalId;

    const nameField = (name || "").trim();
    if (!nameField) {
      return res.status(400).json({ success: false, message: "Doctor name is required" });
    }
    if (!department) {
      return res.status(400).json({ success: false, message: "Department is required" });
    }

    // Check hospital's max doctors limit
    const Hospital = require("../models/Hospital");
    const hospital = await Hospital.findById(hospitalId);
    const currentDoctorCount = await Doctor.countDocuments({ hospitalId });
    if (hospital && currentDoctorCount >= hospital.maxDoctors) {
      return res.status(400).json({
        success: false,
        message: `Doctor limit reached. Maximum allowed: ${hospital.maxDoctors}`,
      });
    }

    // Check email uniqueness within hospital
    if (email && email.trim()) {
      const existingDoctor = await Doctor.findOne({ hospitalId, email: email.trim() });
      if (existingDoctor) {
        return res.status(400).json({ success: false, message: "A doctor with this email already exists" });
      }
    }

    const expNum = experience ? parseInt(String(experience)) || 0 : 0;
    const doctorCode = await generateDoctorCode(hospitalId);

    const doctor = await Doctor.create({
      hospitalId,
      doctorCode,
      name: nameField,
      email: email ? email.trim() : "",
      phone: phone || "",
      department,
      specialization: Array.isArray(specialization) ? specialization : (specialization ? [specialization] : []),
      qualification: qualification || "",
      rating: rating ? Number(rating) : undefined,
      maxPatientsPerDay: maxPatientsPerDay ? Number(maxPatientsPerDay) : undefined,
      shift,
      experience: expNum,
      workingDays: Array.isArray(workingDays) ? workingDays : ["monday", "tuesday", "wednesday", "thursday", "friday"],
      consultationFee: consultationFee ? Number(consultationFee) : 0,
    });

    res.status(201).json({ success: true, message: "Doctor registered", doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE DOCTOR ====================
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;
    const updateData = req.body;

    delete updateData.hospitalId;
    delete updateData.doctorCode;

    const doctor = await Doctor.findOneAndUpdate(
      { _id: id, hospitalId },
      { $set: updateData },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Doctor updated", doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE DOCTOR ====================
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;

    const doctor = await Doctor.findOneAndUpdate(
      { _id: id, hospitalId },
      { isActive: false, available: false },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Doctor deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TOGGLE DOCTOR AVAILABILITY ====================
const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospitalId;

    const doctor = await Doctor.findOne({ _id: id, hospitalId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor is now ${doctor.available ? "available" : "unavailable"}`,
      doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDoctors,
  getDoctor,
  doctorRegister,
  updateDoctor,
  deleteDoctor,
  toggleAvailability,
};
