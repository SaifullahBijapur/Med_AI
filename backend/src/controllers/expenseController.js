const { getExpenseSummary } = require("../services/analyticsService");
const Expense = require("../models/Expense");

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

// Create expense
const createExpense = async (req, res) => {
  try {
    const { department, amount, category, description, expenseDate } = req.body;
    const hospitalId = req.hospitalId;

    if (!department || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Department, amount, and category are required",
      });
    }

    const expense = await Expense.create({
      hospitalId,
      department,
      amount: Number(amount),
      category,
      description: description || "",
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      approvedBy: req.userId,
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List expenses
const listExpenses = async (req, res) => {
  try {
    const { department, category, startDate, endDate, page = 1, limit = 20 } = req.query;
    const hospitalId = req.hospitalId;

    const query = { hospitalId };
    if (department) query.department = department;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const expenses = await Expense.find(query)
      .populate("approvedBy", "name")
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      expenses,
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

module.exports = {
  getExpenseAnalytics,
  createExpense,
  listExpenses,
};
