const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    reportType: {
      type: String,
      enum: ["Lab", "Radiology", "Pathology", "Discharge Summary", "Prescription", "Other"],
      default: "Other",
    },
    reportUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      default: "",
    },
    mimeType: {
      type: String,
      default: "",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    aiConfidence: {
      type: Number,
      default: 0,
    },
    doctorReviewed: {
      type: Boolean,
      default: false,
    },
    doctorNotes: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ hospitalId: 1, patientId: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
