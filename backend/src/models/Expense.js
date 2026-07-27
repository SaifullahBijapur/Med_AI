const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Medicines", "Equipment", "Salaries", "Utilities", "Maintenance", "Other"],
      default: "Other",
    },
    description: {
      type: String,
      default: "",
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ hospitalId: 1, expenseDate: -1 });
expenseSchema.index({ hospitalId: 1, department: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
