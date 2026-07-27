const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token and attach user to request
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact admin.",
      });
    }

    req.user = user;
    req.userId = user._id;
    req.hospitalId = user.hospitalId;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Check if user has required role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

// Check if user belongs to the requested hospital (for hospital-scoped routes)
const requireHospitalAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  // Superadmin can access any hospital
  if (req.user.role === "superadmin") {
    return next();
  }

  // For hospital-scoped routes, check hospitalId match
  const requestedHospitalId = req.params.hospitalId || req.body.hospitalId || req.query.hospitalId;

  if (requestedHospitalId && requestedHospitalId !== String(req.user.hospitalId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You do not have permission to access this hospital's data.",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  requireRole,
  requireHospitalAccess,
};
