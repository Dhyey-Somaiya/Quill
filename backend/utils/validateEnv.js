/**
 * Validate that all required environment variables are set.
 * Call this before starting the server.
 */
function validateEnv() {
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
    console.error("\nCopy .env.example to .env and fill in the values.\n");
    process.exit(1);
  }

  // Warn about weak JWT secret
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn("⚠  WARNING: JWT_SECRET is short. Use at least 32 characters for production.");
  }
}

module.exports = validateEnv;
