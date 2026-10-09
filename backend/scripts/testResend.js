/**
 * scripts/testResend.js
 * Run: node scripts/testResend.js your@email.com
 *
 * Sends a test email through Resend to verify the integration is working.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { Resend } = require("resend");

const to = process.argv[2];

if (!to) {
  console.error("Usage: node scripts/testResend.js your@email.com");
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error("❌  RESEND_API_KEY is not set in backend/.env");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
  console.log(`📨  Sending test email to: ${to}`);
  console.log(`    FROM: ${process.env.EMAIL_FROM || "onboarding@resend.dev"}`);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: "Quill — Resend integration test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>✒️ Resend is working!</h2>
          <p>This is a test email from your Quill backend.</p>
          <p>If you received this, your Resend integration is correctly configured.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌  Resend API error:", JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log("✅  Email sent successfully!");
    console.log("    Email ID:", data.id);
  } catch (err) {
    console.error("❌  Unexpected error:", err.message);
    process.exit(1);
  }
})();
