/**
 * scripts/testAuthFlows.js
 *
 * End-to-end test for:
 *  1. POST /auth/register  → sends verification email
 *  2. POST /auth/login     → blocked (unverified)
 *  3. POST /auth/forgot-password → sends reset email
 *  4. POST /auth/resend-verification → resends verification email
 *
 * Run: node scripts/testAuthFlows.js
 *
 * Uses the Resend account owner email so emails actually arrive.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api/v1`;
const TEST_EMAIL = "quill2255@gmail.com";
const TEST_USERNAME = `testuser_${Date.now()}`;
const TEST_PASSWORD = "TestPass@2026";

async function request(method, endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

function pass(label, detail = "") {
  console.log(`  ✅  ${label}${detail ? `  →  ${detail}` : ""}`);
}
function fail(label, detail = "") {
  console.error(`  ❌  ${label}${detail ? `  →  ${detail}` : ""}`);
}
function section(title) {
  console.log(`\n── ${title} ${"─".repeat(50 - title.length)}`);
}

(async () => {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  Quill Auth Flow — End-to-End Test");
  console.log(`  Backend : ${BASE_URL}`);
  console.log(`  Email   : ${TEST_EMAIL}`);
  console.log(`  Username: ${TEST_USERNAME}`);
  console.log("══════════════════════════════════════════════════");

  let allPassed = true;
  const check = (cond, label, detail) => {
    if (cond) {
      pass(label, detail);
    } else {
      fail(label, detail);
      allPassed = false;
    }
  };

  // ── 1. Register ──────────────────────────────────────────────
  section("1. Register");
  const reg = await request("POST", "/auth/register", {
    name: "Test User",
    username: TEST_USERNAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  console.log(`     Status: ${reg.status}`);
  console.log(`     Body  : ${JSON.stringify(reg.body)}`);
  check(reg.status === 201, "Registration returns 201", reg.body.message);

  // ── 2. Login before verification ────────────────────────────
  section("2. Login (should be blocked — email not verified)");
  const loginBlocked = await request("POST", "/auth/login", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  console.log(`     Status: ${loginBlocked.status}`);
  console.log(`     Body  : ${JSON.stringify(loginBlocked.body)}`);
  check(
    loginBlocked.status === 403 &&
      loginBlocked.body.code === "EMAIL_NOT_VERIFIED",
    "Login blocked with EMAIL_NOT_VERIFIED",
    loginBlocked.body.message,
  );

  // ── 3. Resend verification ───────────────────────────────────
  section("3. Resend verification email");
  const resend = await request("POST", "/auth/resend-verification", {
    email: TEST_EMAIL,
  });
  console.log(`     Status: ${resend.status}`);
  console.log(`     Body  : ${JSON.stringify(resend.body)}`);
  check(resend.status === 200, "Resend verification returns 200", resend.body.message);

  // ── 4. Forgot password (Google-account guard) ────────────────
  section("4. Forgot password — Google-only account guard");
  // Try with an address that has no account → should still return 200 (enumeration guard)
  const fpNoAccount = await request("POST", "/auth/forgot-password", {
    email: "nobody@example.com",
  });
  console.log(`     Status: ${fpNoAccount.status}`);
  console.log(`     Body  : ${JSON.stringify(fpNoAccount.body)}`);
  check(fpNoAccount.status === 200, "Forgot password for unknown email returns 200 (enumeration guard)");

  // ── 5. Forgot password (real account — sends email) ──────────
  section("5. Forgot password — real account");
  const fp = await request("POST", "/auth/forgot-password", {
    email: TEST_EMAIL,
  });
  console.log(`     Status: ${fp.status}`);
  console.log(`     Body  : ${JSON.stringify(fp.body)}`);
  // During dev, email may fail to send if account isn't verified yet.
  // We just check the HTTP response.
  check(fp.status === 200, "Forgot password returns 200", fp.body.message);

  // ── 6. Bad reset token ───────────────────────────────────────
  section("6. Reset password — invalid token");
  const badReset = await request("POST", "/auth/reset-password", {
    token: "this_is_a_fake_token_that_does_not_exist",
    newPassword: "NewPassword@2026",
  });
  console.log(`     Status: ${badReset.status}`);
  console.log(`     Body  : ${JSON.stringify(badReset.body)}`);
  check(badReset.status === 400, "Invalid reset token returns 400", badReset.body.message);

  // ── 7. Bad verify token ──────────────────────────────────────
  section("7. Verify email — invalid token");
  const badVerify = await request("GET", "/auth/verify-email?token=fakeinvalidtoken", undefined);
  console.log(`     Status: ${badVerify.status}`);
  console.log(`     Body  : ${JSON.stringify(badVerify.body)}`);
  check(badVerify.status === 400, "Invalid verify token returns 400", badVerify.body.message);

  // ── Summary ──────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════");
  if (allPassed) {
    console.log("  🎉  All checks passed!");
    console.log("\n  📧  Check quill2255@gmail.com for:");
    console.log("       • Verification email  (from step 1 & 3)");
    console.log("       • Password reset email (from step 5)");
  } else {
    console.log("  ⚠️   Some checks failed — see above.");
  }
  console.log("══════════════════════════════════════════════════\n");

  process.exit(allPassed ? 0 : 1);
})();
