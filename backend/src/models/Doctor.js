const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
        index: true,
    },
    // Link to User model for login
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    doctorCode: {
        type: String,
        unique: true,
        // Auto-generated: H{hospitalCode}-D{sequence}
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    department: {
        type: String,
        required: true,
    },
    specialization: [String],
    qualification: {
        type: String,
        default: "",
    },
    experience: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 4.0,
        min: 1,
        max: 5,
    },
    available: {
        type: Boolean,
        default: true,
    },
    patientsToday: {
        type: Number,
        default: 0,
    },
    maxPatientsPerDay: {
        type: Number,
        default: 20,
    },
    currentQueueLoad: {
        type: Number,
        default: 0,
    },
    emergencyCasesHandled: {
        type: Number,
        default: 0,
    },
    shift: {
        type: String,
        enum: ["morning", "evening", "night", "full-day"],
        default: "morning",
    },
    workingDays: {
        type: [String],
        default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    consultationFee: {
        type: Number,
        default: 0,
    },
    lastAssignedAt: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Compound indexes
doctorSchema.index({ hospitalId: 1, department: 1, available: 1 });
doctorSchema.index({ hospitalId: 1, name: "text" });
doctorSchema.index({ hospitalId: 1, currentQueueLoad: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
