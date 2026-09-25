import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Heart, MessageCircle, ArrowUpRight } from "lucide-react";
import { bookmarksApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PostCard({
  post,
  featured = false,
  isBookmarkedInitial = false,
  onBookmarkToggle,
}) {
  const { isAuthenticated, user } = useAuth();
  const [bookmarked, setBookmarked] = useState(isBookmarkedInitial);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  const author = post.authorId;
  const category = post.categoryId;

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || bookmarkBusy) return;

    setBookmarkBusy(true);
    try {
      if (bookmarked) {
        await bookmarksApi.remove(post._id);
        setBookmarked(false);
      } else {
        await bookmarksApi.add(post._id);
        setBookmarked(true);
      }
      if (onBookmarkToggle) onBookmarkToggle(post._id);
    } catch (err) {
      console.error("Bookmark error:", err);
    } finally {
      setBookmarkBusy(false);
    }
  };

  return (
    <article className={`post-card ${featured ? "featured-card" : ""}`}>
      {post.coverImage && (
        <Link to={`/posts/${post._id}`} className="post-image-wrap">
          <img src={post.coverImage} alt="" className="post-image" />
        </Link>
      )}

      <div className="post-card-body">
        <div className="eyebrow-row">
          <span className="eyebrow">{category?.name || "Story"}</span>
          {featured && <span className="featured-label">Featured</span>}
        </div>

        <Link to={`/posts/${post._id}`} className="post-title">
          {post.title}
        </Link>

        <p className="post-excerpt">{excerpt(post.content)}</p>

        <div className="post-meta">
          <div className="author-mini">
            <span className="avatar-placeholder">
              {(author?.name || "Q").slice(0, 1).toUpperCase()}
            </span>
            <span>{author?.name || "Quill writer"}</span>
          </div>
          <span>{readingTime(post.content)} min read</span>
        </div>

        <div className="card-actions">
          <span>
            <Heart size={16} /> {post.likes?.length || 0}
          </span>
          <Link to={`/posts/${post._id}#comments`} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <MessageCircle size={16} /> Discuss
          </Link>
          <button
            type="button"
            className={`action-icon-btn ${bookmarked ? "active" : ""}`}
            onClick={handleBookmarkClick}
            disabled={!isAuthenticated || bookmarkBusy}
            title={isAuthenticated ? (bookmarked ? "Remove Bookmark" : "Bookmark") : "Log in to bookmark"}
            style={{ background: "none", border: 0, cursor: isAuthenticated ? "pointer" : "default", padding: 0 }}
          >
            <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} color={bookmarked ? "var(--accent)" : "currentColor"} />
          </button>
          <Link
            to={`/posts/${post._id}`}
            className="arrow-link"
            aria-label="Read article"
          >
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function excerpt(text = "") {
  const clean = text
    .replace(/[#*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > 150 ? `${clean.slice(0, 150)}…` : clean;
}

function readingTime(text = "") {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}
