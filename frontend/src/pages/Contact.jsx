import React, { useState } from "react";
import { contactApi } from "../services/api";

const SUBJECTS = [
  "General enquiry",
  "Reporting a bug",
  "Content or community concern",
  "Business or partnership",
  "Account or billing",
  "Press enquiry",
  "Other",
];

const INITIAL = { name: "", email: "", subject: "", message: "" };

function fieldError(field, value) {
  if (!value.trim()) return `${field} is required.`;
  if (field === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    return "Please enter a valid email address.";
  if (field === "Name" && value.trim().length > 120)
    return "Name must be 120 characters or fewer.";
  if (field === "Subject" && value.trim().length > 200)
    return "Subject must be 200 characters or fewer.";
  if (field === "Message" && value.trim().length > 5000)
    return "Message must be 5 000 characters or fewer.";
  return null;
}

export default function Contact() {
  const [form, setForm]       = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [status, setStatus]   = useState("idle"); // idle | loading | success | error
  const [serverMsg, setServerMsg] = useState("");

  const errors = {
    name:    fieldError("Name",    form.name),
    email:   fieldError("Email",   form.email),
    subject: fieldError("Subject", form.subject),
    message: fieldError("Message", form.message),
  };

  const isValid = Object.values(errors).every((e) => !e);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all fields touched to surface any remaining errors
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isValid) return;

    setStatus("loading");
    setServerMsg("");

    try {
      const res = await contactApi.submit(form);
      setStatus("success");
      setServerMsg(res.data?.message || "Your message has been received. We will be in touch shortly.");
      setForm(INITIAL);
      setTouched({});
    } catch (err) {
      setStatus("error");
      setServerMsg(
        err?.response?.data?.message ||
          "Something went wrong. Please try again or email us directly."
      );
    }
  };

  const charLeft = 5000 - form.message.length;

  return (
    <div className="contact-page">
      {/* ── Hero ── */}
      <div className="contact-hero">
        <p className="kicker">Get in touch</p>
        <h1>
          We&rsquo;d love to<br />
          <em>hear from you.</em>
        </h1>
        <p className="contact-hero-copy">
          Have a question, spotted a bug, or want to explore a partnership?
          Fill in the form and we will get back to you as soon as we can.
        </p>
      </div>

      <div className="contact-layout">
        {/* ── Form ── */}
        <div className="contact-form-col">
          {status === "success" ? (
            <div className="contact-success-card">
              <span className="contact-success-icon" aria-hidden="true">✓</span>
              <h2>Message sent!</h2>
              <p>{serverMsg}</p>
              <button
                className="secondary-btn"
                onClick={() => { setStatus("idle"); setServerMsg(""); }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              className="contact-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Contact form"
            >
              {status === "error" && (
                <div className="error-banner" role="alert">{serverMsg}</div>
              )}

              {/* Name */}
              <label className="contact-label" htmlFor="contact-name">
                <span>Full name <span aria-hidden="true">*</span></span>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-required="true"
                  aria-describedby={touched.name && errors.name ? "contact-name-err" : undefined}
                  aria-invalid={!!(touched.name && errors.name)}
                  placeholder="Jane Smith"
                  className={touched.name && errors.name ? "contact-input contact-input--err" : "contact-input"}
                />
                {touched.name && errors.name && (
                  <span id="contact-name-err" className="contact-field-err" role="alert">{errors.name}</span>
                )}
              </label>

              {/* Email */}
              <label className="contact-label" htmlFor="contact-email">
                <span>Email address <span aria-hidden="true">*</span></span>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-required="true"
                  aria-describedby={touched.email && errors.email ? "contact-email-err" : undefined}
                  aria-invalid={!!(touched.email && errors.email)}
                  placeholder="jane@example.com"
                  className={touched.email && errors.email ? "contact-input contact-input--err" : "contact-input"}
                />
                {touched.email && errors.email && (
                  <span id="contact-email-err" className="contact-field-err" role="alert">{errors.email}</span>
                )}
              </label>

              {/* Subject */}
              <label className="contact-label" htmlFor="contact-subject">
                <span>Subject <span aria-hidden="true">*</span></span>
                <div className="contact-select-wrap">
                  <select
                    id="contact-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-required="true"
                    aria-describedby={touched.subject && errors.subject ? "contact-subject-err" : undefined}
                    aria-invalid={!!(touched.subject && errors.subject)}
                    className={touched.subject && errors.subject ? "contact-select contact-input--err" : "contact-select"}
                  >
                    <option value="">Select a subject…</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <svg className="contact-select-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {touched.subject && errors.subject && (
                  <span id="contact-subject-err" className="contact-field-err" role="alert">{errors.subject}</span>
                )}
              </label>

              {/* Message */}
              <label className="contact-label" htmlFor="contact-message">
                <span>Message <span aria-hidden="true">*</span></span>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={7}
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={5000}
                  aria-required="true"
                  aria-describedby={
                    [
                      touched.message && errors.message ? "contact-message-err" : null,
                      "contact-message-count",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  aria-invalid={!!(touched.message && errors.message)}
                  placeholder="Tell us what's on your mind…"
                  className={touched.message && errors.message ? "contact-textarea contact-input--err" : "contact-textarea"}
                />
                <div className="contact-textarea-footer">
                  {touched.message && errors.message && (
                    <span id="contact-message-err" className="contact-field-err" role="alert">{errors.message}</span>
                  )}
                  <span
                    id="contact-message-count"
                    className={`contact-char-count ${charLeft < 200 ? "contact-char-count--warn" : ""}`}
                    aria-live="polite"
                  >
                    {charLeft} characters remaining
                  </span>
                </div>
              </label>

              <button
                type="submit"
                className="primary-btn contact-submit-btn"
                disabled={status === "loading"}
                aria-busy={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <span className="contact-spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "Send message"
                )}
              </button>

              <p className="contact-privacy-note">
                We use your information only to respond to your enquiry.
                See our <a href="/privacy" className="inline-link">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>

        {/* ── Sidebar info ── */}
        <aside className="contact-info-col">
          <div className="contact-info-card">
            <h3>Before you write…</h3>
            <p>You might find your answer in one of these places:</p>
            <ul className="contact-info-list">
              <li>
                <span className="contact-info-icon" aria-hidden="true">📖</span>
                <div>
                  <strong>About Quill</strong>
                  <p>Learn about our mission, features, and values.</p>
                  <a href="/about" className="inline-link">Read about us →</a>
                </div>
              </li>
              <li>
                <span className="contact-info-icon" aria-hidden="true">✒️</span>
                <div>
                  <strong>Start writing</strong>
                  <p>Ready to publish? Create a free account in seconds.</p>
                  <a href="/register" className="inline-link">Create account →</a>
                </div>
              </li>
              <li>
                <span className="contact-info-icon" aria-hidden="true">🔑</span>
                <div>
                  <strong>Account issues</strong>
                  <p>Trouble logging in or need to reset your password?</p>
                  <a href="/forgot-password" className="inline-link">Reset password →</a>
                </div>
              </li>
            </ul>
          </div>

          <div className="contact-response-note">
            <span aria-hidden="true">⏱</span>
            <p>We aim to respond to all enquiries within <strong>2 business days</strong>.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

