const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "categories" },
);
categorySchema.index({ name: 1 }, { unique: true });
module.exports = mongoose.model("Category", categorySchema);
