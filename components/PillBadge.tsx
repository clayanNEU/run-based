"use client";

import * as React from "react";

interface PillBadgeProps {
  points: number;
  variant?: 'primary' | 'secondary' | 'success' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
}

export default function PillBadge({ 
  points, 
  variant = 'success', 
  size = 'md',
  className = '' 
}: PillBadgeProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-full)',
    fontWeight: 'var(--font-weight-semibold)',
    whiteSpace: 'nowrap',
    border: 'none',
  };

  const sizeStyles: React.CSSProperties = size === 'sm' 
    ? {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        fontSize: 'var(--font-size-xs)',
        minWidth: '20px',
        height: '20px',
      }
    : {
        padding: 'var(--spacing-xs) var(--spacing-md)',
        fontSize: 'var(--font-size-sm)',
        minWidth: '24px',
        height: '24px',
      };

  const variantStyles: React.CSSProperties = (() => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary)',
          color: 'white',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--color-secondary)',
          color: 'white',
        };
      case 'success':
        return {
          backgroundColor: 'var(--color-success)',
          color: 'white',
        };
      case 'accent':
        return {
          backgroundColor: 'var(--color-accent)',
          color: 'white',
        };
      default:
        return {
          backgroundColor: 'var(--color-success)',
          color: 'white',
        };
    }
  })();

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles,
    ...variantStyles,
  };

  return (
    <span 
      className={`pill-badge ${className}`}
      style={combinedStyles}
    >
      +{points}
    </span>
  );
}

// Utility function to get the appropriate variant based on point value
export function getPointsVariant(points: number): 'primary' | 'secondary' | 'success' | 'accent' {
  if (points >= 50) return 'primary';    // Host - highest points
  if (points >= 20) return 'accent';     // Pace - medium-high points
  if (points >= 15) return 'secondary';  // Supplies - medium points
  return 'success';                      // Attend - base points
}
