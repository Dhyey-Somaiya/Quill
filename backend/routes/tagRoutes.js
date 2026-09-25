const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getTags, createTag, updateTag, deleteTag } = require("../controllers/tagController");

const router = express.Router();

router.get("/", getTags);
router.post("/", protect, createTag);
router.put("/:id", protect, requireAdmin, updateTag);
router.delete("/:id", protect, requireAdmin, deleteTag);

module.exports = router;
