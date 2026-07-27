const Hospital = require("../models/Hospital");

// Middleware to extract and validate hospital scope from request
// Supports: X-Hospital-ID header, subdomain, or query param
const extractHospitalScope = async (req, res, next) => {
  try {
    let hospitalId = null;
    let hospitalSlug = null;

    // Priority 1: X-Hospital-ID header
    if (req.headers["x-hospital-id"]) {
      hospitalId = req.headers["x-hospital-id"];
    }
    // Priority 2: Subdomain (hospital-slug.medi-hive.com)
    else if (req.headers.host) {
      const subdomain = req.headers.host.split(".")[0];
      if (subdomain && subdomain !== "www" && subdomain !== "api") {
        hospitalSlug = subdomain;
      }
    }
    // Priority 3: Query parameter
    else if (req.query.hospitalId) {
      hospitalId = req.query.hospitalId;
    }

    // If we have a slug, look up the hospital
    if (hospitalSlug && !hospitalId) {
      const hospital = await Hospital.findOne({ slug: hospitalSlug, status: "active" });
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found or inactive.",
        });
      }
      hospitalId = hospital._id;
    }

    // Validate hospital exists and is active
    if (hospitalId) {
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found.",
        });
      }
      if (hospital.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Hospital is currently suspended or inactive.",
        });
      }
      req.hospitalId = hospitalId;
      req.hospital = hospital;
    }

    next();
  } catch (error) {
    console.error("Hospital scope middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Error validating hospital scope.",
    });
  }
};

// Middleware to enforce hospital scope on all queries
// Must be used AFTER verifyToken
const enforceHospitalScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  // Superadmin bypasses hospital scope for cross-hospital operations
  if (req.user.role === "superadmin") {
    // If superadmin explicitly sets a hospitalId, use it
    if (!req.hospitalId && req.user.hospitalId) {
      req.hospitalId = req.user.hospitalId;
    }
    return next();
  }

  // For non-superadmin users, enforce their assigned hospital
  if (!req.hospitalId) {
    req.hospitalId = req.user.hospitalId;
  }

  // Ensure the user can only access their own hospital
  if (String(req.hospitalId) !== String(req.user.hospitalId)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your assigned hospital's data.",
    });
  }

  next();
};

module.exports = {
  extractHospitalScope,
  enforceHospitalScope,
};
