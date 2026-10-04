const express = require("express");
const protect = require("../middleware/authMiddleware");
const { optionalAuth } = require("../middleware/authMiddleware");
const { apiLimiter } = require("../middleware/rateLimiter");
const {
  getPosts, getPostById, createPost, updatePost, deletePost, likePost, unlikePost,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", optionalAuth, getPosts);
router.get("/:id", optionalAuth, getPostById);
router.post("/", protect, apiLimiter, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, apiLimiter, likePost);
router.delete("/:id/like", protect, unlikePost);

module.exports = router;
