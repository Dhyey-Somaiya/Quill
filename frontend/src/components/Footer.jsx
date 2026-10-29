import React from "react";
import { Link } from "react-router-dom";

/**
 * Site-wide footer — included in App.jsx below <main>.
 * Categories are fetched from the API on mount so the list stays in sync.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* ── Brand ── */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand">
            quill<span>.</span>
          </Link>
          <p className="footer-tagline">
            A place for curious minds — thoughtful writing and independent ideas,
            published without noise.
          </p>
        </div>

        {/* ── Explore ── */}
        <nav className="footer-nav-col" aria-label="Explore">
          <h3 className="footer-col-heading">Explore</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li>
              <a
                href="/#latest"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("latest");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else window.location.href = "/#latest";
                }}
              >
                Latest Stories
              </a>
            </li>
            <li>
              <a
                href="/#topics"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("topics");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else window.location.href = "/#topics";
                }}
              >
                Topics
              </a>
            </li>
            <li><Link to="/write">Start Writing</Link></li>
          </ul>
        </nav>

        {/* ── Company ── */}
        <nav className="footer-nav-col" aria-label="Company">
          <h3 className="footer-col-heading">Company</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </nav>

        {/* ── Account ── */}
        <nav className="footer-nav-col" aria-label="Account">
          <h3 className="footer-col-heading">Account</h3>
          <ul>
            <li><Link to="/login">Log In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/forgot-password">Reset Password</Link></li>
          </ul>
        </nav>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <span className="footer-copy">
          &copy; {year} Quill. All rights reserved.
        </span>
        <span className="footer-bottom-links">
          <Link to="/privacy">Privacy</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}

