import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserRound,
  BookOpen,
  Users,
  UserCheck,
  Pencil,
  Check,
  X,
  LogOut,
  Heart,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usersApi, postsApi } from "../services/api";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!authLoading && user) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, user]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, postsRes] = await Promise.all([
        usersApi.getMe(),
        postsApi.list({ authorId: user._id, status: "PUBLISHED", limit: 50 }),
      ]);
      const p = profileRes.data.user;
      setProfile(p);
      setEditName(p.name || "");
      setEditBio(p.bio || "");
      setMyPosts(postsRes.data?.posts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await usersApi.updateMe({ name: editName.trim(), bio: editBio.trim() });
      setProfile(res.data.user);
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading || authLoading) {
    return <div className="reading-shell loading-state">Loading profile<span>...</span></div>;
  }

  if (error && !profile) {
    return (
      <div className="reading-shell">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  const totalLikes = myPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  const totalViews = myPosts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="profile-page">
      {/* PROFILE HEADER */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {(profile?.name || "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="profile-info">
          {editing ? (
            <div className="edit-form">
              <input
                className="edit-name-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
              />
              <textarea
                className="edit-bio-input"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="A short bio about yourself..."
                maxLength={500}
                rows={3}
              />
              <div className="edit-actions">
                <button
                  className="primary-btn"
                  onClick={handleSave}
                  disabled={saving || !editName.trim()}
                >
                  <Check size={15} /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  <X size={15} /> Cancel
                </button>
              </div>
              {error && <div className="error-banner" style={{ marginTop: 12 }}>{error}</div>}
            </div>
          ) : (
            <>
              <h1 className="profile-name">{profile?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-bio">{profile?.bio || "No bio yet."}</p>
              <div className="profile-meta-pills">
                <span className={`role-badge ${profile?.role === "ADMIN" ? "admin" : ""}`}>
                  {profile?.role === "ADMIN" ? "Admin" : "Writer"}
                </span>
                <span className="profile-joined">
                  Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="profile-header-actions">
          {!editing && (
            <button className="secondary-btn" onClick={() => setEditing(true)}>
              <Pencil size={14} /> Edit Profile
            </button>
          )}
          {profile?.role === "ADMIN" && (
            <Link to="/admin" className="secondary-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Admin Dashboard
            </Link>
          )}
          <button className="secondary-btn danger-outline-btn" onClick={handleLogout}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="success-banner" style={{ maxWidth: 900, margin: "0 auto 20px" }}>
          ✓ Profile updated successfully!
        </div>
      )}

      {/* STATS */}
      <div className="profile-stats">
        <div className="stat-card">
          <BookOpen size={22} />
          <span className="stat-num">{myPosts.length}</span>
          <span className="stat-label">Stories</span>
        </div>
        <div className="stat-card">
          <Heart size={22} />
          <span className="stat-num">{totalLikes}</span>
          <span className="stat-label">Total Likes</span>
        </div>
        <div className="stat-card">
          <Eye size={22} />
          <span className="stat-num">{totalViews}</span>
          <span className="stat-label">Total Views</span>
        </div>
        <div className="stat-card">
          <UserCheck size={22} />
          <span className="stat-num">{profile?.followers?.length || 0}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-card">
          <Users size={22} />
          <span className="stat-num">{profile?.following?.length || 0}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      {/* MY STORIES */}
      <div className="profile-stories-section">
        <div className="section-heading" style={{ marginBottom: 24 }}>
          <div>
            <p className="kicker">Your work</p>
            <h2>Published Stories</h2>
          </div>
          <Link to="/write" className="primary-btn" style={{ fontSize: 13, padding: "10px 18px" }}>
            + Write New
          </Link>
        </div>

        {myPosts.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 0", textAlign: "center" }}>
            <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>No published stories yet</h3>
            <p>Start writing your first story and share it with the world.</p>
            <Link to="/write" className="primary-btn" style={{ marginTop: 20 }}>
              Write Your First Story
            </Link>
          </div>
        ) : (
          <div className="profile-posts-list">
            {myPosts.map((post) => (
              <div key={post._id} className="profile-post-row">
                <div className="profile-post-info">
                  <Link to={`/posts/${post._id}`} className="profile-post-title">
                    {post.title}
                  </Link>
                  <div className="profile-post-meta">
                    <span>{post.categoryId?.name || "Uncategorized"}</span>
                    <span>·</span>
                    <span><Heart size={12} style={{ display: "inline" }} /> {post.likes?.length || 0}</span>
                    <span>·</span>
                    <span><Eye size={12} style={{ display: "inline" }} /> {post.views || 0} views</span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="profile-post-actions">
                  <Link to={`/posts/${post._id}/edit`} className="secondary-btn" style={{ padding: "6px 14px", fontSize: 12 }}>
                    <Pencil size={13} /> Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
