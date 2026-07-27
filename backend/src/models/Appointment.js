const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    appointmentId: {
      type: String,
      unique: true,
      // Auto-generated: H{hospitalCode}-A{sequence}
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
      default: "",
    },
    symptoms: [String],
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    department: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    emergency: {
      type: Boolean,
      default: false,
    },
    queueNumber: {
      type: Number,
      default: 0,
    },
    estimatedWaitTime: {
      type: Number,
      default: 0,
    },
    appointmentDate: {
      type: Date,
      default: Date.now,
    },
    scheduledTime: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled", "No Show"],
      default: "Pending",
    },
    triageConfidence: {
      type: Number,
      default: 0,
    },
    triageReasoning: {
      type: String,
      default: "",
    },
    aiNotes: {
      type: String,
      default: "",
    },
    doctorNotes: {
      type: String,
      default: "",
    },
    prescription: [{
      medicine: String,
      dosage: String,
      frequency: String,
      duration: String,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for hospital-scoped queries
appointmentSchema.index({ hospitalId: 1, status: 1, createdAt: -1 });
appointmentSchema.index({ hospitalId: 1, doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ hospitalId: 1, patientId: 1 });
appointmentSchema.index({ hospitalId: 1, emergency: -1, createdAt: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
