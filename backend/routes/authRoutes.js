const express = require("express");
const {
    registerUser,
    loginUser,
    changePassword,
    googleLogin,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/google", authLimiter, googleLogin);
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.patch("/change-password", protect, changePassword);

module.exports = router;
