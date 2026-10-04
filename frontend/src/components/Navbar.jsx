import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Moon,
  Sun,
  Search,
  PenLine,
  UserRound,
  LogOut,
  Menu,
  X,
  Bookmark,
  FileText,
  Home,
  Layers,
  Newspaper,
  Shield,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate("/");
  };

  const handleSectionLink = (hash) => {
    closeMobileMenu();
    if (location.pathname === "/") {
      // Already on home, scroll to section
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${hash}`);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" to="/">
          quill<span>.</span>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav className="desktop-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/bookmarks">Bookmarks</NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/drafts">Drafts</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin">Admin</NavLink>
          )}
          <a
            href="/#latest"
            onClick={(e) => {
              e.preventDefault();
              handleSectionLink("latest");
            }}
          >
            Latest
          </a>
          <a
            href="/#topics"
            onClick={(e) => {
              e.preventDefault();
              handleSectionLink("topics");
            }}
          >
            Topics
          </a>
        </nav>

        {/* ── Navigation Actions ── */}
        <div className="nav-actions">
          <button
            className="icon-btn"
            aria-label="Search"
            onClick={() => navigate("/#search")}
          >
            <Search size={18} />
          </button>
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link className="write-btn" to="/write" aria-label="Write a story">
                <PenLine size={17} />
                <span>Write</span>
              </Link>
              <button
                className="avatar-btn desktop-only"
                aria-label="Open profile"
                onClick={() => navigate("/profile")}
              >
                <UserRound size={18} />
              </button>
            </>
          ) : (
            <>
              <Link className="login-link" to="/login">
                Log in
              </Link>
              <Link className="signup-btn" to="/register">
                Start writing
              </Link>
            </>
          )}

          {/* ── Mobile Menu Toggle ── */}
          <button
            className="icon-btn mobile-menu-toggle"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Panel ── */}
      {mobileMenuOpen && (
        <nav
          className="mobile-nav"
          id="mobile-navigation"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="mobile-nav-inner">
            {/* Primary links */}
            <div className="mobile-nav-section">
              <NavLink to="/" end onClick={closeMobileMenu}>
                <Home size={16} />
                Home
              </NavLink>
              <a
                href="/#latest"
                onClick={(e) => {
                  e.preventDefault();
                  handleSectionLink("latest");
                }}
              >
                <Newspaper size={16} />
                Latest
              </a>
              <a
                href="/#topics"
                onClick={(e) => {
                  e.preventDefault();
                  handleSectionLink("topics");
                }}
              >
                <Layers size={16} />
                Topics
              </a>
            </div>

            {isAuthenticated && (
              <div className="mobile-nav-section">
                <NavLink to="/bookmarks" onClick={closeMobileMenu}>
                  <Bookmark size={16} />
                  Bookmarks
                </NavLink>
                <NavLink to="/drafts" onClick={closeMobileMenu}>
                  <FileText size={16} />
                  Drafts
                </NavLink>
                <NavLink to="/write" onClick={closeMobileMenu}>
                  <PenLine size={16} />
                  Write
                </NavLink>
                <NavLink to="/profile" onClick={closeMobileMenu}>
                  <UserRound size={16} />
                  Profile
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" onClick={closeMobileMenu}>
                    <Shield size={16} />
                    Admin
                  </NavLink>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="mobile-nav-section">
                <NavLink to="/login" onClick={closeMobileMenu}>
                  Log in
                </NavLink>
                <NavLink to="/register" onClick={closeMobileMenu}>
                  Start writing
                </NavLink>
              </div>
            )}

            {isAuthenticated && (
              <div className="mobile-nav-section">
                <button
                  className="mobile-logout-btn"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
