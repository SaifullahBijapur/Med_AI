const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    // Link to User model for patient portal login
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    patientCode: {
      type: String,
      unique: true,
      // Auto-generated: H{hospitalCode}-P{sequence}
    },
    fullName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    symptoms: [String],
    medicalHistory: [String],
    allergies: [String],
    currentMedications: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    lastVisitDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for hospital-scoped queries
patientSchema.index({ hospitalId: 1, fullName: "text", phone: "text" });
patientSchema.index({ hospitalId: 1, createdAt: -1 });
patientSchema.index({ hospitalId: 1, patientCode: 1 });

module.exports = mongoose.model("Patient", patientSchema);
