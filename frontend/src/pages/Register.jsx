import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="kicker">Almost there</p>
          <h1>Check your email.</h1>
          <p className="auth-subtitle">
            We sent a verification link to <strong>{form.email}</strong>.
            Click it to activate your Quill account.
          </p>
          <p className="auth-footer">
            Didn't get it?{" "}
            <Link to="/resend-verification">Resend verification email</Link>
          </p>
          <p className="auth-footer">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <p className="kicker">Join Quill</p>
        <h1>
          Make something
          <br />
          <em>worth reading.</em>
        </h1>
        <p className="auth-subtitle">
          Create your account and start building your corner of the internet.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>
            Name
            <input name="name" value={form.name} onChange={update} required />
          </label>
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={update}
              required
              minLength={2}
              maxLength={30}
              placeholder="e.g. johndoe"
              autoComplete="username"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              minLength={8}
              required
            />
          </label>
          <label>
            Bio <span className="optional">optional</span>
            <textarea
              name="bio"
              value={form.bio}
              onChange={update}
              rows="3"
              placeholder="A sentence about you..."
            />
          </label>
          <button className="primary-btn" disabled={busy}>
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
