import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  UserRound,
  Heart,
  Eye,
  UserPlus,
  UserMinus,
  BookOpen,
  Users,
  UserCheck,
} from "lucide-react";
import { usersApi, postsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PublicProfile() {
  const { id } = useParams();
  const { user: me, isAuthenticated } = useAuth();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [authorRes, postsRes] = await Promise.all([
          usersApi.getById(id),
          postsApi.list({ authorId: id, status: "PUBLISHED", limit: 50 }),
        ]);
        const a = authorRes.data.user;
        setAuthor(a);
        setPosts(postsRes.data?.posts || []);
        if (me && a.followers) {
          setFollowing(a.followers.some((f) => String(f) === String(me._id)));
        }
      } catch (err) {
        setError(err.response?.data?.message || "User not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, me]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || followBusy) return;
    setFollowBusy(true);
    try {
      if (following) {
        await usersApi.unfollow(id);
        setFollowing(false);
        setAuthor((prev) => ({
          ...prev,
          followers: (prev.followers || []).filter((f) => String(f) !== String(me._id)),
        }));
      } else {
        await usersApi.follow(id);
        setFollowing(true);
        setAuthor((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), me._id],
        }));
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return <div className="reading-shell loading-state">Loading profile<span>...</span></div>;
  }

  if (error || !author) {
    return (
      <div className="reading-shell">
        <div className="error-banner">{error || "User not found."}</div>
        <Link to="/" className="back-link">← Back to stories</Link>
      </div>
    );
  }

  const isMe = me && String(me._id) === String(author._id);
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="profile-page">
      {/* AUTHOR HEADER */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {(author.name || "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{author.name}</h1>
          <p className="profile-bio">{author.bio || "This writer hasn't added a bio yet."}</p>
          <div className="profile-meta-pills">
            <span className={`role-badge ${author.role === "ADMIN" ? "admin" : ""}`}>
              {author.role === "ADMIN" ? "Admin" : "Writer"}
            </span>
            <span className="profile-joined">
              Member since {new Date(author.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
        {!isMe && isAuthenticated && (
          <div className="profile-header-actions">
            <button
              className={`follow-btn ${following ? "following" : ""}`}
              onClick={handleFollowToggle}
              disabled={followBusy}
            >
              {following ? (
                <><UserMinus size={15} /> Unfollow</>
              ) : (
                <><UserPlus size={15} /> Follow</>
              )}
            </button>
          </div>
        )}
        {isMe && (
          <div className="profile-header-actions">
            <Link to="/profile" className="secondary-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Edit My Profile
            </Link>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="profile-stats">
        <div className="stat-card">
          <BookOpen size={22} />
          <span className="stat-num">{posts.length}</span>
          <span className="stat-label">Stories</span>
        </div>
        <div className="stat-card">
          <Heart size={22} />
          <span className="stat-num">{totalLikes}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-card">
          <Eye size={22} />
          <span className="stat-num">{totalViews}</span>
          <span className="stat-label">Views</span>
        </div>
        <div className="stat-card">
          <UserCheck size={22} />
          <span className="stat-num">{author.followers?.length || 0}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-card">
          <Users size={22} />
          <span className="stat-num">{author.following?.length || 0}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      {/* AUTHOR'S STORIES */}
      <div className="profile-stories-section">
        <div className="section-heading" style={{ marginBottom: 24 }}>
          <div>
            <p className="kicker">Their work</p>
            <h2>Stories by {author.name}</h2>
          </div>
          <span className="muted">{posts.length} {posts.length === 1 ? "story" : "stories"}</span>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 0", textAlign: "center" }}>
            <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>No published stories yet</h3>
          </div>
        ) : (
          <div className="profile-posts-list">
            {posts.map((post) => (
              <div key={post._id} className="profile-post-row">
                <div className="profile-post-info">
                  <Link to={`/posts/${post._id}`} className="profile-post-title">
                    {post.title}
                  </Link>
                  <div className="profile-post-meta">
                    <span>{post.categoryId?.name || "Uncategorized"}</span>
                    <span>·</span>
                    <span><Heart size={12} style={{ display: "inline", marginRight: 2 }} />{post.likes?.length || 0}</span>
                    <span>·</span>
                    <span><Eye size={12} style={{ display: "inline", marginRight: 2 }} />{post.views || 0} views</span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link to={`/posts/${post._id}`} className="arrow-link" aria-label="Read story" style={{ flexShrink: 0 }}>
                  →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
