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

    // Build threaded structure: separate top-level from replies
    const topLevel = [];
    const repliesMap = {}; // parentCommentId -> [replies]

    for (const comment of comments) {
      const c = comment.toObject();
      c.replies = [];
      if (c.parentCommentId) {
        const parentId = c.parentCommentId.toString();
        if (!repliesMap[parentId]) repliesMap[parentId] = [];
        repliesMap[parentId].push(c);
      } else {
        topLevel.push(c);
      }
    }

    // Attach replies to their parent comments
    for (const comment of topLevel) {
      comment.replies = (repliesMap[comment._id.toString()] || []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    // Sort top-level by newest first
    topLevel.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ count: comments.length, comments: topLevel });
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch comments", error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    if (!postId || !content?.trim()) return res.status(400).json({ message: "postId and content are required" });
    if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "Invalid postId" });

    const post = await Post.findOne({ _id: postId, status: "PUBLISHED" });
    if (!post) return res.status(404).json({ message: "Published post not found" });

    // Validate parent comment if replying
    if (parentCommentId) {
      if (!mongoose.isValidObjectId(parentCommentId)) {
        return res.status(400).json({ message: "Invalid parentCommentId" });
      }
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      // Parent comment must belong to the same post
      if (parentComment.postId.toString() !== postId) {
        return res.status(400).json({ message: "Parent comment belongs to a different post" });
      }
    }

    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
    });
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

    // Also delete any replies to this comment
    await Comment.deleteMany({ parentCommentId: comment._id });
    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully", comment });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };
