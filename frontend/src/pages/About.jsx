import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, PenLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const VALUES = [
  {
    icon: "✒️",
    title: "Writing first",
    body: "Quill exists to serve writers and readers, not advertisers. Every design decision starts with the question: does this help someone write or read better?",
  },
  {
    icon: "🔍",
    title: "Ideas that matter",
    body: "We believe the best ideas come from genuine curiosity. Quill is a home for essays, analyses, and stories that take their subject seriously.",
  },
  {
    icon: "🌱",
    title: "Grow as a writer",
    body: "Whether you have written one post or one thousand, Quill gives you a clean canvas and a real audience — no algorithmic noise in between.",
  },
  {
    icon: "🤝",
    title: "Open to everyone",
    body: "Publishing should not require an editorial gatekeeper. Quill lets anyone with something to say publish it to the world in minutes.",
  },
];

export default function About() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="about-page">
      {/* ── Hero ── */}
      <section className="about-hero">
        <p className="kicker">
          <Sparkles size={14} className="kicker-icon" /> Welcome to Quill
        </p>

        {isAuthenticated && (
          <div className="about-user-pill">
            <span>Welcome back, <strong>{user?.name || "Writer"}</strong>!</span>
            <Link to="/home" className="about-user-pill-link">
              Go to stories feed <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <h1>
          A home for<br />
          <em>thoughtful writing.</em>
        </h1>
        <p className="about-hero-copy">
          Quill is an independent publishing platform built for writers who
          care about their craft and readers who value substance over spectacle.
        </p>

        <div className="about-hero-actions">
          <Link to="/home" className="primary-btn about-hero-btn">
            <BookOpen size={16} />
            Explore stories
          </Link>
          <Link to={isAuthenticated ? "/write" : "/register"} className="secondary-btn about-hero-btn">
            <PenLine size={16} />
            {isAuthenticated ? "Write a story" : "Start writing"}
          </Link>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="about-section">
        <div className="about-section-inner about-mission">
          <div className="about-text-col">
            <h2>Why Quill exists</h2>
            <p>
              The web is full of content. What it lacks is writing — deliberate,
              unhurried, human writing that earns the reader&apos;s time. Quill was
              created to give that kind of writing a proper home.
            </p>
            <p>
              We provide a distraction-free editor, a curated reading experience,
              and a community of people who take ideas seriously. No click-bait
              headlines, no infinite scroll traps, no paywalls between a writer
              and their audience.
            </p>
            <p>
              Our mission is simple: make it easy for great writing to find the
              people who will appreciate it.
            </p>
          </div>
          <div className="about-accent-block">
            <span className="about-big-q">&ldquo;</span>
            <blockquote>
              Great writing deserves an audience. Great readers deserve something
              worth their time. Quill brings them together.
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-section about-values-section">
        <div className="about-section-inner">
          <h2 className="about-section-title">What we stand for</h2>
          <div className="about-values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-icon" aria-hidden="true">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For writers ── */}
      <section className="about-section">
        <div className="about-section-inner about-two-col">
          <div>
            <p className="kicker">For writers</p>
            <h2>Your words. Your audience.</h2>
            <p>
              Quill gives you a rich, distraction-free writing environment built
              around the craft. Format your ideas with headings, blockquotes,
              embedded images, and code. Save drafts privately, publish when you
              are ready, and watch your following grow over time.
            </p>
            <ul className="about-feature-list">
              <li>Rich-text editor with markdown-style shortcuts</li>
              <li>Public profile and author page</li>
              <li>Draft management &amp; revision history</li>
              <li>Category &amp; tag system for discoverability</li>
              <li>Reader engagement through likes and comments</li>
            </ul>
            <Link to={isAuthenticated ? "/write" : "/register"} className="primary-btn about-cta-btn">
              {isAuthenticated ? "Write a story" : "Start writing for free"}
            </Link>
          </div>
          <div>
            <p className="kicker">For readers</p>
            <h2>Curated reading, no noise.</h2>
            <p>
              Discover stories filtered by topic, bookmark the ones you want to
              revisit, and follow the writers whose perspective you value. Quill
              respects your attention — no popups, no autoplay, no tracking
              pixels following you across the web.
            </p>
            <ul className="about-feature-list">
              <li>Curated feed filtered by category or tag</li>
              <li>Bookmark any story for later</li>
              <li>Follow writers and see their latest work</li>
              <li>Light and dark reading modes</li>
              <li>Clean, typographically beautiful articles</li>
            </ul>
            <Link to="/home" className="secondary-btn about-cta-btn">
              Explore stories
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-section about-cta-section">
        <div className="about-section-inner about-cta-inner">
          <h2>Ready to dive into Quill?</h2>
          <p>Read thoughtful stories or publish your first article today.</p>
          <div className="about-cta-actions">
            <Link to="/home" className="primary-btn">Explore stories</Link>
            {!isAuthenticated && (
              <Link to="/register" className="secondary-btn">Create free account</Link>
            )}
            <Link to="/contact" className="secondary-btn">Get in touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
