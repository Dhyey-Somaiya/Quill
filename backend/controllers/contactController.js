const { sendEmail } = require("../services/emailService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * POST /api/v1/contact
 *
 * Accepts a contact-form submission, validates it, and forwards
 * the message to the configured CONTACT_EMAIL address via Resend.
 * Returns 200 only after the email has been accepted by Resend.
 */
const submitContact = catchAsync(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  // ── Basic validation ──────────────────────────────────────────────────────
  if (!name || !email || !subject || !message) {
    return next(new AppError("All fields (name, email, subject, message) are required.", 400));
  }

  const trimmedName    = String(name).trim();
  const trimmedEmail   = String(email).trim().toLowerCase();
  const trimmedSubject = String(subject).trim();
  const trimmedMessage = String(message).trim();

  if (trimmedName.length > 120) {
    return next(new AppError("Name must be 120 characters or fewer.", 400));
  }
  if (trimmedSubject.length > 200) {
    return next(new AppError("Subject must be 200 characters or fewer.", 400));
  }
  if (trimmedMessage.length > 5000) {
    return next(new AppError("Message must be 5 000 characters or fewer.", 400));
  }

  // Basic e-mail format check (the browser field should also enforce this)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(trimmedEmail)) {
    return next(new AppError("Please provide a valid email address.", 400));
  }

  // ── Destination address ───────────────────────────────────────────────────
  // Use CONTACT_EMAIL if set; otherwise fall back to the sender address so at
  // least the owner has a record of the message in their Resend dashboard.
  const toAddress = process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || "contact@quill.app";

  // Strip any "Name <addr>" wrapper that EMAIL_FROM may carry
  const toClean = toAddress.replace(/^[^<]*<(.+)>$/, "$1").trim();

  // ── Send email via existing Resend infrastructure ─────────────────────────
  await sendEmail({
    to: toClean,
    subject: `[Quill Contact] ${trimmedSubject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #24221f;">
        <h2 style="font-size: 22px; margin-bottom: 4px;">New contact message via Quill</h2>
        <p style="color: #7c756b; font-size: 14px; margin: 0 0 24px;">
          Received at ${new Date().toUTCString()}
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px 0; color: #7c756b; width: 90px; vertical-align: top;">From</td>
            <td style="padding: 10px 0; font-weight: 600;">${trimmedName} &lt;${trimmedEmail}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #7c756b; vertical-align: top; border-top: 1px solid #ddd5c8;">Subject</td>
            <td style="padding: 10px 0; border-top: 1px solid #ddd5c8;">${trimmedSubject}</td>
          </tr>
        </table>

        <div style="background: #f5f0e8; border-left: 3px solid #b66f55; padding: 18px 20px; border-radius: 4px; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
${trimmedMessage}
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #aaa196;">
          This message was submitted through the Quill contact form.
          Reply directly to this email to respond to ${trimmedName}.
        </p>
      </div>
    `,
  });

  res.status(200).json({
    status: "success",
    message: "Your message has been received. We will be in touch shortly.",
  });
});

module.exports = { submitContact };

