const rateLimit = require("express-rate-limit");

// Strict limiter for authentication endpoints (login/register)
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 15, // 15 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

// Standard limiter for write endpoints (posts, comments, likes, follows)
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX, 10) || 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

module.exports = { authLimiter, apiLimiter };
