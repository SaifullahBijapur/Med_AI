const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    userEmail: {
        type: String,
    },
    userRole: {
        type: String,
    },
    action: {
        type: String,
        required: true,
        enum: ["CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "EXPORT", "PRINT"],
    },
    resource: {
        type: String,
        required: true,
        // e.g., "Patient", "Doctor", "Appointment", "Report"
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: Object,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

auditLogSchema.index({ hospitalId: 1, timestamp: -1 });
auditLogSchema.index({ hospitalId: 1, userId: 1, timestamp: -1 });
auditLogSchema.index({ hospitalId: 1, action: 1, resource: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
