const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      // Required only for non-OAuth users
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["superadmin", "hospital_admin", "doctor", "receptionist", "patient"],
      default: "patient",
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      // Required for all roles except superadmin
      required: function() {
        return this.role !== "superadmin";
      },
    },
    // For doctors: link to Doctor model
    doctorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    // For patients: link to Patient model
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    phone: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for hospital-scoped user queries
userSchema.index({ hospitalId: 1, role: 1 });
userSchema.index({ email: 1, hospitalId: 1 });

module.exports = mongoose.model("User", userSchema);
