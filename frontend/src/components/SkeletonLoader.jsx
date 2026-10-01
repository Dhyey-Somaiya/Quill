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
      <div className="featured-content">
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-title large" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
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
