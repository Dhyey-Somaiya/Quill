const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { apiLimiter } = require("../middleware/rateLimiter");
const { getTags, createTag, updateTag, deleteTag, mergeTags, getTagsWithCounts } = require("../controllers/tagController");

const router = express.Router();

router.get("/", getTags);
router.get("/with-counts", getTagsWithCounts);
router.post("/", protect, apiLimiter, createTag);
router.post("/merge", protect, requireAdmin, mergeTags);
router.put("/:id", protect, requireAdmin, updateTag);
router.delete("/:id", protect, requireAdmin, deleteTag);

module.exports = router;
