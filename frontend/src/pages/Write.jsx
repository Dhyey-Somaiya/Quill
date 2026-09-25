import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Tag as TagIcon, Save, Send } from "lucide-react";
import { postsApi, categoriesApi, tagsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
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
          navigate(`/posts/${newPost._id}`);
          return;
        }
      }
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

        {availableTags.length > 0 && (
          <div className="tag-selector">
            <label>
              <TagIcon size={14} style={{ display: "inline", marginRight: 4 }} />
              Select Tags
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
            </div>
          </div>
        )}

        <div className="form-group content-group">
          <textarea
            className="content-textarea"
            placeholder="Tell your story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
          />
        </div>
      </div>
    </div>
  );
}
