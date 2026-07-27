const Hospital = require("../models/Hospital");
const User = require("../models/User");

// ==================== CREATE HOSPITAL (Superadmin only) ====================
exports.createHospital = async (req, res) => {
  try {
    const {
      name,
      slug,
      email,
      phone,
      address,
      licenseNumber,
      departments,
      maxDoctors,
      maxPatientsPerMonth,
      settings,
    } = req.body;

    // Check if slug already exists
    const existingSlug = await Hospital.findOne({ slug: slug.toLowerCase() });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Hospital slug already exists. Choose a unique slug.",
      });
    }

    // Check if license number exists
    if (licenseNumber) {
      const existingLicense = await Hospital.findOne({ licenseNumber });
      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: "License number already registered.",
        });
      }
    }

    const hospital = await Hospital.create({
      name,
      slug: slug.toLowerCase(),
      email,
      phone: phone || "",
      address,
      licenseNumber,
      departments: departments || undefined,
      maxDoctors: maxDoctors || 10,
      maxPatientsPerMonth: maxPatientsPerMonth || 500,
      settings,
      createdBy: req.userId,
    });

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LIST ALL HOSPITALS (Superadmin only) ====================
exports.listHospitals = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const hospitals = await Hospital.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hospital.countDocuments(query);

    // Get stats for each hospital
    const hospitalsWithStats = await Promise.all(
      hospitals.map(async (h) => {
        const doctorCount = await require("../models/Doctor").countDocuments({ hospitalId: h._id });
        const patientCount = await require("../models/Patient").countDocuments({ hospitalId: h._id });
        const appointmentCount = await require("../models/Appointment").countDocuments({ hospitalId: h._id });
        const adminCount = await User.countDocuments({ hospitalId: h._id, role: "hospital_admin" });

        return {
          ...h.toObject(),
          stats: {
            doctors: doctorCount,
            patients: patientCount,
            appointments: appointmentCount,
            admins: adminCount,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      hospitals: hospitalsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET SINGLE HOSPITAL ====================
exports.getHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    // Get stats
    const Doctor = require("../models/Doctor");
    const Patient = require("../models/Patient");
    const Appointment = require("../models/Appointment");

    const stats = {
      doctors: await Doctor.countDocuments({ hospitalId: hospital._id }),
      patients: await Patient.countDocuments({ hospitalId: hospital._id }),
      appointments: await Appointment.countDocuments({ hospitalId: hospital._id }),
      todayAppointments: await Appointment.countDocuments({
        hospitalId: hospital._id,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    };

    res.status(200).json({
      success: true,
      hospital: { ...hospital.toObject(), stats },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE HOSPITAL ====================
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent changing slug
    delete updateData.slug;

    const hospital = await Hospital.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      hospital,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE HOSPITAL STATUS ====================
exports.updateHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: active, suspended, inactive",
      });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    res.status(200).json({
      success: true,
      message: `Hospital status updated to ${status}`,
      hospital,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE HOSPITAL ====================
exports.deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    // Soft delete - mark as inactive instead of hard delete
    hospital.status = "inactive";
    await hospital.save();

    // Deactivate all users in this hospital
    await User.updateMany({ hospitalId: id }, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Hospital deactivated successfully. All associated users have been deactivated.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET HOSPITAL ANALYTICS (Superadmin) ====================
exports.getGlobalAnalytics = async (req, res) => {
  try {
    const Hospital = require("../models/Hospital");
    const Doctor = require("../models/Doctor");
    const Patient = require("../models/Patient");
    const Appointment = require("../models/Appointment");
    const Expense = require("../models/Expense");

    const totalHospitals = await Hospital.countDocuments({ status: "active" });
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Hospital growth over time
    const hospitalGrowth = await Hospital.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top performing hospitals by appointments
    const topHospitals = await Appointment.aggregate([
      {
        $group: {
          _id: "$hospitalId",
          appointmentCount: { $sum: 1 },
        },
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "hospitals",
          localField: "_id",
          foreignField: "_id",
          as: "hospital",
        },
      },
      { $unwind: "$hospital" },
      {
        $project: {
          hospitalName: "$hospital.name",
          appointmentCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalHospitals,
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalExpenses: totalExpenses[0]?.total || 0,
        hospitalGrowth,
        topHospitals,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
