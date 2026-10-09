import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const googleButtonRef = useRef(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setError("");
          setUnverifiedEmail("");
          setGoogleBusy(true);

          try {
            await googleLogin(response.credential);
            navigate(location.state?.from || "/");
          } catch (err) {
            setError(
              err.response?.data?.message || "Google sign-in failed.",
            );
          } finally {
            setGoogleBusy(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    };

    if (window.google) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleLogin, navigate, location.state]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/");
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || "Login failed.";
      if (code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="kicker">Welcome back</p>
        <h1>Continue reading.</h1>
        <p className="auth-subtitle">Sign in to your Quill account.</p>

        {error && <div className="error-banner">{error}</div>}

        {unverifiedEmail && (
          <div className="error-banner">
            Please verify your email before logging in.{" "}
            <Link
              to="/resend-verification"
              state={{ email: unverifiedEmail }}
              className="inline-link"
            >
              Resend verification email
            </Link>
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <div className="password-field">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="primary-btn" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="google-login">
          <div ref={googleButtonRef}></div>
          {googleBusy && (
            <p className="auth-loading">Signing in with Google...</p>
          )}
        </div>

        <p className="auth-footer">
          New to Quill? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
