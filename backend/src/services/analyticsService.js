const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Expense = require("../models/Expense");
const Patient = require("../models/Patient");
const Bed = require("../models/Bed");

const getDashboardSummary = async (hospitalId) => {
  const query = hospitalId ? { hospitalId } : {};

  const totalDoctors = await Doctor.countDocuments({ ...query, isActive: true });
  const totalPatients = await Patient.countDocuments(query);
  const totalAppointments = await Appointment.countDocuments(query);
  const emergencyAppointments = await Appointment.countDocuments({ ...query, emergency: true });

  const departmentStats = await Appointment.aggregate([
    { $match: query },
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const avgQueue = await Doctor.aggregate([
    { $match: { ...query, isActive: true } },
    {
      $group: {
        _id: null,
        averageQueueLoad: { $avg: "$currentQueueLoad" },
      },
    },
  ]);

  // Bed occupancy stats
  const totalBeds = await Bed.countDocuments({ ...query, isActive: true });
  const occupiedBeds = await Bed.countDocuments({ ...query, status: "occupied" });

  // Today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAppointments = await Appointment.countDocuments({
    ...query,
    createdAt: { $gte: today },
  });

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    emergencyAppointments,
    todayAppointments,
    topDepartment: departmentStats[0]?._id || "N/A",
    averageQueueLoad: avgQueue[0]?.averageQueueLoad || 0,
    bedStats: {
      total: totalBeds,
      occupied: occupiedBeds,
      available: totalBeds - occupiedBeds,
      occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0,
    },
  };
};

const getExpenseSummary = async (hospitalId) => {
  const query = hospitalId ? { hospitalId } : {};

  const totalExpenses = await Expense.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const departmentExpenses = await Expense.aggregate([
    { $match: query },
    { $group: { _id: "$department", totalExpense: { $sum: "$amount" } } },
    { $sort: { totalExpense: -1 } },
  ]);

  const categoryExpenses = await Expense.aggregate([
    { $match: query },
    { $group: { _id: "$category", totalExpense: { $sum: "$amount" } } },
    { $sort: { totalExpense: -1 } },
  ]);

  // Monthly trend
  const monthlyExpenses = await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$expenseDate" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalExpenses: totalExpenses[0]?.total || 0,
    departmentExpenses,
    categoryExpenses,
    monthlyExpenses,
  };
};

module.exports = {
  getDashboardSummary,
  getExpenseSummary,
};
