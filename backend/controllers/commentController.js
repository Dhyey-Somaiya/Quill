const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const getComments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.postId) {
      if (!mongoose.isValidObjectId(req.query.postId)) return res.status(400).json({ message: "Invalid postId" });
      filter.postId = req.query.postId;
    }
    if (req.query.approved !== undefined) {
      filter.isApproved = req.query.approved === "true";
    }
    const comments = await Comment.find(filter)
      .populate("userId", "name bio")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: comments.length, comments });
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch comments", error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    if (!postId || !content?.trim()) return res.status(400).json({ message: "postId and content are required" });
    if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "Invalid postId" });

    const post = await Post.findOne({ _id: postId, status: "PUBLISHED" });
    if (!post) return res.status(404).json({ message: "Published post not found" });

    const comment = await Comment.create({ postId, userId: req.user.id, content: content.trim() });
    const populated = await Comment.findById(comment._id).populate("userId", "name bio");
    res.status(201).json({ message: "Comment created successfully", comment: populated });
  } catch (error) {
    res.status(400).json({ message: "Failed to create comment", error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid comment ID" });
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.userId.toString() === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "You are not allowed to update this comment" });

    if (req.body.content !== undefined) {
      if (!req.body.content.trim()) return res.status(400).json({ message: "Comment content cannot be empty" });
      comment.content = req.body.content.trim();
    }
    if (isAdmin && req.body.isApproved !== undefined) {
      if (typeof req.body.isApproved !== "boolean") return res.status(400).json({ message: "isApproved must be true or false" });
      comment.isApproved = req.body.isApproved;
    }
    comment.updatedAt = new Date();
    await comment.save();
    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    res.status(400).json({ message: "Failed to update comment", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid comment ID" });
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.userId.toString() === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "You are not allowed to delete this comment" });

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully", comment });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };
