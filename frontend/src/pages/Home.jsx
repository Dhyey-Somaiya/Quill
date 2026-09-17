import React from "react";
import { useEffect, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { postsApi } from "../services/api";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await postsApi.list({
        page: 1,
        limit: 12,
        ...(query ? { search: query } : {}),
      });
      setPosts(res.data.posts || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load stories. Make sure the Quill backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="page-shell home-page">
      <section className="hero">
        <div>
          <p className="kicker">A place for ideas</p>
          <h1>
            Read something
            <br />
            <em>worth remembering.</em>
          </h1>
          <p className="hero-copy">
            Thoughtful stories from curious people. Discover ideas, save what
            moves you, and find your next rabbit hole.
          </p>
        </div>

        <form
          className="search-box"
          id="search"
          onSubmit={(e) => {
            e.preventDefault();
            loadPosts(search);
          }}
        >
          <Search size={19} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            aria-label="Search stories"
          />
          <button type="submit">
            <ArrowRight size={18} />
          </button>
        </form>
      </section>

      <section className="feed-section" id="latest">
        <div className="section-heading">
          <div>
            <p className="kicker">Your reading room</p>
            <h2>{search ? `Results for “${search}”` : "Latest stories"}</h2>
          </div>
          <span className="muted">{posts.length} stories</span>
        </div>

        {loading && (
          <div className="loading-state">
            Loading stories<span>...</span>
          </div>
        )}
        {error && <div className="error-banner">{error}</div>}

        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <h3>No stories yet.</h3>
            <p>Once writers publish on Quill, they'll appear here.</p>
          </div>
        )}

        {!loading && !error && featured && (
          <div className="featured-grid">
            <PostCard post={featured} featured />
            <div className="featured-note">
              <span className="big-mark">“</span>
              <p>Good writing doesn't demand attention. It earns it.</p>
            </div>
          </div>
        )}

        {!loading && !error && rest.length > 0 && (
          <div className="post-grid">
            {rest.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="topics-section" id="topics">
        <div className="section-heading">
          <div>
            <p className="kicker">Go deeper</p>
            <h2>Explore your interests</h2>
          </div>
        </div>
        <div className="topic-pills">
          {[
            "Technology",
            "Design",
            "Culture",
            "Ideas",
            "Science",
            "Career",
            "Travel",
            "Life",
          ].map((topic) => (
            <button key={topic} onClick={() => loadPosts(topic)}>
              {topic} <ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
