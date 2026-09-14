const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const {
  getUsers, getUserById, getMyProfile, updateMyProfile, updateUserStatus,
  followUser, unfollowUser, getMyBookmarks, bookmarkPost, removeBookmark,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);
router.get("/me/bookmarks", protect, getMyBookmarks);
router.get("/", protect, requireAdmin, getUsers);
router.get("/:id", getUserById);
router.post("/:id/follow", protect, followUser);
router.delete("/:id/follow", protect, unfollowUser);
router.post("/bookmarks/:id", protect, bookmarkPost);
router.delete("/bookmarks/:id", protect, removeBookmark);
router.patch("/:id/status", protect, requireAdmin, updateUserStatus);

module.exports = router;
