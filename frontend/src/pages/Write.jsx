import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Tag as TagIcon,
  Save,
  Send,
  X,
  Check,
  ChevronDown,
  Cloud,
  CloudOff,
} from "lucide-react";
import { postsApi, categoriesApi, tagsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import RichEditor from "../components/RichEditor";

export default function Write() {
  const { id } = useParams(); // If id exists, edit mode
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [coverImage, setCoverImage] = useState("");

  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autosaving, setAutosaving] = useState(false);

  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [catRes, tagRes] = await Promise.all([
          categoriesApi.list(),
          tagsApi.list(),
        ]);

        const cats = catRes.data?.categories || [];
        setCategories(cats);
        setAvailableTags(tagRes.data?.tags || []);

        if (!categoryId && cats.length > 0) {
          setCategoryId(cats[0]._id);
        }

        if (isEditing) {
          const postRes = await postsApi.get(id);
          const post = postRes.data.post;
          setTitle(post.title || "");
          setContent(post.content || "");
          setCategoryId(post.categoryId?._id || post.categoryId || "");
          setCoverImage(post.coverImage || "");
          if (Array.isArray(post.tags)) {
            setSelectedTags(post.tags.map((t) => (typeof t === "object" ? t._id : t)));
          }
        } else {
          const backup = localStorage.getItem("quill_draft_backup");
          if (backup) {
            try {
              const parsed = JSON.parse(backup);
              if (window.confirm("You have an unsaved draft. Would you like to restore it?")) {
                setTitle(parsed.title || "");
                setContent(parsed.content || "");
                if (parsed.categoryId) setCategoryId(parsed.categoryId);
                if (parsed.tags) setSelectedTags(parsed.tags);
                if (parsed.coverImage) setCoverImage(parsed.coverImage);
              } else {
                localStorage.removeItem("quill_draft_backup");
              }
            } catch (e) {
              localStorage.removeItem("quill_draft_backup");
            }
          }
        }
      } catch (err) {
        console.error("Error loading editor data:", err);
        setError(err.response?.data?.message || "Failed to load post or metadata.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, authLoading]);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) return prev.filter((t) => t !== tagId);
      if (prev.length >= 5) {
        alert("You can only select up to 5 tags.");
        return prev;
      }
      return [...prev, tagId];
    });
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    const name = newTagInput.trim();
    if (!name || creatingTag) return;
    // Check if tag with same name already exists
    const exists = availableTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toggleTag(exists._id);
      setNewTagInput("");
      return;
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setCreatingTag(true);
    try {
      const res = await tagsApi.create({ name, slug });
      const newTag = res.data.tag;
      setAvailableTags((prev) => [...prev, newTag]);
      setSelectedTags((prev) => [...prev, newTag._id]);
      setNewTagInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tag.");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSubmit = async (targetStatus) => {
    if (!title.trim()) {
      setError("Please enter a title for your story.");
      return;
    }
    if (!content.trim()) {
      setError("Please write some content for your story.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      title: title.trim(),
      content: content.trim(),
      categoryId,
      tags: selectedTags,
      coverImage: coverImage.trim(),
      status: targetStatus,
    };

    try {
      if (isEditing) {
        await postsApi.update(id, payload);
      } else {
        const res = await postsApi.create(payload);
        const newPost = res.data.post;
        if (targetStatus === "PUBLISHED" && newPost?._id) {
          localStorage.removeItem("quill_draft_backup");
          navigate(`/posts/${newPost._id}`);
          return;
        }
      }
      localStorage.removeItem("quill_draft_backup");
      navigate("/");
    } catch (err) {
      console.error("Failed to save post:", err);
      setError(
        err.response?.data?.message || err.response?.data?.error || "Failed to save story. Please check inputs."
      );
    } finally {
      setSubmitting(false);
      setShowPublishModal(false);
    }
  };

  // Open publish flow — validate first, then show modal
  const openPublishFlow = () => {
    if (!title.trim()) {
      setError("Please enter a title for your story.");
      return;
    }
    if (!content.trim()) {
      setError("Please write some content for your story.");
      return;
    }
    setError("");
    setShowPublishModal(true);
  };

  // LocalStorage backup on change (only for new drafts)
  useEffect(() => {
    if (!isEditing && (title || content)) {
      const backup = { title, content, categoryId, tags: selectedTags, coverImage };
      localStorage.setItem("quill_draft_backup", JSON.stringify(backup));
    }
  }, [title, content, categoryId, selectedTags, coverImage, isEditing]);

  // Debounced Autosave (only for existing drafts)
  useEffect(() => {
    if (!isEditing || !title || !content || !categoryId) return;
    
    const timeoutId = setTimeout(async () => {
      setAutosaving(true);
      try {
        const payload = { title, content, categoryId, tags: selectedTags, coverImage, status: "DRAFT" };
        await postsApi.update(id, payload);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Autosave failed", err);
      } finally {
        setAutosaving(false);
      }
    }, 5000); // 5 seconds debounce

    return () => clearTimeout(timeoutId);
  }, [title, content, categoryId, selectedTags, coverImage, isEditing, id]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit("DRAFT");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit("PUBLISHED");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  if (loading) {
    return (
      <div className="write-canvas">
        <div className="write-loading">
          <div className="write-loading-pulse"></div>
          <span>Preparing your canvas…</span>
        </div>
      </div>
    );
  }

  const selectedCategoryName = categories.find((c) => c._id === categoryId)?.name || "Select category";

  return (
    <div className="write-canvas">
      {/* ── Minimal Top Bar ── */}
      <div className="write-topbar">
        <div className="write-topbar-left">
          <button
            className="write-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="write-save-status">
            {autosaving ? (
              <>
                <Cloud size={14} className="status-icon saving" />
                <span>Saving…</span>
              </>
            ) : lastSaved ? (
              <>
                <Check size={14} className="status-icon saved" />
                <span>Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </>
            ) : isEditing ? (
              <>
                <Cloud size={14} className="status-icon" />
                <span>Draft</span>
              </>
            ) : (title || content) ? (
              <>
                <CloudOff size={14} className="status-icon" />
                <span>Local backup</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="write-topbar-right">
          <button
            type="button"
            className="write-draft-btn"
            disabled={submitting}
            onClick={() => handleSubmit("DRAFT")}
          >
            Save draft
          </button>
          <button
            type="button"
            className="write-publish-btn"
            disabled={submitting}
            onClick={openPublishFlow}
          >
            {isEditing ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="write-error">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Distraction-Free Writing Area ── */}
      <div className="write-body">
        <div className="write-content-area">
          <input
            type="text"
            className="write-title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <RichEditor
            value={content}
            onChange={(newHtml) => setContent(newHtml)}
            placeholder="Tell your story..."
          />
        </div>
      </div>

      {/* ── Publish Modal ── */}
      {showPublishModal && (
        <div
          className="publish-backdrop"
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="publish-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="publish-modal-header">
              <div>
                <h2>
                  {isEditing ? "Update your story" : "Ready to publish?"}
                </h2>
                <p className="publish-modal-subtitle">
                  Add the finishing touches before sharing with the world.
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowPublishModal(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="publish-modal-body">
              {/* Story Preview */}
              <div className="publish-preview">
                <span className="publish-label">Story preview</span>
                <div className="publish-preview-card">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="publish-cover-preview"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  <h3 className="publish-preview-title">{title}</h3>
                </div>
              </div>

              {/* Cover Image */}
              <div className="publish-field">
                <label className="publish-label">
                  <ImageIcon size={14} />
                  Cover image
                </label>
                <input
                  type="url"
                  className="publish-input"
                  placeholder="Paste an image URL for your story cover…"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="publish-field">
                <label className="publish-label">Category</label>
                <div className="publish-select-wrap">
                  <select
                    className="publish-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="publish-select-icon" />
                </div>
              </div>

              {/* Tags */}
              <div className="publish-field">
                <label className="publish-label">
                  <TagIcon size={14} />
                  Tags
                  <span className="publish-tag-count">{selectedTags.length}/5</span>
                </label>
                <div className="publish-tags-wrap">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag._id);
                    return (
                      <button
                        type="button"
                        key={tag._id}
                        className={`publish-tag-pill ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleTag(tag._id)}
                      >
                        {isSelected && <Check size={12} />}
                        {tag.name}
                      </button>
                    );
                  })}
                  <form
                    onSubmit={handleCreateTag}
                    className="publish-new-tag-form"
                  >
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="+ Add tag"
                      className="publish-new-tag-input"
                      disabled={creatingTag}
                    />
                    {newTagInput.trim() && (
                      <button
                        type="submit"
                        className="publish-tag-pill selected"
                        disabled={creatingTag}
                      >
                        {creatingTag ? "…" : "Add"}
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {error && <div className="error-banner">{error}</div>}
            </div>

            <div className="publish-modal-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowPublishModal(false)}
              >
                Back to editing
              </button>
              <button
                type="button"
                className="write-publish-btn"
                disabled={submitting}
                onClick={() => handleSubmit("PUBLISHED")}
              >
                {submitting
                  ? "Publishing…"
                  : isEditing
                    ? "Update & Publish"
                    : "Publish now"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
