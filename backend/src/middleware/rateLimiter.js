const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 25 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 25 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// AI endpoint limiter (Gemini API calls are expensive)
const aiLimiter = rateLimit({
  windowMs: 120 * 1000, // 1 minute
  max: 50, // 30 AI calls per minute per hospital
  keyGenerator: (req) => req.hospitalId || ipKeyGenerator(req.ip),
  message: {
    success: false,
    message: "AI rate limit exceeded. Please try again in a minute.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
};
