const express = require("express");
const router = express.Router();
const { apiLimiter, authLimiter } = require("../middleware/rateLimiter");
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

// Public routes — strict auth rate limiting
router.post("/register-superadmin", authLimiter, registerSuperAdmin);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);

// Protected routes — general API rate limiting
router.get("/me", verifyToken, apiLimiter, getCurrentUser);

router.post("/register-hospital-admin", verifyToken, requireRole("superadmin"), apiLimiter, registerHospitalAdmin);

router.post("/register", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, register);

router.get("/users", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, logAction("READ", "User"), listUsers);

router.put("/users/:id", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, logAction("UPDATE", "User"), updateUser);

router.delete("/users/:id", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, logAction("DELETE", "User"), deleteUser);

module.exports = router;
