"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { 
  getBlockchainTotals, 
  makeContributionWithSponsorship, 
  getSuccessMessage,
  getPointsForType,
  type ContributionType,
  type BlockchainTotals 
} from "../lib/blockchain-store";
import PillBadge, { getPointsVariant } from "./PillBadge";
import CelebrationEffect, { useCelebration } from "./CelebrationEffect";
import { useMultipleButtonCooldowns, formatTimeRemaining } from "../hooks/useButtonCooldown";

type Btn = { key: ContributionType; label: string; emoji: string; points: number };

const BUTTONS: Btn[] = [
  { key: "ATTEND",  label: "Attend",   emoji: "✅", points: getPointsForType("ATTEND") },
  { key: "HOST",    label: "Host",     emoji: "🏁", points: getPointsForType("HOST") },
  { key: "PACE",    label: "Pace",     emoji: "⏱️", points: getPointsForType("PACE") },
  { key: "SUPPLIES",label: "Supplies", emoji: "🧃", points: getPointsForType("SUPPLIES") },
];

export default function ContributionButtons() {
  const { address } = useAccount();
  const [totals, setTotals] = React.useState<BlockchainTotals>({ 
    attend: 0, host: 0, pace: 0, supplies: 0, 
    points: 0, streak: 0, badges: [], 
    tipsReceived: 0, tipsSent: 0 
  });
  const [toast, setToast] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<string | null>(null);
  const [shareReady, setShareReady] = React.useState<{ title: string } | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://run-based.vercel.app";

  // New hooks for enhanced functionality
  const { getCooldownForType } = useMultipleButtonCooldowns();
  const { isActive: celebrationActive, type: celebrationType, triggerCelebration, completeCelebration } = useCelebration();

  // Load blockchain data when wallet connects
  React.useEffect(() => {
    if (address) {
      getBlockchainTotals(address).then(setTotals);
    }
  }, [address]);

  async function onClick(key: ContributionType) {
    if (!address) {
      setToast("Please connect wallet");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // Check cooldown
    const cooldown = getCooldownForType(key);
    if (cooldown.isDisabled) {
      setToast(`Wait ${formatTimeRemaining(cooldown.timeRemaining)} before contributing again`);
      setTimeout(() => setToast(null), 2000);
      return;
    }

    setLoading(key);
    
    try {
      setToast("Processing contribution... ⏳");
      
      // Make blockchain transaction
      const _result = await makeContributionWithSponsorship(key);
      
      // Trigger cooldown
      cooldown.triggerCooldown();
      
      // Trigger celebration
      triggerCelebration(key);
      
      // Optimistic UI update
      const points = getPointsForType(key);
      const optimisticTotals = { ...totals };
      optimisticTotals.points += points;
      
      // Update contribution counts
      switch (key) {
        case 'ATTEND': optimisticTotals.attend += 1; break;
        case 'HOST': optimisticTotals.host += 1; break;
        case 'PACE': optimisticTotals.pace += 1; break;
        case 'SUPPLIES': optimisticTotals.supplies += 1; break;
      }
      
      // Update streak for attendance
      if (key === 'ATTEND') {
        optimisticTotals.streak += 1;
      }
      
      setTotals(optimisticTotals);
      
      // Show success message
      const msg = getSuccessMessage(key);
      setToast(`${msg} + Badge earned! 🎉`);
      setShareReady({ title: `${msg} - Badge earned!` });
      
      // Refresh from blockchain after delay
      setTimeout(async () => {
        const newTotals = await getBlockchainTotals(address);
        setTotals(newTotals);
      }, 2000);
      
      setTimeout(() => setToast(null), 3000);
      
    } catch (error: unknown) {
      console.error('Transaction failed:', error);
      let errorMessage = "Transaction failed";
      
      // Parse common error messages
      const errorObj = error as { message?: string; shortMessage?: string };
      if (errorObj.message?.includes("Already contributed this type today")) {
        errorMessage = "Already contributed today ✅";
      } else if (errorObj.message?.includes("User rejected")) {
        errorMessage = "Transaction cancelled";
      } else if (errorObj.shortMessage) {
        errorMessage = errorObj.shortMessage;
      }
      
      setToast(errorMessage);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(null);
    }
  }

  async function onShare() {
    const text = shareReady?.title ? `${shareReady.title} — Stride & Rise` : "Stride & Rise Contributions";
    // Try Base MiniKit compose (inside Base App)
    if (typeof window !== "undefined" && window.minikit?.composeCast) {
      window.minikit.composeCast({ text: `${text} 🏃‍♀️`, embeds: [appUrl] });
      return;
    }
    // Fallback: copy link
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(appUrl);
      setToast("Link copied — share it!"); 
      setTimeout(() => setToast(null), 1500);
    }
  }

  if (!address) {
    return (
      <div className="card" style={{ 
        padding: 'var(--spacing-xl)', 
        textAlign: "center", 
        background: "var(--color-surface)", 
      }}>
        <div style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>🔗</div>
        <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>Connect Wallet</div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Connect your wallet to start earning contribution badges on Base
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 'var(--spacing-md)' }}>
      {/* Contribution Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 'var(--spacing-md)' }}>
        {BUTTONS.map(b => {
          const cooldown = getCooldownForType(b.key);
          const isDisabled = loading === b.key || cooldown.isDisabled;
          
          return (
            <button
              key={b.key}
              onClick={() => onClick(b.key)}
              disabled={isDisabled}
              className={`btn ${loading === b.key ? 'celebration-pulse' : ''}`}
              style={{
                padding: 'var(--spacing-lg)', 
                borderRadius: 'var(--radius-lg)', 
                border: `1px solid var(--color-border)`,
                fontSize: 'var(--font-size-lg)', 
                background: isDisabled ? 'var(--color-surface)' : 'var(--color-background)', 
                textAlign: "left", 
                boxShadow: 'var(--shadow-sm)',
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.6 : 1,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)'
              }}
            >
              <div style={{ fontSize: 'var(--font-size-3xl)' }}>{b.emoji}</div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                fontWeight: 'var(--font-weight-bold)' 
              }}>
                {loading === b.key ? "Processing..." : b.label}
                <PillBadge 
                  points={b.points} 
                  variant={getPointsVariant(b.points)}
                  size="sm"
                />
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {loading === b.key 
                  ? "Confirming transaction..." 
                  : cooldown.isDisabled 
                    ? `Wait ${formatTimeRemaining(cooldown.timeRemaining)}`
                    : hint(b.key)
                }
              </div>
            </button>
          );
        })}
      </div>

      {/* Share Button */}
      {shareReady && (
        <button 
          onClick={onShare}
          className="btn btn--primary"
          style={{ 
            padding: 'var(--spacing-lg)', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 'var(--font-weight-bold)' 
          }}
        >
          Share to Base feed
        </button>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{totals.points}</div>
          <div className="stat-label">Points</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totals.streak || 0}</div>
          <div className="stat-label">Streak 🔥</div>
        </div>
      </div>

      {/* Badges */}
      {totals.badges.length > 0 && (
        <div className="card status-success" style={{ padding: 'var(--spacing-md)' }}>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
            🏆 Badges Earned
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>
            {totals.badges.join(", ")}
          </div>
        </div>
      )}

      {/* Celebration Effect */}
      {celebrationActive && celebrationType && (
        <CelebrationEffect 
          isActive={celebrationActive}
          type={celebrationType}
          onComplete={completeCelebration}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", 
          bottom: 'var(--spacing-2xl)', 
          left: 'var(--spacing-md)', 
          right: 'var(--spacing-md)', 
          padding: 'var(--spacing-lg)',
          background: "var(--color-text)", 
          color: "var(--color-background)", 
          textAlign: "center", 
          borderRadius: 'var(--radius-md)', 
          zIndex: 50,
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)'
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function hint(key: ContributionType) {
  switch (key) {
    case "ATTEND": return "Check in for today's run";
    case "HOST": return "Record that you led today's run";
    case "PACE": return "Helped pace the group";
    case "SUPPLIES": return "Brought water/snacks";
  }
}
