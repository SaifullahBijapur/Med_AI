const { getDashboardSummary, getExpenseSummary } = require("../services/analyticsService");

const getDashboardAnalytics = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const analytics = await getDashboardSummary(hospitalId);

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getExpenseAnalytics = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const analytics = await getExpenseSummary(hospitalId);

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get department-wise analytics
const getDepartmentAnalytics = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;
    const Appointment = require("../models/Appointment");
    const Doctor = require("../models/Doctor");

    const departmentStats = await Appointment.aggregate([
      { $match: { hospitalId: require("mongoose").Types.ObjectId(hospitalId) } },
      { $group: { _id: "$department", count: { $sum: 1 }, emergencyCount: { $sum: { $cond: ["$emergency", 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);

    const doctorCountByDept = await Doctor.aggregate([
      { $match: { hospitalId: require("mongoose").Types.ObjectId(hospitalId), isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      departmentStats,
      doctorCountByDept,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
  getExpenseAnalytics,
  getDepartmentAnalytics,
};
