import React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bookmark,
  Heart,
  MessageCircle,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { postsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    postsApi
      .get(id)
      .then((res) => setPost(res.data.post))
      .catch((err) =>
        setError(err.response?.data?.message || "Story not found."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="reading-shell loading-state">
        Opening story<span>...</span>
      </div>
    );
  if (error || !post)
    return (
      <div className="reading-shell">
        <div className="error-banner">{error || "Story not found."}</div>
        <Link className="back-link" to="/">
          ← Back to stories
        </Link>
      </div>
    );

  const author = post.authorId;
  const liked =
    user?._id && post.likes?.some((like) => String(like) === String(user._id));

  const toggleLike = async () => {
    if (!isAuthenticated || busy) return;
    setBusy(true);
    try {
      const res = liked ? await postsApi.unlike(id) : await postsApi.like(id);
      const nextLikesCount = res.data.likesCount;
      setPost((current) => {
        const currentLikes = current.likes || [];
        return {
          ...current,
          likes: liked
            ? currentLikes.filter((like) => String(like) !== String(user._id))
            : [...currentLikes, user._id],
          _likesCount: nextLikesCount,
        };
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="reading-shell">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> Back to stories
      </Link>

      <header className="article-header">
        <span className="eyebrow">{post.categoryId?.name || "Story"}</span>
        <h1>{post.title}</h1>
        <p className="article-dek">{excerpt(post.content)}</p>
        <div className="article-meta">
          <span className="avatar-placeholder large">
            {(author?.name || "Q").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <strong>{author?.name || "Quill writer"}</strong>
            <span>
              {readingTime(post.content)} min read · {post.views || 0} views
            </span>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <img className="article-cover" src={post.coverImage} alt="" />
      )}

      <div className="article-layout">
        <aside className="article-actions">
          <button
            className={liked ? "active" : ""}
            onClick={toggleLike}
            disabled={!isAuthenticated || busy}
            title={isAuthenticated ? "Like" : "Sign in to like"}
          >
            <Heart size={19} fill={liked ? "currentColor" : "none"} />
            <span>{post._likesCount ?? post.likes?.length ?? 0}</span>
          </button>
          <button>
            <MessageCircle size={19} />
            <span>Comment</span>
          </button>
          <button>
            <Bookmark size={19} />
          </button>
          <button>
            <Share2 size={19} />
          </button>
        </aside>

        <div className="article-content">
          {post.content.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

function excerpt(text = "") {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 180 ? `${clean.slice(0, 180)}…` : clean;
}

function readingTime(text = "") {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}
