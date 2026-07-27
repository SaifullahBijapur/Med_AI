const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: "",
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: "India" },
    },
    licenseNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        enum: ["active", "suspended", "inactive"],
        default: "active",
    },
    subscriptionPlan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
    },
    subscriptionExpiry: {
        type: Date,
    },
    maxDoctors: {
        type: Number,
        default: 10,
    },
    maxPatientsPerMonth: {
        type: Number,
        default: 500,
    },
    departments: {
        type: [String],
        default: ["Cardiology", "Neurology", "Orthopedics", "Gastroenterology", 
                  "Pulmonology", "Dermatology", "Pediatrics", "Gynecology"],
    },
    settings: {
        aiTriageEnabled: { type: Boolean, default: true },
        autoDoctorAssignment: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        workingHours: {
            start: { type: String, default: "09:00" },
            end: { type: String, default: "18:00" },
        },
        timezone: { type: String, default: "Asia/Kolkata" },
    },
    logo: {
        type: String,
        default: "",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

// Index for fast lookup by slug
hospitalSchema.index({ slug: 1 });
hospitalSchema.index({ status: 1 });

module.exports = mongoose.model("Hospital", hospitalSchema);
