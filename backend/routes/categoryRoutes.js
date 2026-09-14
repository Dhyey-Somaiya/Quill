const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, requireAdmin, createCategory);
router.put("/:id", protect, requireAdmin, updateCategory);
router.delete("/:id", protect, requireAdmin, deleteCategory);

module.exports = router;
