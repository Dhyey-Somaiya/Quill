const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 80 },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "tags" },
);
tagSchema.index({ name: 1 });
module.exports = mongoose.model("Tag", tagSchema);
