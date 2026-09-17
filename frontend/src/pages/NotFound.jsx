import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty-page">
      <p className="kicker">404</p>
      <h1>That page wandered off.</h1>
      <Link className="primary-btn inline-btn" to="/">
        Back to Quill
      </Link>
    </div>
  );
}
