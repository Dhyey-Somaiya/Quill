const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────
    name: { type: String, required: true, trim: true, maxlength: 100 },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 30,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ── Authentication ────────────────────────────────────────
    passwordHash: { type: String, required: false, default: null },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    emailVerified: { type: Boolean, default: false, index: true },

    // ── Profile ───────────────────────────────────────────────
    bio: { type: String, default: "", maxlength: 500 },

    // ── Application ───────────────────────────────────────────
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
