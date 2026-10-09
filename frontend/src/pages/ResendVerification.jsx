import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "../services/api";

export default function ResendVerification() {
  const location = useLocation();
  // Pre-fill if navigated from login with an unverified email
  const [email, setEmail] = useState(location.state?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);

    try {
      const res = await authApi.resendVerification(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to resend verification email.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="kicker">Email verification</p>

        <h1>Resend verification.</h1>

        <p className="auth-subtitle">
          Enter your email and we'll send you a new verification link.
        </p>

        {message && <div className="success-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <button className="primary-btn" disabled={busy}>
            {busy ? "Sending..." : "Send verification link"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
