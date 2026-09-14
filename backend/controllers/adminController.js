const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const Tag = require("../models/Tag");

const getDashboard = async (req, res) => {
  try {
    const [users, activeUsers, posts, publishedPosts, drafts, comments, pendingComments, categories, tags] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Post.countDocuments(),
        Post.countDocuments({ status: "PUBLISHED" }),
        Post.countDocuments({ status: "DRAFT" }),
        Comment.countDocuments(),
        Comment.countDocuments({ isApproved: false }),
        Category.countDocuments(),
        Tag.countDocuments(),
      ]);

    res.status(200).json({
      users: { total: users, active: activeUsers, inactive: users - activeUsers },
      posts: { total: posts, published: publishedPosts, drafts },
      comments: { total: comments, pending: pendingComments },
      categories,
      tags,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard", error: error.message });
  }
};

module.exports = { getDashboard };
