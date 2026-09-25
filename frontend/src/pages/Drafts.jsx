import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Send, FilePen } from "lucide-react";
import { postsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Drafts() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!user) return;

    const fetchDrafts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await postsApi.list({ authorId: user._id, status: "DRAFT", limit: 50 });
        setDrafts(res.data?.posts || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load drafts.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [user, isAuthenticated, authLoading]);

  const handlePublish = async (draftId) => {
    if (publishing) return;
    setPublishing(draftId);
    try {
      await postsApi.update(draftId, { status: "PUBLISHED" });
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
      navigate(`/posts/${draftId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish draft.");
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async (draftId) => {
    if (!window.confirm("Delete this draft permanently?")) return;
    if (deleting) return;
    setDeleting(draftId);
    try {
      await postsApi.delete(draftId);
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete draft.");
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="reading-shell loading-state">
        Loading drafts<span>...</span>
      </div>
    );
  }

  return (
    <div className="drafts-page">
      <Link className="back-link" to="/">
        ← Back to stories
      </Link>

      <h1>My Drafts</h1>
      <p className="drafts-subtitle">
        {drafts.length === 0
          ? "Nothing saved yet."
          : `${drafts.length} unpublished ${drafts.length === 1 ? "story" : "stories"} waiting for you.`}
      </p>

      {error && <div className="error-banner">{error}</div>}

      {drafts.length === 0 && !error && (
        <div className="empty-state">
          <FilePen size={40} style={{ color: "var(--accent)", marginBottom: 16 }} />
          <h3>Nothing in the drafts pile</h3>
          <p>Start a story and save it as a draft to see it here.</p>
          <Link to="/write" className="primary-btn inline-btn" style={{ marginTop: 20 }}>
            Write something
          </Link>
        </div>
      )}

      <div className="drafts-list">
        {drafts.map((draft) => (
          <div key={draft._id} className="draft-card">
            <div className="draft-card-info">
              <p className="draft-card-title">{draft.title || "Untitled"}</p>
              <div className="draft-card-meta">
                <span className="draft-status-badge">Draft</span>
                <span>{draft.categoryId?.name || "Uncategorized"}</span>
                <span>·</span>
                <span>{formatDate(draft.updatedAt || draft.createdAt)}</span>
              </div>
            </div>

            <div className="draft-card-actions">
              <Link
                to={`/posts/${draft._id}/edit`}
                className="secondary-btn"
                style={{ padding: "8px 14px", fontSize: 12 }}
              >
                <Edit size={13} /> Edit
              </Link>
              <button
                className="secondary-btn"
                style={{ padding: "8px 14px", fontSize: 12 }}
                disabled={publishing === draft._id}
                onClick={() => handlePublish(draft._id)}
              >
                <Send size={13} />
                {publishing === draft._id ? "Publishing…" : "Publish"}
              </button>
              <button
                className="inline-danger-btn"
                disabled={deleting === draft._id}
                onClick={() => handleDelete(draft._id)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
