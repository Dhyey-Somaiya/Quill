import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Tag as TagIcon, Save, Send } from "lucide-react";
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
    }
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
      <div className="reading-shell loading-state">
        Preparing editor<span>...</span>
      </div>
    );
  }

  return (
    <div className="reading-shell write-page">
      <button className="back-link" onClick={() => navigate(-1)} style={{ background: "none", border: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="editor-header">
        <h1>{isEditing ? "Edit Story" : "Write a Story"}</h1>
        <div className="editor-actions">
          {isEditing && (
            <span style={{ fontSize: 12, color: "var(--muted)", display: "inline-flex", alignItems: "center" }}>
              {autosaving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Draft"}
            </span>
          )}
          <button
            type="button"
            className="secondary-btn"
            disabled={submitting}
            onClick={() => handleSubmit("DRAFT")}
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            className="primary-btn"
            disabled={submitting}
            onClick={() => handleSubmit("PUBLISHED")}
          >
            <Send size={16} />
            <span>{isEditing ? "Update & Publish" : "Publish Story"}</span>
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="editor-form">
        <div className="form-group">
          <input
            type="text"
            className="title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="editor-meta-grid">
          <div className="meta-field">
            <label>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="meta-field">
            <label>
              <ImageIcon size={14} style={{ display: "inline", marginRight: 4 }} />
              Cover Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </div>
        </div>

        <div className="tag-selector">
          <label>
            <TagIcon size={14} style={{ display: "inline", marginRight: 4 }} />
            Tags
          </label>
          <div className="tag-pills-wrap">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag._id);
              return (
                <button
                  type="button"
                  key={tag._id}
                  className={`tag-pill-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleTag(tag._id)}
                >
                  #{tag.name}
                </button>
              );
            })}
            {/* Inline new-tag creation */}
            <form onSubmit={handleCreateTag} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="+ new tag"
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px dashed var(--line)",
                  background: "transparent",
                  color: "var(--text)",
                  fontSize: 12,
                  width: 100,
                  outline: "none",
                }}
                disabled={creatingTag}
              />
              {newTagInput.trim() && (
                <button
                  type="submit"
                  className="tag-pill-btn selected"
                  disabled={creatingTag}
                  style={{ padding: "4px 12px" }}
                >
                  {creatingTag ? "…" : "Add"}
                </button>
              )}
            </form>
          </div>
        </div>


        <div className="form-group content-group">
          <RichEditor
            value={content}
            onChange={(newHtml) => setContent(newHtml)}
            placeholder="Tell your story..."
          />
        </div>
      </div>
    </div>
  );
}
