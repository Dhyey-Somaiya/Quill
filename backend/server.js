const express = require("express");
const cors = require("cors");
require("dotenv").config();

const validateEnv = require("./utils/validateEnv");
validateEnv();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const globalErrorHandler = require("./middleware/errorMiddleware");
const AppError = require("./utils/AppError");

const app = express();

// Trust reverse proxy (Render, Heroku, etc.) for correct client IP detection in rate limiters
app.set("trust proxy", 1);

// Allowed origins for CORS (supports FRONTEND_URL, ALLOWED_ORIGINS, and local dev)
const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/+$/, ""));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman, and mobile requests without origin
    if (!origin) return callback(null, true);

    const normalized = origin.trim().replace(/\/+$/, "");
    const isExplicitlyAllowed = configuredOrigins.includes(normalized);
    const isLocalhostDev =
      process.env.NODE_ENV !== "production" &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);

    if (isExplicitlyAllowed || isLocalhostDev) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/tags", tagRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Quill Backend API is running" });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Database connection failed. Server not started:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
