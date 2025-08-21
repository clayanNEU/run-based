"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { 
  getBlockchainTotals, 
  makeBlockchainContribution, 
  getSuccessMessage,
  getPointsForType,
  type ContributionType,
  type BlockchainTotals 
} from "../lib/blockchain-store";

type Btn = { key: ContributionType; label: string; emoji: string; note: string };

const BUTTONS: Btn[] = [
  { key: "ATTEND",  label: "Attend",   emoji: "✅", note: `+${getPointsForType("ATTEND")}` },
  { key: "HOST",    label: "Host",     emoji: "🏁", note: `+${getPointsForType("HOST")}` },
  { key: "PACE",    label: "Pace",     emoji: "⏱️", note: `+${getPointsForType("PACE")}` },
  { key: "SUPPLIES",label: "Supplies", emoji: "🧃", note: `+${getPointsForType("SUPPLIES")}` },
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

    setLoading(key);
    
    try {
      // Make blockchain transaction
      await makeBlockchainContribution(key);
      
      // Refresh data from blockchain
      const newTotals = await getBlockchainTotals(address);
      setTotals(newTotals);
      
      const msg = getSuccessMessage(key);
      setToast(`${msg} + NFT minted! 🎉`);
      setShareReady({ title: msg });
    } catch (error: any) {
      console.error('Transaction failed:', error);
      let errorMessage = "Transaction failed";
      
      // Parse common error messages
      if (error.message?.includes("Already contributed this type today")) {
        errorMessage = "Already contributed today ✅";
      } else if (error.message?.includes("User rejected")) {
        errorMessage = "Transaction cancelled";
      } else if (error.shortMessage) {
        errorMessage = error.shortMessage;
      }
      
      setToast(errorMessage);
    } finally {
      setLoading(null);
      setTimeout(() => setToast(null), 3000);
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
      <div style={{ 
        padding: 20, 
        textAlign: "center", 
        background: "#f9f9f9", 
        borderRadius: 12,
        border: "1px solid #eee"
      }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>🔗</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Connect Wallet</div>
        <div style={{ fontSize: 14, color: "#666" }}>
          Connect your wallet to start earning contribution badges on Base
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {BUTTONS.map(b => (
          <button
            key={b.key}
            onClick={() => onClick(b.key)}
            disabled={loading === b.key}
            style={{
              padding: 18, borderRadius: 14, border: "1px solid #e8e8e8",
              fontSize: 18, background: loading === b.key ? "#f0f0f0" : "#fff", 
              textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              cursor: loading === b.key ? "not-allowed" : "pointer",
              opacity: loading === b.key ? 0.7 : 1
            }}
          >
            <div style={{ fontSize: 28 }}>{b.emoji}</div>
            <div style={{ fontWeight: 700 }}>
              {loading === b.key ? "Processing..." : b.label} 
              <span style={{ color: "#666", fontWeight: 500 }}> {b.note}</span>
            </div>
            <div style={{ fontSize: 12, color: "#777" }}>
              {loading === b.key ? "Confirming transaction..." : hint(b.key)}
            </div>
          </button>
        ))}
      </div>

      {shareReady && (
        <button onClick={onShare}
          style={{ padding: 14, borderRadius: 12, background: "#111", color: "#fff", fontWeight: 700 }}>
          Share to Base feed
        </button>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14,
        background: "#fafafa", padding: 12, borderRadius: 12, border: "1px solid #eee"
      }}>
        <div><strong>Points</strong><div>{totals.points}</div></div>
        <div><strong>Streak</strong><div>{totals.streak || 0} 🔥</div></div>
      </div>

      {totals.badges.length > 0 && (
        <div style={{
          background: "#fff3cd", padding: 12, borderRadius: 12, border: "1px solid #ffeaa7"
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>🏆 Badges Earned</div>
          <div style={{ fontSize: 14 }}>
            {totals.badges.join(", ")}
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: 12, right: 12, padding: 14,
          background: "#111", color: "#fff", textAlign: "center", borderRadius: 12, zIndex: 50
        }}>{toast}</div>
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
