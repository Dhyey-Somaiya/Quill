import React, { useEffect, useState, useMemo } from "react";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { postsApi, categoriesApi } from "../services/api";
import PostCard from "../components/PostCard";
import { PostCardSkeleton, FeaturedPostSkeleton } from "../components/SkeletonLoader";
import { getDailyQuote } from "../data/quotes";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const dailyQuote = useMemo(() => getDailyQuote(), []);

  // Load posts from backend
  const loadPosts = async (
    query = search,
    categoryId = selectedCategory,
    pageNumber = 1,
    append = false,
  ) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const params = {
        page: pageNumber,
        limit: 12,
      };

      if (query.trim()) {
        params.search = query.trim();
      }

      if (categoryId) {
        params.categoryId = categoryId;
      }

      const res = await postsApi.list(params);

      const newPosts = res.data?.posts || [];

      if (append) {
        setPosts((currentPosts) => [...currentPosts, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setPage(res.data?.page || pageNumber);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load stories. Make sure the Quill backend is running.",
      );

      if (!append) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load real categories from MongoDB
  const loadCategories = async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error("Could not load categories:", err);
      setCategories([]);
    }
  };

  // Initial page load
  useEffect(() => {
    loadCategories();
    loadPosts("", "", 1, false);
  }, []);

  // Handle search
  const handleSearch = () => {
    setPage(1);
    loadPosts(search, selectedCategory, 1, false);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    loadPosts(search, categoryId, 1, false);
  };

  // Load next page
  const handleLoadMore = () => {
    if (page >= totalPages || loadingMore) {
      return;
    }
    loadPosts(search, selectedCategory, page + 1, true);
  };

  const featured = posts[0];
  const rest = posts.slice(1);

  const selectedCategoryObject = categories.find(
    (category) => category._id === selectedCategory,
  );

  let heading = "Latest stories";

  if (search && selectedCategoryObject) {
    heading = `Results for “${search}” in ${selectedCategoryObject.name}`;
  } else if (search) {
    heading = `Results for “${search}”`;
  } else if (selectedCategoryObject) {
    heading = selectedCategoryObject.name;
  }

  return (
    <div className="page-shell home-page">
      {/* HERO */}
      <section className="hero">
        <div>
          <p className="kicker">
            <Sparkles size={14} className="kicker-icon" /> A place for ideas
          </p>

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

        {/* SEARCH */}
        <form
          className="search-box"
          id="search"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Search size={19} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories by title, topic, or tag..."
            aria-label="Search stories"
          />

          <button type="submit" aria-label="Submit search">
            <ArrowRight size={18} />
          </button>
        </form>
      </section>

      {/* CATEGORIES / TOPICS BAR */}
      <section className="topics-section" id="topics">
        <div className="topic-pills">
          {/* ALL */}
          <button
            type="button"
            className={!selectedCategory ? "active" : ""}
            onClick={() => handleCategoryChange("")}
          >
            All Stories
          </button>

          {/* REAL DATABASE CATEGORIES */}
          {categories.map((category) => (
            <button
              type="button"
              key={category._id}
              className={selectedCategory === category._id ? "active" : ""}
              onClick={() => handleCategoryChange(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* STORIES FEED */}
      <section className="feed-section" id="latest">
        <div className="section-heading">
          <div>
            <p className="kicker">Your reading room</p>
            <h2>{heading}</h2>
          </div>

          <span className="muted">
            {posts.length} {posts.length === 1 ? "story" : "stories"}
          </span>
        </div>

        {/* SKELETON LOADING STATE */}
        {loading && (
          <div className="feed-loading-skeletons">
            <FeaturedPostSkeleton />
            <div className="post-grid">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && <div className="error-banner">{error}</div>}

        {/* EMPTY STATE */}
        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✍️</div>
            <h3>No stories found</h3>
            <p>Try refining your search terms or selecting another category.</p>
            <button
              type="button"
              className="accent-btn"
              onClick={() => {
                setSearch("");
                handleCategoryChange("");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* FEATURED STORY */}
        {!loading && !error && featured && (
          <div className="featured-grid">
            <PostCard post={featured} featured />

            <div className="featured-note">
              <span className="big-mark">“</span>
              <p>{dailyQuote.text}</p>
              {dailyQuote.author && (
                <span className="featured-quote-author">— {dailyQuote.author}</span>
              )}
            </div>
          </div>
        )}

        {/* OTHER STORIES GRID */}
        {!loading && !error && rest.length > 0 && (
          <div className="post-grid">
            {rest.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* LOAD MORE BUTTON */}
        {!loading && !error && page < totalPages && (
          <div className="load-more-wrapper">
            <button
              type="button"
              className="load-more-button"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading more stories..." : "Load more stories"}
              {!loadingMore && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
