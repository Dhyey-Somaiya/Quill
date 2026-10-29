import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles, X } from "lucide-react";
import { postsApi, categoriesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import {
  PostCardSkeleton,
  FeaturedPostSkeleton,
  TopicPillsSkeleton,
} from "../components/SkeletonLoader";
import { getDailyQuote } from "../data/quotes";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [error, setError] = useState("");

  // Floating prompt shown while scrolling down for unauthenticated users
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);
  const [dismissedScrollPrompt, setDismissedScrollPrompt] = useState(false);

  const dailyQuote = useMemo(() => getDailyQuote(), []);

  // Listen for scroll on Home page when not signed in
  useEffect(() => {
    if (isAuthenticated) return;

    const handleScroll = () => {
      // Show prompt once user has scrolled past 320px
      if (window.scrollY > 320) {
        setShowScrollPrompt(true);
      } else {
        setShowScrollPrompt(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated]);

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
      // Authenticated users get 12 stories per page; unauthenticated users fetch 5 preview stories
      const params = {
        page: pageNumber,
        limit: isAuthenticated ? 12 : 5,
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
    setCategoriesLoading(true);
    try {
      const res = await categoriesApi.list();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error("Could not load categories:", err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Initial page load
  useEffect(() => {
    loadCategories();
    loadPosts("", "", 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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

  // Load next page (authenticated users only)
  const handleLoadMore = () => {
    if (page >= totalPages || loadingMore || !isAuthenticated) {
      return;
    }
    loadPosts(search, selectedCategory, page + 1, true);
  };

  // Unauthenticated guests only see the latest 5 posts maximum
  const visiblePosts = isAuthenticated ? posts : posts.slice(0, 5);
  const featured = visiblePosts[0];
  const rest = visiblePosts.slice(1);

  // Check if unauthenticated preview limit is reached
  const reachedFreeLimit = !isAuthenticated && posts.length >= 5;

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
        {categoriesLoading ? (
          <TopicPillsSkeleton />
        ) : (
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
        )}
      </section>

      {/* STORIES FEED */}
      <section className="feed-section" id="latest">
        <div className="section-heading">
          <div>
            <p className="kicker">Your reading room</p>
            <h2>{heading}</h2>
          </div>

          <span className="muted">
            {!isAuthenticated && posts.length >= 5
              ? "Showing 5 stories (free preview)"
              : `${visiblePosts.length} ${visiblePosts.length === 1 ? "story" : "stories"}`}
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
              <PostCardSkeleton />
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && <div className="error-banner">{error}</div>}

        {/* EMPTY STATE */}
        {!loading && !error && visiblePosts.length === 0 && (
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

            {/* Skeletons while loading next page */}
            {loadingMore && (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            )}
          </div>
        )}

        {/* ── OPTION WHILE SCROLLING DOWN: SIGN IN TO VIEW MORE ── */}
        {!loading && !error && reachedFreeLimit && (
          <div className="signin-wall-wrapper">
            <div className="signin-wall-card">
              <div className="signin-wall-icon-wrap" aria-hidden="true">
                <Sparkles size={22} />
              </div>
              <span className="signin-wall-badge">Free preview limit reached</span>
              <h3 className="signin-wall-title">
                Sign in to view more stories
              </h3>
              <p className="signin-wall-copy">
                You&apos;ve reached the preview limit of 5 stories. Sign in or create a free account to unlock all stories, follow writers, bookmark your favorites, and participate in discussions.
              </p>
              <div className="signin-wall-actions">
                <Link to="/login" className="primary-btn signin-wall-primary-btn">
                  Sign in to view more
                </Link>
                <Link to="/register" className="secondary-btn signin-wall-secondary-btn">
                  Create free account
                </Link>
              </div>
              <p className="signin-wall-note">
                It only takes 30 seconds · No credit card required
              </p>
            </div>
          </div>
        )}

        {/* LOAD MORE BUTTON (FOR AUTHENTICATED USERS) */}
        {isAuthenticated && !loading && !error && page < totalPages && (
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

      {/* ── FLOATING BOTTOM SIGN-IN BAR WHILE SCROLLING DOWN (UNAUTHENTICATED) ── */}
      {!isAuthenticated && showScrollPrompt && !dismissedScrollPrompt && (
        <aside
          className="floating-signin-bar"
          role="region"
          aria-label="Sign in prompt"
        >
          <div className="floating-signin-inner">
            <div className="floating-signin-text">
              <Sparkles size={16} className="floating-signin-icon" aria-hidden="true" />
              <span>Enjoying Quill? <strong>Sign in</strong> to read unlimited stories.</span>
            </div>
            <div className="floating-signin-actions">
              <Link to="/login" className="primary-btn floating-signin-btn">
                Sign in
              </Link>
              <Link to="/register" className="secondary-btn floating-signin-btn">
                Join free
              </Link>
              <button
                type="button"
                className="floating-signin-close"
                onClick={() => setDismissedScrollPrompt(true)}
                aria-label="Dismiss sign in prompt"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
