import React from "react";

export function PostCardSkeleton() {
  return (
    <div className="post-card skeleton-card">
      <div className="skeleton skeleton-thumb" />
      <div className="post-card-body">
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
        <div className="post-meta">
          <div className="skeleton skeleton-avatar" />
          <div className="skeleton skeleton-meta-text" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedPostSkeleton() {
  return (
    <div className="featured-card skeleton-card">
      <div className="skeleton skeleton-featured-thumb" />
      <div className="post-card-body" style={{ justifyContent: "center" }}>
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-title large" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
        <div className="post-meta" style={{ marginTop: 20 }}>
          <div className="skeleton skeleton-avatar" />
          <div className="skeleton skeleton-meta-text" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="detail-container skeleton-container">
      <div className="skeleton skeleton-tag" />
      <div className="skeleton skeleton-title huge" />
      <div className="skeleton skeleton-meta-text" />
      <div className="skeleton skeleton-banner" />
      <div className="skeleton skeleton-paragraph" />
      <div className="skeleton skeleton-paragraph" />
      <div className="skeleton skeleton-paragraph short" />
    </div>
  );
}

export function CommentsSkeleton() {
  return (
    <div className="skeleton-comments-list" style={{ display: "grid", gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="skeleton-card"
          style={{
            padding: 18,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div className="skeleton skeleton-avatar" style={{ width: 32, height: 32 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div className="skeleton" style={{ width: 120, height: 14 }} />
              <div className="skeleton" style={{ width: 70, height: 11 }} />
            </div>
          </div>
          <div className="skeleton skeleton-text" style={{ width: "92%", height: 14, marginBottom: 8 }} />
          <div className="skeleton skeleton-text short" style={{ width: "60%", height: 14 }} />
        </div>
      ))}
    </div>
  );
}

export function DraftCardSkeleton() {
  return (
    <div className="draft-card skeleton-card">
      <div className="draft-card-info" style={{ width: "70%" }}>
        <div className="skeleton skeleton-title" style={{ width: "65%", height: 20, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: 75, height: 13 }} />
          <div className="skeleton" style={{ width: 85, height: 13 }} />
        </div>
      </div>
      <div className="draft-card-actions">
        <div className="skeleton" style={{ width: 62, height: 32, borderRadius: 999 }} />
        <div className="skeleton" style={{ width: 76, height: 32, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="profile-page skeleton-card">
      <div className="profile-header">
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton skeleton-title" style={{ width: 220, height: 36 }} />
          <div className="skeleton skeleton-text" style={{ width: 140, height: 14 }} />
          <div className="skeleton skeleton-text" style={{ width: "80%", height: 14 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <div className="skeleton" style={{ width: 65, height: 22, borderRadius: 999 }} />
            <div className="skeleton" style={{ width: 110, height: 22, borderRadius: 999 }} />
          </div>
        </div>
      </div>
      <div className="profile-stats">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="stat-card" style={{ padding: 20 }}>
            <div className="skeleton" style={{ width: 45, height: 28, marginBottom: 8, margin: "auto" }} />
            <div className="skeleton" style={{ width: 65, height: 12, margin: "auto" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: "18px 22px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-title" style={{ width: "45%", height: 18, marginBottom: 8 }} />
              <div className="skeleton skeleton-text" style={{ width: "25%", height: 12 }} />
            </div>
            <div className="skeleton" style={{ width: 70, height: 28, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="admin-page skeleton-card">
      <aside className="admin-sidebar" style={{ padding: "32px 16px" }}>
        <div className="skeleton" style={{ width: 110, height: 24, marginBottom: 28, marginLeft: 12 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ width: "100%", height: 38, borderRadius: 8 }} />
          ))}
        </div>
      </aside>
      <main className="admin-main">
        <div className="skeleton skeleton-title" style={{ width: 240, height: 36, marginBottom: 10 }} />
        <div className="skeleton skeleton-text" style={{ width: 180, height: 14, marginBottom: 32 }} />
        <div className="admin-stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-stat-card">
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: 60, height: 28, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 90, height: 12 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="admin-recent-grid">
          {[1, 2].map((card) => (
            <div key={card} className="admin-card" style={{ padding: 20 }}>
              <div className="skeleton" style={{ width: 140, height: 18, marginBottom: 16 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: "70%", height: 14, marginBottom: 4 }} />
                      <div className="skeleton" style={{ width: "40%", height: 11 }} />
                    </div>
                    <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 999 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function TopicPillsSkeleton() {
  return (
    <div className="topic-pills skeleton-card" style={{ gap: 10 }}>
      {[85, 105, 75, 95, 115, 90].map((width, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width,
            height: 42,
            borderRadius: 999,
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}
