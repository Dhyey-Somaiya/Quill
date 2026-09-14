const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getPosts, getPostById, createPost, updatePost, deletePost, likePost, unlikePost,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);
router.delete("/:id/like", protect, unlikePost);

module.exports = router;
