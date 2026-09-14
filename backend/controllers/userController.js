const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

const publicFields = "-password";

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select(publicFields).sort({ createdAt: -1 });
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
    const user = await User.findById(req.params.id).select(publicFields);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select(publicFields);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ user });
};

const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "bio"];
    const updates = {};
    for (const field of allowedFields) if (req.body[field] !== undefined) updates[field] = req.body[field];

    if (updates.name !== undefined && !updates.name.trim()) return res.status(400).json({ message: "Name cannot be empty" });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select(publicFields);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: "Failed to update profile", error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return res.status(400).json({ message: "isActive must be true or false" });
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true, runValidators: true }).select(publicFields);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User status updated", user });
  } catch (error) {
    res.status(400).json({ message: "Failed to update user status", error: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ message: "Invalid user ID" });
    if (targetId === req.user.id) return res.status(400).json({ message: "You cannot follow yourself" });

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    await Promise.all([
      User.updateOne({ _id: req.user.id }, { $addToSet: { following: targetId } }),
      User.updateOne({ _id: targetId }, { $addToSet: { followers: req.user.id } }),
    ]);

    res.status(200).json({ message: "User followed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to follow user", error: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ message: "Invalid user ID" });

    await Promise.all([
      User.updateOne({ _id: req.user.id }, { $pull: { following: targetId } }),
      User.updateOne({ _id: targetId }, { $pull: { followers: req.user.id } }),
    ]);

    res.status(200).json({ message: "User unfollowed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to unfollow user", error: error.message });
  }
};

const getMyBookmarks = async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "bookmarks",
    populate: [
      { path: "authorId", select: "name bio" },
      { path: "categoryId", select: "name" },
      { path: "tags", select: "name slug" },
    ],
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ count: user.bookmarks.length, posts: user.bookmarks });
};

const bookmarkPost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });
    const post = await Post.findOne({ _id: req.params.id, status: "PUBLISHED" });
    if (!post) return res.status(404).json({ message: "Post not found" });

    await User.updateOne({ _id: req.user.id }, { $addToSet: { bookmarks: post._id } });
    res.status(200).json({ message: "Post bookmarked" });
  } catch (error) {
    res.status(500).json({ message: "Failed to bookmark post", error: error.message });
  }
};

const removeBookmark = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });
    await User.updateOne({ _id: req.user.id }, { $pull: { bookmarks: req.params.id } });
    res.status(200).json({ message: "Bookmark removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove bookmark", error: error.message });
  }
};

module.exports = {
  getUsers, getUserById, getMyProfile, updateMyProfile, updateUserStatus,
  followUser, unfollowUser, getMyBookmarks, bookmarkPost, removeBookmark,
};
