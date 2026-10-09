const { Resend } = require("resend");

const getClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing RESEND_API_KEY. Add it to backend/.env",
    );
  }
  return new Resend(apiKey);
};

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "Quill <noreply@quill.app>";

/**
 * Send a transactional email via Resend.
 *
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const resend = getClient();
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }

  return data;
};

/**
 * Send an email-verification email.
 *
 * @param {{ to: string, name: string, verifyUrl: string }} options
 */
const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
  return sendEmail({
    to,
    subject: "Verify your Quill email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Verify your Quill email ✒️</h2>

        <p>Hello ${name},</p>

        <p>
          Thanks for joining Quill. Please verify your email address to
          activate your account.
        </p>

        <p>
          <a
            href="${verifyUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Verify email address
          </a>
        </p>

        <p>
          This link will expire in <strong>24 hours</strong>.
        </p>

        <p>
          If you didn't create a Quill account, you can safely ignore this email.
        </p>

        <p>— Quill</p>
      </div>
    `,
  });
};

/**
 * Send a password-reset email.
 *
 * @param {{ to: string, name: string, resetUrl: string }} options
 */
const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  return sendEmail({
    to,
    subject: "Reset your Quill password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Reset your Quill password ✒️</h2>

        <p>Hello ${name},</p>

        <p>
          We received a request to reset the password for your Quill account.
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in <strong>15 minutes</strong>.
        </p>

        <p>
          If you didn't request a password reset, you can safely ignore this email.
        </p>

        <p>— Quill</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};