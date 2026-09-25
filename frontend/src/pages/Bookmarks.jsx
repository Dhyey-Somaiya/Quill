import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, ArrowLeft } from "lucide-react";
import { bookmarksApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function Bookmarks() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await bookmarksApi.list();
        setBookmarks(res.data?.posts || []);
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
        setError(
          err.response?.data?.message || "Failed to load your bookmarks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [isAuthenticated, authLoading, navigate]);

  const handleBookmarkToggle = (postId) => {
    setBookmarks((prev) => prev.filter((post) => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="page-shell loading-state">
        Fetching bookmarks<span>...</span>
      </div>
    );
  }

  return (
    <div className="page-shell bookmarks-page">
      <div className="section-heading" style={{ marginTop: 40 }}>
        <div>
          <button
            className="back-link"
            onClick={() => navigate(-1)}
            style={{ background: "none", border: 0, padding: 0, marginBottom: 15 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <p className="kicker">Saved Stories</p>
          <h2>Your Bookmarks</h2>
        </div>
        <span className="muted">
          {bookmarks.length} {bookmarks.length === 1 ? "story" : "stories"} saved
        </span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="empty-state" style={{ textAlign: "center", padding: "60px 0" }}>
          <Bookmark size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <h3>No bookmarked stories yet</h3>
          <p>Explore stories on the home page and save what moves you.</p>
          <Link to="/" className="primary-btn" style={{ marginTop: 20 }}>
            Explore Stories
          </Link>
        </div>
      )}

      {!loading && !error && bookmarks.length > 0 && (
        <div className="post-grid">
          {bookmarks.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isBookmarkedInitial={true}
              onBookmarkToggle={() => handleBookmarkToggle(post._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
