import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setMessage(res.data.message);
        setStatus("success");
      })
      .catch((err) => {
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may be invalid or expired.",
        );
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="kicker">Email verification</p>

        {status === "loading" && (
          <>
            <h1>Verifying...</h1>
            <p className="auth-subtitle">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1>Email verified.</h1>
            <p className="auth-subtitle">{message}</p>
            <p className="auth-footer">
              <Link to="/login" className="primary-btn" style={{ display: "inline-block" }}>
                Sign in to Quill
              </Link>
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1>Verification failed.</h1>
            <div className="error-banner">{message}</div>
            <p className="auth-footer">
              <Link to="/resend-verification">
                Request a new verification link
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
