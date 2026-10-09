const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const EmailVerificationToken = require("../models/EmailVerificationToken");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;       // 15 minutes
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Helpers ──────────────────────────────────────────────────────────────────

const issueJwt = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
});

const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

const generateSecureToken = () => crypto.randomBytes(32).toString("hex");

const frontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Register ─────────────────────────────────────────────────────────────────

const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, bio } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Name, username, email and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const usernameRegex = /^[a-z0-9_.-]{2,30}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.status(400).json({
        message:
          "Username must be 2–30 characters and may only contain letters, numbers, underscores, hyphens, or dots",
      });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    // Uniqueness checks
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: email.toLowerCase() }),
      User.findOne({ username: username.toLowerCase() }),
    ]);

    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      bio: bio || "",
      emailVerified: false,
    });

    // Generate email-verification token
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await EmailVerificationToken.create({ userId: user._id, tokenHash, expiresAt });

    const verifyUrl = `${frontendUrl()}/verify-email?token=${rawToken}`;

    // Fire-and-forget — don't let email failure block registration
    sendVerificationEmail({ to: user.email, name: user.name, verifyUrl }).catch(
      (err) => console.error("Verification email failed:", err.message),
    );

    return res.status(201).json({
      message:
        "Account created. Please check your email to verify your Quill account.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const tokenHash = hashToken(token);

    const record = await EmailVerificationToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired",
      });
    }

    await User.findByIdAndUpdate(record.userId, { emailVerified: true });
    await EmailVerificationToken.deleteMany({ userId: record.userId });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Email verification failed" });
  }
};

// ─── Resend Verification ──────────────────────────────────────────────────────

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return the same message to prevent account enumeration
    const successMsg =
      "If an unverified account with that email exists, a new verification link has been sent.";

    if (!user || user.emailVerified || !user.passwordHash) {
      return res.status(200).json({ message: successMsg });
    }

    // Rotate token
    await EmailVerificationToken.deleteMany({ userId: user._id });

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await EmailVerificationToken.create({ userId: user._id, tokenHash, expiresAt });

    const verifyUrl = `${frontendUrl()}/verify-email?token=${rawToken}`;

    sendVerificationEmail({ to: user.email, name: user.name, verifyUrl }).catch(
      (err) => console.error("Resend verification email failed:", err.message),
    );

    return res.status(200).json({ message: successMsg });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in. Check your inbox or request a new link.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = issueJwt(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ─── Google Login ─────────────────────────────────────────────────────────────

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the ID token — the payload is the source of truth
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name, email_verified } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        message: "Google account email could not be verified",
      });
    }

    // Find by googleId first, then fall back to email (for linking)
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user && !user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    if (!user) {
      // New Google user — generate a unique username from their name
      const base = name
        ? name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20)
        : "user";
      let candidate = base || "user";
      let suffix = 0;
      while (await User.findOne({ username: candidate })) {
        suffix += 1;
        candidate = `${base}${suffix}`;
      }

      user = await User.create({
        name: name || "Google User",
        username: candidate,
        email,
        googleId,
        emailVerified: true, // Google has already verified the email
        passwordHash: null,
      });
    } else {
      // Link googleId to an existing account if not already set
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      // Trust Google's email verification
      if (!user.emailVerified) {
        user.emailVerified = true;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = issueJwt(user);

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.passwordHash) {
      return res.status(400).json({
        message: "Google accounts cannot change password here",
      });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const successMsg =
      "If an account with that email exists, a password reset link has been sent.";

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({ message: successMsg });
    }

    // Google-only accounts have no password to reset
    if (!user.passwordHash) {
      return res.status(200).json({
        message:
          "This account uses Google Sign-In. Please continue with Google.",
        code: "GOOGLE_ACCOUNT",
      });
    }

    // Rotate reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const resetUrl = `${frontendUrl()}/reset-password/${rawToken}`;

    sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl }).catch(
      (err) => console.error("Password reset email failed:", err.message),
    );

    return res.status(200).json({ message: successMsg });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const tokenHash = hashToken(token);

    const resetToken = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired",
      });
    }

    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(400).json({ message: "Unable to reset password" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();

    // Invalidate all reset tokens (single-use)
    await PasswordResetToken.deleteMany({ userId: user._id });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Unable to reset password" });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  googleLogin,
  changePassword,
  forgotPassword,
  resetPassword,
};
