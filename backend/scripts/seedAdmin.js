require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const EMAIL = "admin-test@quill.com";
const USERNAME = "quilladmin";
const PASSWORD = "Admin@123";

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const user = await User.findOneAndUpdate(
      { email: EMAIL },
      {
        name: "Quill Admin",
        username: USERNAME,
        email: EMAIL,
        passwordHash,
        emailVerified: true,
        role: "ADMIN",
        isActive: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );

    console.log(`Admin ready: ${user.email} / @${user.username}`);
    console.log(`Password: ${PASSWORD}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
