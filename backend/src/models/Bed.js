const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
        index: true,
    },
    wardName: {
        type: String,
        required: true,
    },
    roomNumber: {
        type: String,
        required: true,
    },
    bedNumber: {
        type: String,
        required: true,
    },
    bedCode: {
        type: String,
        unique: true,
        // Auto-generated
    },
    bedType: {
        type: String,
        enum: ["General", "Semi-Private", "Private", "ICU", "NICU", "Emergency"],
        default: "General",
    },
    department: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["available", "occupied", "reserved", "maintenance", "cleaning"],
        default: "available",
    },
    occupiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        default: null,
    },
    occupiedSince: {
        type: Date,
    },
    expectedDischarge: {
        type: Date,
    },
    dailyRate: {
        type: Number,
        default: 0,
    },
    facilities: [String],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Compound index for unique beds per hospital
bedSchema.index({ hospitalId: 1, wardName: 1, roomNumber: 1, bedNumber: 1 }, { unique: true });
bedSchema.index({ hospitalId: 1, status: 1 });
bedSchema.index({ hospitalId: 1, department: 1, status: 1 });

module.exports = mongoose.model("Bed", bedSchema);
