const mongoose = require("mongoose");
const Post = require("../models/Post");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { sanitizeContent } = require("../utils/sanitize");

const MAX_TAGS_PER_POST = 5;

// Simple in-memory cache for view deduplication (cleared every hour)
const viewedPosts = new Map();
setInterval(() => viewedPosts.clear(), 60 * 60 * 1000);

const getPosts = async (req, res) => {
  try {
    const { categoryId, tagId, authorId, status, search, page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const filter = {};

    if (categoryId) {
      if (!mongoose.isValidObjectId(categoryId)) return res.status(400).json({ message: "Invalid categoryId" });
      filter.categoryId = categoryId;
    }
    if (tagId) {
      if (!mongoose.isValidObjectId(tagId)) return res.status(400).json({ message: "Invalid tagId" });
      filter.tags = tagId;
    }
    if (authorId) {
      if (!mongoose.isValidObjectId(authorId)) return res.status(400).json({ message: "Invalid authorId" });
      filter.authorId = authorId;
    }

    // Draft privacy enforcement:
    // - DRAFT posts can only be fetched by their author or an admin
    // - Public requests always see only PUBLISHED posts
    if (status === "DRAFT") {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required to view drafts" });
      }
      filter.status = "DRAFT";
      // Non-admin users can only see their own drafts
      if (req.user.role !== "ADMIN") {
        filter.authorId = req.user.id;
      }
    } else if (status === "PUBLISHED") {
      filter.status = "PUBLISHED";
    } else {
      // Default: only published posts
      filter.status = "PUBLISHED";
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { content: { $regex: escaped, $options: "i" } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("authorId", "name bio")
        .populate("categoryId", "name description")
        .populate("tags", "name slug")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      count: posts.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });

    const post = await Post.findById(req.params.id)
      .populate("authorId", "name bio")
      .populate("categoryId", "name description")
      .populate("tags", "name slug");

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.status !== "PUBLISHED" && (!req.user || (req.user.role !== "ADMIN" && post.authorId?._id?.toString() !== req.user.id))) {
      return res.status(404).json({ message: "Post not found" });
    }

    const viewerId = req.user ? req.user.id : (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'anonymous');
    const viewKey = `${post._id}_${viewerId}`;

    if (!viewedPosts.has(viewKey)) {
      await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });
      post.views += 1;
      viewedPosts.set(viewKey, true);
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch post", error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, categoryId, tags = [], coverImage = "", status = "DRAFT" } = req.body;

    if (!title?.trim() || !content?.trim() || !categoryId) {
      return res.status(400).json({ message: "Title, content and categoryId are required" });
    }
    if (!mongoose.isValidObjectId(categoryId)) return res.status(400).json({ message: "Invalid categoryId" });
    if (!["DRAFT", "PUBLISHED"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    if (!Array.isArray(tags)) return res.status(400).json({ message: "tags must be an array" });

    const uniqueTags = [...new Set(tags.map(String))];

    // Enforce max tags per post
    if (uniqueTags.length > MAX_TAGS_PER_POST) {
      return res.status(400).json({ message: `A post can have at most ${MAX_TAGS_PER_POST} tags` });
    }

    const categoryExists = await Category.exists({ _id: categoryId });
    if (!categoryExists) return res.status(400).json({ message: "Category not found" });

    if (uniqueTags.some((id) => !mongoose.isValidObjectId(id))) return res.status(400).json({ message: "Invalid tag ID" });
    if (uniqueTags.length && await Tag.countDocuments({ _id: { $in: uniqueTags } }) !== uniqueTags.length) {
      return res.status(400).json({ message: "One or more tags not found" });
    }

    // Sanitize HTML content server-side
    const sanitizedContent = sanitizeContent(content);

    const post = await Post.create({
      title: title.trim(),
      content: sanitizedContent,
      authorId: req.user.id,
      categoryId,
      tags: uniqueTags,
      coverImage,
      status,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.user.role !== "ADMIN" && post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to update this post" });
    }

    const allowedFields = ["title", "content", "categoryId", "tags", "coverImage", "status"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    }

    if (!post.title?.trim() || !post.content?.trim()) return res.status(400).json({ message: "Title and content are required" });
    if (!mongoose.isValidObjectId(post.categoryId)) return res.status(400).json({ message: "Invalid categoryId" });
    if (!await Category.exists({ _id: post.categoryId })) return res.status(400).json({ message: "Category not found" });

    if (!Array.isArray(post.tags)) return res.status(400).json({ message: "tags must be an array" });
    post.tags = [...new Set(post.tags.map(String))];

    // Enforce max tags per post
    if (post.tags.length > MAX_TAGS_PER_POST) {
      return res.status(400).json({ message: `A post can have at most ${MAX_TAGS_PER_POST} tags` });
    }

    if (post.tags.some((id) => !mongoose.isValidObjectId(id))) return res.status(400).json({ message: "Invalid tag ID" });
    if (post.tags.length && await Tag.countDocuments({ _id: { $in: post.tags } }) !== post.tags.length) {
      return res.status(400).json({ message: "One or more tags not found" });
    }
    if (!["DRAFT", "PUBLISHED"].includes(post.status)) return res.status(400).json({ message: "Invalid status" });

    // Sanitize HTML content server-side
    if (req.body.content !== undefined) {
      post.content = sanitizeContent(post.content);
    }

    post.updatedAt = new Date();
    await post.save();
    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(400).json({ message: "Failed to update post", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.user.role !== "ADMIN" && post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to delete this post" });
    }

    await Promise.all([
      post.deleteOne(),
      Comment.deleteMany({ postId: post._id }),
      User.updateMany({ bookmarks: post._id }, { $pull: { bookmarks: post._id } }),
    ]);

    res.status(200).json({ message: "Post deleted successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== "PUBLISHED") return res.status(404).json({ message: "Post not found" });
    await Post.updateOne({ _id: post._id }, { $addToSet: { likes: req.user.id } });
    const updated = await Post.findById(post._id).select("likes");
    res.status(200).json({ message: "Post liked", likesCount: updated.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to like post", error: error.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await Post.updateOne({ _id: post._id }, { $pull: { likes: req.user.id } });
    const updated = await Post.findById(post._id).select("likes");
    res.status(200).json({ message: "Post unliked", likesCount: updated.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to unlike post", error: error.message });
  }
};

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, likePost, unlikePost };
