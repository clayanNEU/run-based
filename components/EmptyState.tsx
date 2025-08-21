"use client";

import * as React from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  return (
    <div style={{ 
      padding: 40, 
      textAlign: "center", 
      color: "#666",
      background: "#f9f9f9",
      borderRadius: 12,
      border: "1px solid #eee"
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>
        {icon}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, marginBottom: actionText ? 20 : 0 }}>
        {description}
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: "12px 24px",
            background: "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
