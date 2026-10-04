const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const Post = require("../models/Post");

/**
 * Normalize a tag name:
 * - Trim whitespace
 * - Lowercase
 * - Replace spaces/repeated whitespace with single hyphen
 * - Collapse repeated hyphens
 * - Remove leading/trailing hyphens
 */
function normalizeTagName(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.status(200).json({ count: tags.length, tags });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags", error: error.message });
  }
};

/**
 * Get tags with post counts (for admin dashboard).
 */
const getTagsWithCounts = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 }).lean();

    // Aggregate post counts for each tag
    const tagIds = tags.map((t) => t._id);
    const counts = await Post.aggregate([
      { $match: { tags: { $in: tagIds } } },
      { $unwind: "$tags" },
      { $match: { tags: { $in: tagIds } } },
      { $group: { _id: "$tags", postCount: { $sum: 1 } } },
    ]);

    const countMap = {};
    for (const c of counts) {
      countMap[c._id.toString()] = c.postCount;
    }

    const tagsWithCounts = tags.map((tag) => ({
      ...tag,
      postCount: countMap[tag._id.toString()] || 0,
    }));

    res.status(200).json({ count: tagsWithCounts.length, tags: tagsWithCounts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags with counts", error: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Tag name is required" });

    // Normalize tag name and generate slug
    const normalized = normalizeTagName(name);
    if (!normalized) return res.status(400).json({ message: "Invalid tag name" });

    // Check if tag with this slug already exists
    const existing = await Tag.findOne({ slug: normalized });
    if (existing) {
      // Return the existing tag instead of error — this is graceful dedup
      return res.status(200).json({ message: "Tag already exists", tag: existing });
    }

    const tag = await Tag.create({
      name: normalized,
      slug: normalized,
    });

    res.status(201).json({ message: "Tag created successfully", tag });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error — handle gracefully
      const existing = await Tag.findOne({ slug: normalizeTagName(req.body.name || "") });
      if (existing) {
        return res.status(200).json({ message: "Tag already exists", tag: existing });
      }
    }
    res.status(409).json({ message: "Failed to create tag", error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid tag ID" });
    const updates = {};
    if (req.body.name !== undefined) {
      const normalized = normalizeTagName(req.body.name);
      if (!normalized) return res.status(400).json({ message: "Invalid tag name" });
      updates.name = normalized;
      updates.slug = normalized;
    }
    const tag = await Tag.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    res.status(200).json({ message: "Tag updated successfully", tag });
  } catch (error) {
    res.status(409).json({ message: "Failed to update tag", error: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid tag ID" });
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    await Post.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });
    res.status(200).json({ message: "Tag deleted successfully", tag });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete tag", error: error.message });
  }
};

/**
 * Merge two tags: move all posts from sourceTagId to targetTagId,
 * then delete the source tag.
 * Body: { sourceTagId, targetTagId }
 */
const mergeTags = async (req, res) => {
  try {
    const { sourceTagId, targetTagId } = req.body;

    if (!sourceTagId || !targetTagId) {
      return res.status(400).json({ message: "sourceTagId and targetTagId are required" });
    }
    if (!mongoose.isValidObjectId(sourceTagId) || !mongoose.isValidObjectId(targetTagId)) {
      return res.status(400).json({ message: "Invalid tag ID" });
    }
    if (sourceTagId === targetTagId) {
      return res.status(400).json({ message: "Source and target tags must be different" });
    }

    const [sourceTag, targetTag] = await Promise.all([
      Tag.findById(sourceTagId),
      Tag.findById(targetTagId),
    ]);

    if (!sourceTag) return res.status(404).json({ message: "Source tag not found" });
    if (!targetTag) return res.status(404).json({ message: "Target tag not found" });

    // Step 1: Add target tag to all posts that have source tag but not target tag
    await Post.updateMany(
      { tags: sourceTagId, tags: { $ne: targetTagId } },
      { $addToSet: { tags: targetTagId } }
    );

    // Step 2: Remove source tag from all posts
    await Post.updateMany(
      { tags: sourceTagId },
      { $pull: { tags: sourceTagId } }
    );

    // Step 3: Delete the source tag
    await sourceTag.deleteOne();

    res.status(200).json({
      message: `Tag "${sourceTag.name}" merged into "${targetTag.name}" successfully`,
      targetTag,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to merge tags", error: error.message });
  }
};

module.exports = { getTags, createTag, updateTag, deleteTag, mergeTags, getTagsWithCounts };
