const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getDashboard } = require("../controllers/adminController");

const router = express.Router();

router.use(protect, requireAdmin);
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Admin access granted", user: req.user });
});
router.get("/dashboard", getDashboard);

module.exports = router;
