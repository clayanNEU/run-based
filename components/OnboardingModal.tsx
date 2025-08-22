"use client";

import * as React from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        padding: 32,
        borderRadius: 16,
        maxWidth: 480,
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 24 
        }}>
          <h2 style={{ margin: 0, fontSize: 24 }}>
            Welcome to Stride & Rise! 🏃‍♀️
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
              padding: 4
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h3 style={{ 
            fontSize: 32, 
            marginBottom: 16, 
            color: "var(--color-primary)",
            fontWeight: "var(--font-weight-bold)"
          }}>
            What did you do today?! 🏃‍♀️
          </h3>
          <p style={{ 
            fontSize: 18, 
            lineHeight: 1.5, 
            color: "var(--color-text-secondary)", 
            margin: 0,
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            Track your contributions and earn permanent badges on Base blockchain.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 16,
              background: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Get Started! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
