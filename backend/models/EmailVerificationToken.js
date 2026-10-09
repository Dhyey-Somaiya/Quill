const mongoose = require("mongoose");

const emailVerificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// MongoDB TTL index — automatically removes expired tokens
emailVerificationTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

module.exports = mongoose.model(
  "EmailVerificationToken",
  emailVerificationTokenSchema,
);
