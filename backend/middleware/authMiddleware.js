const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role isActive");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Not authorized. Account is inactive or no longer exists." });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Invalid or expired token." });
  }
};

/**
 * Optional auth middleware — attaches req.user if a valid token is present,
 * but does NOT fail if no token is provided. Used for public endpoints
 * that need to behave differently for authenticated users (e.g. viewing drafts).
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role isActive");

    if (user && user.isActive) {
      req.user = { id: user._id.toString(), role: user.role };
    }
  } catch {
    // Token invalid or expired — silently continue as unauthenticated
  }
  next();
};

module.exports = protect;
module.exports.optionalAuth = optionalAuth;
