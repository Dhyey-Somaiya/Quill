const express = require("express");
const { submitContact } = require("../controllers/contactController");
const { apiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// POST /api/v1/contact — public, rate-limited
router.post("/", apiLimiter, submitContact);

module.exports = router;

