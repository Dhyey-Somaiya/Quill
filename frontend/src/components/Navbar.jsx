import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, Search, PenLine, UserRound, Bookmark, LogOut, FilePen } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" to="/">
          quill<span>.</span>
        </Link>

        <nav className="desktop-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/bookmarks">
              Bookmarks
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/drafts">
              Drafts
            </NavLink>
          )}
          <a href="/#latest">Latest</a>
          <a href="/#topics">Topics</a>
        </nav>

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
              <Link className="write-btn" to="/write">
                <PenLine size={17} />
                <span>Write</span>
              </Link>
              <button
                className="icon-btn"
                title="Bookmarks"
                onClick={() => navigate("/bookmarks")}
              >
                <Bookmark size={18} />
              </button>
              <button
                className="avatar-btn"
                title={user?.name || "Profile"}
                onClick={() => navigate("/profile")}
              >
                <UserRound size={18} />
              </button>
              <button
                className="icon-btn mobile-only"
                onClick={logout}
                aria-label="Log out"
              >
                <LogOut size={18} />
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
        </div>
      </div>
    </header>
  );
}
