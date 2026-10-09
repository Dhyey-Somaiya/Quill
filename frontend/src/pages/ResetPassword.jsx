import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../services/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const res = await authApi.resetPassword(token, password);

      setMessage(res.data.message);
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="kicker">Account recovery</p>

        <h1>Create a new password.</h1>

        <p className="auth-subtitle">
          Choose a new password for your Quill account.
        </p>

        {message && (
          <div className="success-banner">
            {message}
          </div>
        )}

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <button
            className="primary-btn"
            disabled={busy}
          >
            {busy ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
