const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
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
