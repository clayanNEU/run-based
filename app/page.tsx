"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import ContributionButtons from "../components/ContributionButtons";
import OnboardingModal from "../components/OnboardingModal";

export default function Page() {
  const { address } = useAccount();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // Show onboarding for first-time users (no wallet connected initially)
  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('stride-rise-onboarding-seen');
    if (!hasSeenOnboarding && !address) {
      // Small delay to let the page load
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [address]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('stride-rise-onboarding-seen', 'true');
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0 }}>Stride & Rise</h1>
            <p style={{ marginTop: 4, color: "#666" }}>
              Earn badges for every contribution 
              <span style={{ 
                fontSize: 12, 
                color: "#888", 
                marginLeft: 8,
                padding: "2px 6px",
                background: "#f0f0f0",
                borderRadius: 4,
                cursor: "help"
              }} title="Your badges are permanently stored onchain on Base network">
                ⓘ onchain & permanent on Base
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: 6,
              cursor: "pointer",
              color: "#666"
            }}
          >
            ❓ Help
          </button>
        </div>
      </header>
      
      <ContributionButtons />

      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />
    </div>
  );
}
