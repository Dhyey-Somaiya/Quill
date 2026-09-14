const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const Post = require("../models/Post");

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.status(200).json({ count: tags.length, tags });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags", error: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name?.trim() || !slug?.trim()) return res.status(400).json({ message: "Name and slug are required" });
    const tag = await Tag.create({ name: name.trim(), slug: slug.trim().toLowerCase() });
    res.status(201).json({ message: "Tag created successfully", tag });
  } catch (error) {
    res.status(409).json({ message: "Failed to create tag", error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid tag ID" });
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.slug !== undefined) updates.slug = req.body.slug.trim().toLowerCase();
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

module.exports = { getTags, createTag, updateTag, deleteTag };
