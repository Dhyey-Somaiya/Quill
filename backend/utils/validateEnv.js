/**
 * Validate that all required environment variables are set.
 * Call this before starting the server.
 */
function validateEnv() {
  const isProd = process.env.NODE_ENV === "production";

  // Critical variables needed in all environments
  const required = [
    { key: "MONGO_URI", description: "MongoDB connection string" },
    { key: "JWT_SECRET", description: "JWT signing secret" },
  ];

  const missing = required.filter(({ key }) => !process.env[key]);

  if (missing.length > 0) {
    console.error("\n=== MISSING REQUIRED ENVIRONMENT VARIABLES ===");
    for (const { key, description } of missing) {
      console.error(`  ✗ ${key} — ${description}`);
    }
    console.error("\nPlease define these in your environment or .env file.\n");
    process.exit(1);
  }

  // Warn about weak JWT secret
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn("⚠  WARNING: JWT_SECRET is short. Use at least 32 characters for production.");
  }

  // Production-specific warnings for integration features
  if (isProd) {
    if (!process.env.FRONTEND_URL) {
      console.warn("⚠  WARNING: FRONTEND_URL is not set in production. Email links and CORS will default to localhost!");
    } else if (/localhost|127\.0\.0\.1/.test(process.env.FRONTEND_URL)) {
      console.warn("⚠  WARNING: FRONTEND_URL is set to a localhost address in production. Users will receive localhost verification links!");
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠  WARNING: RESEND_API_KEY is not set. Transactional emails (verification, password reset) will fail.");
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.warn("⚠  WARNING: GOOGLE_CLIENT_ID is not set. Google OAuth authentication will not work.");
    }
  }
}

module.exports = validateEnv;
