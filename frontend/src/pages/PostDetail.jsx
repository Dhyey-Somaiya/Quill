import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Heart,
  MessageCircle,
  ArrowLeft,
  Share2,
  Edit,
  Trash2,
  Send,
  X,
  Check,
} from "lucide-react";
import { postsApi, commentsApi, bookmarksApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DOMPurify from "dompurify";
import { DetailSkeleton } from "../components/SkeletonLoader";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Bookmarks State
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  // Deleting State
  const [deleting, setDeleting] = useState(false);

  // Comments State
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [readingProgress, setReadingProgress] = useState(0);
  const [toc, setToc] = useState([]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true);
      setError("");
      try {
        const postRes = await postsApi.get(id);
        const fetchedPost = postRes.data.post;
        setPost(fetchedPost);

        // Fetch comments
        try {
          setCommentsLoading(true);
          const commRes = await commentsApi.list(id);
          setComments(commRes.data?.comments || []);
        } catch (commErr) {
          console.error("Failed to load comments:", commErr);
        } finally {
          setCommentsLoading(false);
        }

        // Fetch user bookmarks to check if bookmarked
        if (isAuthenticated) {
          try {
            const bRes = await bookmarksApi.list();
            const userBookmarks = bRes.data?.posts || [];
            setBookmarked(userBookmarks.some((b) => b._id === id));
          } catch (bErr) {
            console.error("Failed to fetch bookmarks status:", bErr);
          }
        }
      } catch (err) {
        console.error("Failed to fetch post:", err.response?.data || err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Story not found.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="reading-shell">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="reading-shell">
        <div className="error-banner">{error || "Story not found."}</div>
        <Link className="back-link" to="/">
          <ArrowLeft size={16} /> Back to stories
        </Link>
      </div>
    );
  }

  const author = post.authorId;
  const authorId = author?._id || author;
  const isOwnerOrAdmin =
    isAuthenticated &&
    user &&
    (user.role === "ADMIN" || String(user._id) === String(authorId));

  const liked =
    user?._id && post.likes?.some((like) => String(like) === String(user._id));

  // Toggle Like
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

  // Toggle Bookmark
  const toggleBookmark = async () => {
    if (!isAuthenticated || bookmarkBusy) return;
    setBookmarkBusy(true);
    try {
      if (bookmarked) {
        await bookmarksApi.remove(id);
        setBookmarked(false);
      } else {
        await bookmarksApi.add(id);
        setBookmarked(true);
      }
    } catch (err) {
      console.error("Failed to update bookmark:", err);
    } finally {
      setBookmarkBusy(false);
    }
  };

  // Scroll progress listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollTotal > 0) {
        const currentProgress = (window.scrollY / scrollTotal) * 100;
        setReadingProgress(currentProgress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate HTML with IDs for TOC
  const contentWithIds = React.useMemo(() => {
    if (!post?.content) return "";
    const sanitized = DOMPurify.sanitize(post.content);
    
    // Parse to create TOC
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, "text/html");
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3"));
    
    headings.forEach((h, i) => {
      if (!h.id) h.id = `heading-${i}`;
    });

    // Extract TOC structure
    const parsedToc = headings.map(h => ({
      text: h.textContent,
      id: h.id,
      level: parseInt(h.tagName[1])
    }));
    setToc(parsedToc);
    
    return doc.body.innerHTML;
  }, [post?.content]);

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    setDeleting(true);
    try {
      await postsApi.delete(id);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete story.");
    } finally {
      setDeleting(false);
    }
  };

  // Comment Handlers
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      const res = await commentsApi.create({ postId: id, content: newComment.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim() || commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      const res = await commentsApi.create({ postId: id, content: replyContent.trim(), parentCommentId: parentId });
      setComments((prev) => 
        prev.map(c => 
          c._id === parentId ? { ...c, replies: [...(c.replies || []), res.data.comment] } : c
        )
      );
      setReplyingTo(null);
      setReplyContent("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add reply.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;
    try {
      const res = await commentsApi.update(commentId, { content: editingCommentContent.trim() });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: res.data.comment.content } : c))
      );
      setEditingCommentId(null);
      setEditingCommentContent("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => {
        // Filter out if it's top-level
        const filtered = prev.filter((c) => c._id !== commentId);
        // Filter out if it's a nested reply
        return filtered.map(c => ({
          ...c,
          replies: c.replies ? c.replies.filter(r => r._id !== commentId) : []
        }));
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment.");
    }
  };

  return (
    <article className="reading-shell">
      {/* Reading Progress Bar */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 4, background: "var(--accent)", width: `${readingProgress}%`, zIndex: 1000, transition: "width 0.1s ease-out" }} />
      
      <div className="top-nav-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link className="back-link" to="/" style={{ marginBottom: 0 }}>
          <ArrowLeft size={16} /> Back to stories
        </Link>

        {isOwnerOrAdmin && (
          <div className="owner-actions" style={{ display: "flex", gap: 10 }}>
            <Link to={`/posts/${id}/edit`} className="secondary-btn" style={{ padding: "6px 14px", fontSize: 13 }}>
              <Edit size={14} /> Edit Story
            </Link>
            <button
              onClick={handleDeletePost}
              disabled={deleting}
              className="danger-btn"
              style={{
                padding: "6px 14px",
                fontSize: 13,
                background: "color-mix(in srgb, #e53e3e 15%, transparent)",
                color: "#e53e3e",
                border: "1px solid color-mix(in srgb, #e53e3e 30%, transparent)",
                borderRadius: 999,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <header className="article-header" style={{ marginTop: 30 }}>
        <span className="eyebrow">{post.categoryId?.name || "Story"}</span>
        <h1>{post.title}</h1>
        <p className="article-dek">{excerpt(post.content)}</p>
        <div className="article-meta">
          <Link to={authorId ? `/profile/${authorId}` : "#"} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
            <span className="avatar-placeholder large">
              {(author?.name || "Q").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong style={{ display: "block" }}>{author?.name || "Quill writer"}</strong>
              <span>
                {readingTime(post.content)} min read · {post.views || 0} views
              </span>
            </div>
          </Link>
        </div>
      </header>

      {post.coverImage && !imageError && (
        <img
          className="article-cover"
          src={post.coverImage}
          alt=""
          onError={() => setImageError(true)}
        />
      )}

      <div className="article-layout">
        <aside className="article-actions">
          <button
            className={liked ? "active" : ""}
            onClick={toggleLike}
            disabled={!isAuthenticated || busy}
            title={isAuthenticated ? "Like story" : "Sign in to like"}
          >
            <Heart size={19} fill={liked ? "currentColor" : "none"} />
            <span>{post._likesCount ?? post.likes?.length ?? 0}</span>
          </button>
          <a href="#comments" style={{ textDecoration: "none" }}>
            <button title="View comments">
              <MessageCircle size={19} />
              <span>{comments.length}</span>
            </button>
          </a>
          <button
            className={bookmarked ? "active" : ""}
            onClick={toggleBookmark}
            disabled={!isAuthenticated || bookmarkBusy}
            title={isAuthenticated ? (bookmarked ? "Remove Bookmark" : "Bookmark") : "Sign in to bookmark"}
          >
            <Bookmark size={19} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button onClick={handleCopyLink} title={copied ? "Link Copied!" : "Copy link"}>
            {copied ? <Check size={19} style={{ color: "var(--accent)" }} /> : <Share2 size={19} />}
          </button>
        </aside>

        <div className="article-content">
          {toc.length > 0 && (
            <div className="table-of-contents" style={{ background: "var(--surface)", padding: 20, borderRadius: 8, marginBottom: 30, border: "1px solid var(--line)" }}>
              <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Table of Contents</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {toc.map(item => (
                  <li key={item.id} style={{ marginLeft: (item.level - 1) * 16 }}>
                    <a href={`#${item.id}`} style={{ color: "var(--text)", textDecoration: "none", fontSize: 14 }}>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/<[a-z][\s\S]*>/i.test(post.content) ? (
            <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
          ) : (
            post.content.split(/\n\s*\n/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          )}

          {/* TAGS DISPLAY */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="post-tags-list" style={{ marginTop: 40, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <span
                  key={typeof tag === "object" ? tag._id : tag}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "var(--surface-2)",
                    fontSize: 12,
                    color: "var(--muted)",
                  }}
                >
                  #{typeof tag === "object" ? tag.name : tag}
                </span>
              ))}
            </div>
          )}

          {/* COMMENTS SECTION */}
          <section id="comments" className="comments-section" style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid var(--line)" }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, marginBottom: 20 }}>
              Discussion ({comments.length})
            </h3>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="comment-form" style={{ marginBottom: 35 }}>
                <textarea
                  placeholder="Share your thoughts on this story..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
                <button
                  type="submit"
                  disabled={commentSubmitting || !newComment.trim()}
                  className="primary-btn"
                  style={{ marginTop: 10, float: "right" }}
                >
                  <Send size={14} /> Post Comment
                </button>
                <div style={{ clear: "both" }}></div>
              </form>
            ) : (
              <div className="error-banner" style={{ marginBottom: 30 }}>
                Please <Link to="/login" style={{ textDecoration: "underline", fontWeight: 600 }}>Log In</Link> to participate in the discussion.
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="loading-state">Loading comments...</div>
            ) : comments.length === 0 ? (
              <p className="muted" style={{ fontStyle: "italic" }}>
                No comments yet. Be the first to start the conversation!
              </p>
            ) : (
              <div className="comments-list" style={{ display: "grid", gap: 20 }}>
                {comments.map((comment) => {
                  const commentAuthor = comment.userId;
                  const commAuthorId = commentAuthor?._id || commentAuthor;
                  const isCommentOwnerOrAdmin =
                    user &&
                    (user.role === "ADMIN" ||
                      String(user._id) === String(commAuthorId));

                  return (
                    <div
                      key={comment._id}
                      className="comment-item"
                      style={{
                        padding: 18,
                        borderRadius: 8,
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div className="comment-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <Link to={commAuthorId ? `/profile/${commAuthorId}` : "#"} style={{ display: "contents" }}>
                          <div className="author-mini">
                            <span className="avatar-placeholder">
                              {(commentAuthor?.name || "U").slice(0, 1).toUpperCase()}
                            </span>
                            <strong style={{ fontSize: 13 }}>{commentAuthor?.name || "Reader"}</strong>
                          </div>
                        </Link>

                        {isCommentOwnerOrAdmin && (
                          <div className="comment-actions" style={{ display: "flex", gap: 8 }}>
                            {editingCommentId === comment._id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateComment(comment._id)}
                                  title="Save"
                                  style={{ background: "none", border: 0, color: "var(--accent)", cursor: "pointer" }}
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentContent("");
                                  }}
                                  title="Cancel"
                                  style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer" }}
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditingCommentContent(comment.content);
                                  }}
                                  title="Edit comment"
                                  style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer" }}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  title="Delete comment"
                                  style={{ background: "none", border: 0, color: "#e53e3e", cursor: "pointer" }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment._id ? (
                        <textarea
                          value={editingCommentContent}
                          onChange={(e) => setEditingCommentContent(e.target.value)}
                          rows={2}
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 4,
                            border: "1px solid var(--accent)",
                            background: "var(--bg)",
                            color: "var(--text)",
                          }}
                        />
                      ) : (
                        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, fontFamily: "var(--sans)" }}>
                          {comment.content}
                        </p>
                      )}

                      {isAuthenticated && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", fontSize: 13, marginTop: 10, display: "flex", gap: 4, alignItems: "center" }}
                        >
                          <MessageCircle size={14} /> {replyingTo === comment._id ? "Cancel Reply" : "Reply"}
                        </button>
                      )}

                      {replyingTo === comment._id && (
                        <form onSubmit={(e) => handleReplySubmit(e, comment._id)} style={{ marginTop: 12 }}>
                          <textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                            style={{
                              width: "100%",
                              padding: 10,
                              borderRadius: 4,
                              border: "1px solid var(--line)",
                              background: "var(--bg)",
                              color: "var(--text)",
                            }}
                          />
                          <button
                            type="submit"
                            disabled={commentSubmitting || !replyContent.trim()}
                            className="primary-btn"
                            style={{ marginTop: 8, padding: "6px 12px", fontSize: 13 }}
                          >
                            Post Reply
                          </button>
                        </form>
                      )}

                      {/* Render Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{ marginTop: 16, borderLeft: "2px solid var(--line)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                          {comment.replies.map((reply) => {
                            const replyAuthor = reply.userId;
                            const rAuthorId = replyAuthor?._id || replyAuthor;
                            const isReplyOwnerOrAdmin = user && (user.role === "ADMIN" || String(user._id) === String(rAuthorId));

                            return (
                              <div key={reply._id} style={{ background: "var(--bg)", padding: 12, borderRadius: 6 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                  <Link to={rAuthorId ? `/profile/${rAuthorId}` : "#"} style={{ display: "contents" }}>
                                    <div className="author-mini" style={{ gap: 6 }}>
                                      <span className="avatar-placeholder" style={{ width: 20, height: 20, fontSize: 10 }}>
                                        {(replyAuthor?.name || "U").slice(0, 1).toUpperCase()}
                                      </span>
                                      <strong style={{ fontSize: 12 }}>{replyAuthor?.name || "Reader"}</strong>
                                    </div>
                                  </Link>
                                  {isReplyOwnerOrAdmin && (
                                    <button
                                      onClick={() => handleDeleteComment(reply._id)}
                                      style={{ background: "none", border: 0, color: "#e53e3e", cursor: "pointer" }}
                                      title="Delete reply"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                                <p style={{ margin: 0, fontSize: 14 }}>{reply.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}

function excerpt(text = "") {
  const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > 180 ? `${clean.slice(0, 180)}…` : clean;
}

function readingTime(text = "") {
  const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = clean ? clean.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}
