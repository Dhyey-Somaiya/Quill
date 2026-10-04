const express = require("express");
const protect = require("../middleware/authMiddleware");
const { apiLimiter } = require("../middleware/rateLimiter");
const { getComments, createComment, updateComment, deleteComment } = require("../controllers/commentController");

const router = express.Router();

router.get("/", getComments);
router.post("/", protect, apiLimiter, createComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
