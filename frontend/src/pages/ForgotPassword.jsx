import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setBusy(true);

        try {
            const res = await authApi.forgotPassword(email);
            setMessage(res.data.message);
            setEmail("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to process your request.",
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <p className="kicker">Account recovery</p>

                <h1>Forgot your password?</h1>

                <p className="auth-subtitle">
                    Enter your email and we'll send you a link to reset your password.
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
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </label>

                    <button
                        className="primary-btn"
                        disabled={busy}
                    >
                        {busy ? "Sending..." : "Send reset link"}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password?{" "}
                    <Link to="/login">Back to sign in</Link>
                </p>
            </div>
        </div>
    );
}