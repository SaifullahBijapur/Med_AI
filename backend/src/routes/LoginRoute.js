const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rateLimiter");
const {
  registerSuperAdmin,
  registerHospitalAdmin,
  register,
  login,
  googleLogin,
  getCurrentUser,
  listUsers,
  updateUser,
  deleteUser,
} = require("../controllers/AuthController");
const { verifyToken, requireRole, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");

// Public routes (with rate limiting)
router.post("/register-superadmin", authLimiter, registerSuperAdmin);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);

// Protected routes
router.get("/me", verifyToken, getCurrentUser);
router.post("/register-hospital-admin", verifyToken, requireRole("superadmin"), authLimiter, registerHospitalAdmin);
router.post("/register", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, authLimiter, register);
router.get("/users", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, logAction("READ", "User"), listUsers);
router.put("/users/:id", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, logAction("UPDATE", "User"), updateUser);
router.delete("/users/:id", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, logAction("DELETE", "User"), deleteUser);

module.exports = router;
