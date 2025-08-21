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

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: "#666", margin: "0 0 16px 0" }}>
            Earn permanent badges for every contribution to your running club. 
            Your achievements are stored onchain on Base network.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Quick Start Checklist:</h3>
          
          <div style={{ display: "grid", gap: 12 }}>
            <ChecklistItem 
              number="1"
              title="Connect Your Wallet"
              description="Connect your wallet to start earning badges"
              completed={false}
            />
            <ChecklistItem 
              number="2"
              title="Make Your First Contribution"
              description="Tap 'Attend' to check in and earn your first badge"
              completed={false}
            />
            <ChecklistItem 
              number="3"
              title="Share Your Achievement"
              description="Share your badge to Base social feeds"
              completed={false}
            />
          </div>
        </div>

        <div style={{ 
          background: "#f0f8ff", 
          padding: 16, 
          borderRadius: 12,
          marginBottom: 24
        }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: 16 }}>
            💡 What makes this special?
          </h4>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#666" }}>
            <li>Your badges are permanent NFTs on Base blockchain</li>
            <li>Tip other contributors with ETH to show appreciation</li>
            <li>Climb the leaderboard with your contributions</li>
            <li>Build ownership in your running club community</li>
          </ul>
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

function ChecklistItem({ 
  number, 
  title, 
  description, 
  completed 
}: { 
  number: string; 
  title: string; 
  description: string; 
  completed: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: 12,
      background: completed ? "#e8f5e8" : "#f9f9f9",
      borderRadius: 8,
      border: `1px solid ${completed ? "#90ee90" : "#eee"}`
    }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: completed ? "#4caf50" : "#ddd",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        flexShrink: 0
      }}>
        {completed ? "✓" : number}
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: "#666" }}>
          {description}
        </div>
      </div>
    </div>
  );
}
