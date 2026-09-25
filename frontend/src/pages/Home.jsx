import React, { useEffect, useState } from "react";

import { Search, ArrowRight } from "lucide-react";

import { postsApi, categoriesApi } from "../services/api";

import PostCard from "../components/PostCard";

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
            placeholder="Search stories..."
            aria-label="Search stories"
          />

          <button type="submit">
            <ArrowRight size={18} />
          </button>
        </form>
      </section>

      {/* STORIES */}
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

        {/* LOADING */}
        {loading && (
          <div className="loading-state">
            Loading stories<span>...</span>
          </div>
        )}

        {/* ERROR */}
        {error && <div className="error-banner">{error}</div>}

        {/* EMPTY */}
        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <h3>No stories found.</h3>

            <p>Try another search or choose a different category.</p>
          </div>
        )}

        {/* FEATURED STORY */}
        {!loading && !error && featured && (
          <div className="featured-grid">
            <PostCard post={featured} featured />

            <div className="featured-note">
              <span className="big-mark">“</span>

              <p>Good writing doesn't demand attention. It earns it.</p>
            </div>
          </div>
        )}

        {/* OTHER STORIES */}
        {!loading && !error && rest.length > 0 && (
          <div className="post-grid">
            {rest.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* LOAD MORE */}
        {!loading && !error && page < totalPages && (
          <div className="load-more-wrapper">
            <button
              type="button"
              className="load-more-button"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load more stories"}

              {!loadingMore && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="topics-section" id="topics">
        <div className="section-heading">
          <div>
            <p className="kicker">Go deeper</p>

            <h2>Explore your interests</h2>
          </div>
        </div>

        <div className="topic-pills">
          {/* ALL */}
          <button
            type="button"
            className={!selectedCategory ? "active" : ""}
            onClick={() => handleCategoryChange("")}
          >
            All
            <ArrowRight size={15} />
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
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
