const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 500 },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER", index: true },
    isActive: { type: Boolean, default: true, index: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "users" },
);

module.exports = mongoose.model("User", userSchema);
