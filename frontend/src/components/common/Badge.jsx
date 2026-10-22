import React from 'react';

export default function Badge({
  type = "healthy",
  label,
  children,
  size = "md",
  icon: Icon
}) {
  const content = label || children;
  const normalized = String(content || type).toLowerCase();

  let className = "wn-badge-neutral";
  if (normalized.includes("healthy") || normalized.includes("excellent")) {
    className = "wn-badge-healthy";
  } else if (normalized.includes("moderate") || normalized.includes("good") || normalized.includes("fair")) {
    className = "wn-badge-moderate";
  } else if (normalized.includes("concern") || normalized.includes("attention")) {
    className = "wn-badge-concern";
  }

  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? 11.5 : 12.5;

  return (
    <span
      className={`wn-badge ${className}`}
      style={{ padding, fontSize, display: 'inline-flex', alignItems: 'center', gap: 5 }}
    >
      {Icon && <Icon size={12} />}
      {content}
    </span>
  );
}
