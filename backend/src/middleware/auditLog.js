const AuditLog = require("../models/AuditLog");

// Middleware to log API actions
const logAction = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    res.json = function(data) {
      // Restore original method
      res.json = originalJson;

      // Log the action asynchronously (don't block response)
      if (req.hospitalId && req.user) {
        AuditLog.create({
          hospitalId: req.hospitalId,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          action,
          resource,
          resourceId: req.params.id || req.params.patientId || req.params.doctorId || null,
          details: {
            method: req.method,
            path: req.path,
            body: sanitizeBody(req.body),
            statusCode: res.statusCode,
            success: data?.success,
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        }).catch(err => console.error("Audit log error:", err));
      }

      return res.json(data);
    };

    next();
  };
};

// Sanitize sensitive fields from request body
const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return {};
  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "apiKey", "secret", "creditCard"];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) sanitized[field] = "***REDACTED***";
  });
  return sanitized;
};

module.exports = {
  logAction,
};
