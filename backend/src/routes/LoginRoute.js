const express = require("express");
const router = express.Router();
const rateLimiters = require("../middleware/rateLimiter");
console.log("=== DEBUG IMPORTS ===");
console.log("rateLimiter exports:", Object.keys(rateLimiters));
console.log("apiLimiter type:", typeof rateLimiters.apiLimiter);
console.log("authLimiter type:", typeof rateLimiters.authLimiter);

const { apiLimiter, authLimiter } = rateLimiters;
const authStuff = require("../middleware/auth");
console.log("auth exports:", Object.keys(authStuff));
console.log("verifyToken type:", typeof authStuff.verifyToken);
console.log("requireRole type:", typeof authStuff.requireRole);
console.log("enforceHospitalScope type:", typeof authStuff.enforceHospitalScope);

const auditStuff = require("../middleware/auditLog");
console.log("auditLog exports:", Object.keys(auditStuff));
console.log("logAction type:", typeof auditStuff.logAction);

const ctrl = require("../controllers/AuthController");
console.log("AuthController exports:", Object.keys(ctrl));
console.log("register type:", typeof ctrl.register);
console.log("updateUser type:", typeof ctrl.updateUser);
console.log("deleteUser type:", typeof ctrl.deleteUser);
console.log("=====================");







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

// Public routes — strict auth limiting
router.post("/register-superadmin", authLimiter, registerSuperAdmin);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);

// Protected routes — general API limiting
router.get("/me", verifyToken, apiLimiter, getCurrentUser);

router.post("/register-hospital-admin", verifyToken, requireRole("superadmin"), apiLimiter, registerHospitalAdmin);

router.post("/register", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, register);

router.get("/users", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, logAction("READ", "User"), listUsers);

router.put("/users/:id", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, logAction("UPDATE", "User"), updateUser);

router.delete("/users/:id", verifyToken, requireRole("superadmin", "hospital_admin"), enforceHospitalScope, apiLimiter, logAction("DELETE", "User"), deleteUser);

module.exports = router;