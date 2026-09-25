import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Tag,
  Layers,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Check,
  X,
  Plus,
  TrendingUp,
  Eye,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  adminApi,
  usersApi,
  postsApi,
  commentsApi,
  categoriesApi,
  tagsApi,
  categoryAdminApi,
  tagAdminApi,
  commentAdminApi,
} from "../services/api";

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "var(--accent)" }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="admin-stat-value">{value}</p>
        <p className="admin-stat-label">{label}</p>
        {sub && <p className="admin-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Heading ─────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title, subtitle }) {
  return (
    <div className="admin-section-head">
      <Icon size={18} style={{ color: "var(--accent)" }} />
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Category / Tag form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  const [newTagName, setNewTagName] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchAll();
  }, [isAuthenticated, authLoading, user]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, postsRes, commentsRes, catsRes, tagsRes] = await Promise.all([
        adminApi.dashboard(),
        usersApi.listAll(),
        postsApi.list({ limit: 50 }),
        commentsApi.list(undefined),
        categoriesApi.list(),
        tagsApi.list(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data?.users || []);
      setPosts(postsRes.data?.posts || []);
      setComments(commentsRes.data?.comments || []);
      setCategories(catsRes.data?.categories || []);
      setTags(tagsRes.data?.tags || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  // ── User Actions ──
  const handleToggleUserStatus = async (userId, currentIsActive) => {
    try {
      await usersApi.toggleStatus(userId, !currentIsActive);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentIsActive } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status.");
    }
  };

  // ── Post Actions ──
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await postsApi.delete(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  // ── Comment Actions ──
  const handleApproveComment = async (commentId, current) => {
    try {
      await commentAdminApi.approve(commentId, !current);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, isApproved: !current } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await commentAdminApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment.");
    }
  };

  // ── Category Actions ──
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await categoryAdminApi.create({ name: newCatName.trim(), description: newCatDesc.trim() });
      setCategories((prev) => [...prev, res.data.category]);
      setNewCatName("");
      setNewCatDesc("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add category.");
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Delete this category? Posts in this category will lose their category.")) return;
    try {
      await categoryAdminApi.delete(catId);
      setCategories((prev) => prev.filter((c) => c._id !== catId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category.");
    }
  };

  // ── Tag Actions ──
  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setAddingTag(true);
    const name = newTagName.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      const res = await tagsApi.create({ name, slug });
      setTags((prev) => [...prev, res.data.tag]);
      setNewTagName("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add tag.");
    } finally {
      setAddingTag(false);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await tagAdminApi.delete(tagId);
      setTags((prev) => prev.filter((t) => t._id !== tagId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete tag.");
    }
  };

  if (loading || authLoading) {
    return <div className="reading-shell loading-state">Loading admin dashboard<span>...</span></div>;
  }

  if (error) {
    return (
      <div className="reading-shell">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users },
    { key: "posts", label: "Posts", icon: FileText },
    { key: "comments", label: "Comments", icon: MessageSquare },
    { key: "categories", label: "Categories", icon: Layers },
    { key: "tags", label: "Tags", icon: Tag },
  ];

  return (
    <div className="admin-page">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Shield size={18} />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`admin-nav-item ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
            >
              <Icon size={16} />
              {label}
              {tab === key && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </nav>
        <Link to="/" className="admin-home-link">← Back to Site</Link>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        {/* ── OVERVIEW ── */}
        {tab === "overview" && stats && (
          <div>
            <h2 className="admin-page-title">Dashboard Overview</h2>
            <p className="admin-page-sub">Platform statistics at a glance</p>

            <div className="admin-stats-grid">
              <StatCard icon={Users} label="Total Users" value={stats.users?.total} sub={`${stats.users?.active} active`} />
              <StatCard icon={FileText} label="Total Posts" value={stats.posts?.total} sub={`${stats.posts?.published} published · ${stats.posts?.drafts} drafts`} />
              <StatCard icon={MessageSquare} label="Comments" value={stats.comments?.total} sub={`${stats.comments?.pending} pending`} color="#3182ce" />
              <StatCard icon={Layers} label="Categories" value={stats.categories} color="#38a169" />
              <StatCard icon={Tag} label="Tags" value={stats.tags} color="#805ad5" />
              <StatCard icon={TrendingUp} label="Inactive Users" value={stats.users?.inactive} color="#e53e3e" />
            </div>

            <div className="admin-recent-grid">
              <div className="admin-card">
                <SectionHead icon={Users} title="Recent Users" subtitle="Latest registrations" />
                <div className="admin-list">
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="admin-list-row">
                      <span className="avatar-placeholder" style={{ flexShrink: 0 }}>
                        {(u.name || "U")[0].toUpperCase()}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p className="admin-list-title">{u.name}</p>
                        <p className="admin-list-sub">{u.email}</p>
                      </div>
                      <span className={`role-badge ${u.role === "ADMIN" ? "admin" : ""}`} style={{ marginLeft: "auto", flexShrink: 0 }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                <SectionHead icon={FileText} title="Recent Posts" subtitle="Latest published stories" />
                <div className="admin-list">
                  {posts.slice(0, 5).map((p) => (
                    <div key={p._id} className="admin-list-row">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link to={`/posts/${p._id}`} className="admin-list-title" style={{ color: "var(--text)" }}>{p.title}</Link>
                        <p className="admin-list-sub">{p.authorId?.name} · {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`draft-status-badge`} style={{ marginLeft: 10, flexShrink: 0, background: p.status === "PUBLISHED" ? "color-mix(in srgb, #38a169 15%, var(--surface))" : undefined, color: p.status === "PUBLISHED" ? "#38a169" : undefined }}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            <h2 className="admin-page-title">User Management</h2>
            <p className="admin-page-sub">{users.length} users registered</p>
            <div className="admin-card" style={{ marginTop: 24 }}>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="admin-user-cell">
                            <span className="avatar-placeholder">{(u.name || "U")[0].toUpperCase()}</span>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{u.email}</td>
                        <td><span className={`role-badge ${u.role === "ADMIN" ? "admin" : ""}`}>{u.role}</span></td>
                        <td>
                          <span className="status-dot" style={{ color: u.isActive ? "#38a169" : "#e53e3e" }}>
                            {u.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className={`icon-toggle-btn ${u.isActive ? "active" : ""}`}
                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                            title={u.isActive ? "Suspend user" : "Activate user"}
                          >
                            {u.isActive ? <ToggleRight size={20} style={{ color: "#38a169" }} /> : <ToggleLeft size={20} style={{ color: "#e53e3e" }} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── POSTS ── */}
        {tab === "posts" && (
          <div>
            <h2 className="admin-page-title">Post Management</h2>
            <p className="admin-page-sub">{posts.length} posts total</p>
            <div className="admin-card" style={{ marginTop: 24 }}>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Likes</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <Link to={`/posts/${p._id}`} className="admin-list-title" style={{ color: "var(--text)", fontSize: 14 }}>
                            {p.title.length > 50 ? p.title.slice(0, 50) + "…" : p.title}
                          </Link>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{p.authorId?.name || "—"}</td>
                        <td className="muted" style={{ fontSize: 13 }}>{p.categoryId?.name || "—"}</td>
                        <td>
                          <span className="draft-status-badge" style={{ background: p.status === "PUBLISHED" ? "color-mix(in srgb, #38a169 15%, var(--surface))" : undefined, color: p.status === "PUBLISHED" ? "#38a169" : undefined }}>
                            {p.status}
                          </span>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{p.likes?.length || 0}</td>
                        <td className="muted" style={{ fontSize: 13 }}>{p.views || 0}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link to={`/posts/${p._id}/edit`} className="icon-toggle-btn" title="Edit post">
                              <Eye size={16} />
                            </Link>
                            <button
                              className="icon-toggle-btn danger"
                              onClick={() => handleDeletePost(p._id)}
                              title="Delete post"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── COMMENTS ── */}
        {tab === "comments" && (
          <div>
            <h2 className="admin-page-title">Comment Moderation</h2>
            <p className="admin-page-sub">{comments.length} comments total · {comments.filter((c) => !c.isApproved).length} pending</p>
            <div className="admin-card" style={{ marginTop: 24 }}>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Comment</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((c) => (
                      <tr key={c._id} style={{ opacity: c.isApproved ? 1 : 0.7 }}>
                        <td style={{ fontSize: 13, maxWidth: 300 }}>
                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {c.content}
                          </span>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{c.userId?.name || "Unknown"}</td>
                        <td>
                          <span className="draft-status-badge" style={{
                            background: c.isApproved ? "color-mix(in srgb, #38a169 15%, var(--surface))" : "color-mix(in srgb, #e53e3e 15%, var(--surface))",
                            color: c.isApproved ? "#38a169" : "#e53e3e",
                          }}>
                            {c.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="icon-toggle-btn"
                              onClick={() => handleApproveComment(c._id, c.isApproved)}
                              title={c.isApproved ? "Revoke approval" : "Approve comment"}
                            >
                              {c.isApproved ? <X size={16} /> : <Check size={16} style={{ color: "#38a169" }} />}
                            </button>
                            <button
                              className="icon-toggle-btn danger"
                              onClick={() => handleDeleteComment(c._id)}
                              title="Delete comment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === "categories" && (
          <div>
            <h2 className="admin-page-title">Category Management</h2>
            <p className="admin-page-sub">{categories.length} categories</p>

            {/* Add form */}
            <div className="admin-card" style={{ marginTop: 24, marginBottom: 24 }}>
              <SectionHead icon={Plus} title="Add New Category" />
              <form onSubmit={handleAddCategory} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                <input
                  placeholder="Category name *"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="admin-input"
                  required
                />
                <input
                  placeholder="Description (optional)"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="admin-input"
                  style={{ flex: 2 }}
                />
                <button type="submit" className="primary-btn" disabled={addingCat || !newCatName.trim()}>
                  <Plus size={15} /> {addingCat ? "Adding..." : "Add Category"}
                </button>
              </form>
            </div>

            <div className="admin-card">
              <div className="admin-list">
                {categories.map((cat) => (
                  <div key={cat._id} className="admin-list-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="admin-list-title">{cat.name}</p>
                      <p className="admin-list-sub">{cat.description || "No description"}</p>
                    </div>
                    <button
                      className="icon-toggle-btn danger"
                      onClick={() => handleDeleteCategory(cat._id)}
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAGS ── */}
        {tab === "tags" && (
          <div>
            <h2 className="admin-page-title">Tag Management</h2>
            <p className="admin-page-sub">{tags.length} tags</p>

            {/* Add form */}
            <div className="admin-card" style={{ marginTop: 24, marginBottom: 24 }}>
              <SectionHead icon={Plus} title="Add New Tag" />
              <form onSubmit={handleAddTag} style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <input
                  placeholder="Tag name *"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="admin-input"
                  required
                />
                <button type="submit" className="primary-btn" disabled={addingTag || !newTagName.trim()}>
                  <Plus size={15} /> {addingTag ? "Adding..." : "Add Tag"}
                </button>
              </form>
            </div>

            <div className="admin-card">
              <div className="tag-pills-wrap" style={{ padding: 20 }}>
                {tags.map((tag) => (
                  <div key={tag._id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", border: "1px solid var(--line)", borderRadius: 999, fontSize: 13, background: "var(--bg)" }}>
                    <span>#{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag._id)}
                      style={{ background: "none", border: 0, cursor: "pointer", color: "#e53e3e", display: "flex", alignItems: "center", padding: 0 }}
                      title="Delete tag"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {tags.length === 0 && <p className="muted">No tags yet.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
