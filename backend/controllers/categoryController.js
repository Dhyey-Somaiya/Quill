const mongoose = require("mongoose");
const Category = require("../models/Category");
const Post = require("../models/Post");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Category name is required" });
    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: "Category already exists" });
    const category = await Category.create({ name: name.trim(), description: description || "" });
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(400).json({ message: "Failed to create category", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid category ID" });
    const updates = {};
    if (req.body.name !== undefined) {
      if (!req.body.name.trim()) return res.status(400).json({ message: "Category name cannot be empty" });
      updates.name = req.body.name.trim();
    }
    if (req.body.description !== undefined) updates.description = req.body.description;
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(400).json({ message: "Failed to update category", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid category ID" });
    const used = await Post.exists({ categoryId: req.params.id });
    if (used) return res.status(409).json({ message: "Category is used by existing posts and cannot be deleted" });
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully", category });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete category", error: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
