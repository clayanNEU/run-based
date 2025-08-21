"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { 
  getBlockchainTotals, 
  makeBlockchainContribution, 
  getSuccessMessage,
  getPointsForType,
  getNetworkInfo,
  getDebugInfo,
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
  const [networkInfo, setNetworkInfo] = React.useState<{
    chainId: number;
    chainName: string;
    isCorrectNetwork: boolean;
    expectedChainId: number;
    expectedChainName: string;
  } | null>(null);
  const [showDebug, setShowDebug] = React.useState(false);
  const [lastTransaction, setLastTransaction] = React.useState<{ hash: string; explorerUrl: string } | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://run-based.vercel.app";

  // Load blockchain data and network info when wallet connects
  React.useEffect(() => {
    if (address) {
      getBlockchainTotals(address).then(setTotals);
      getNetworkInfo().then(setNetworkInfo);
    }
  }, [address]);

  async function onClick(key: ContributionType) {
    if (!address) {
      setToast("Please connect wallet");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // Check network before proceeding
    const currentNetworkInfo = await getNetworkInfo();
    setNetworkInfo(currentNetworkInfo);
    
    if (!currentNetworkInfo.isCorrectNetwork) {
      setToast(`Wrong network! Please switch to ${currentNetworkInfo.expectedChainName}`);
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setLoading(key);
    setLastTransaction(null);
    
    try {
      // Show transaction submitted message
      setToast("Transaction submitted... ⏳");
      
      // Make blockchain transaction and wait for confirmation
      const result = await makeBlockchainContribution(key);
      setLastTransaction(result);
      
      // Show transaction hash briefly
      setToast(`Transaction confirmed! Hash: ${result.hash.slice(0, 10)}...`);
      
      // Wait a moment then refresh data from blockchain
      setTimeout(async () => {
        const newTotals = await getBlockchainTotals(address);
        setTotals(newTotals);
        
        const msg = getSuccessMessage(key);
        setToast(`${msg} + NFT minted! 🎉`);
        setShareReady({ title: msg });
        
        setTimeout(() => setToast(null), 3000);
      }, 1000);
      
    } catch (error: unknown) {
      console.error('Transaction failed:', error);
      let errorMessage = "Transaction failed";
      
      // Parse common error messages
      const errorObj = error as { message?: string; shortMessage?: string };
      if (errorObj.message?.includes("Already contributed this type today")) {
        errorMessage = "Already contributed today ✅";
      } else if (errorObj.message?.includes("User rejected")) {
        errorMessage = "Transaction cancelled";
      } else if (errorObj.message?.includes("Wrong network")) {
        errorMessage = errorObj.message;
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

      {/* Network Status */}
      {networkInfo && (
        <div style={{
          background: networkInfo.isCorrectNetwork ? "#d4edda" : "#f8d7da",
          border: networkInfo.isCorrectNetwork ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
          padding: 12, borderRadius: 12, fontSize: 14
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            🌐 Network: {networkInfo.chainName}
          </div>
          {!networkInfo.isCorrectNetwork && (
            <div style={{ color: "#721c24" }}>
              ⚠️ Please switch to {networkInfo.expectedChainName}
            </div>
          )}
        </div>
      )}

      {/* Last Transaction */}
      {lastTransaction && (
        <div style={{
          background: "#e8f5e8", padding: 12, borderRadius: 12, border: "1px solid #90ee90"
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>✅ Last Transaction</div>
          <div style={{ fontSize: 12, fontFamily: "monospace", marginBottom: 4 }}>
            {lastTransaction.hash}
          </div>
          <a 
            href={lastTransaction.explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: "#0066cc", textDecoration: "underline" }}
          >
            View on BaseScan →
          </a>
        </div>
      )}

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

      {/* Debug Info Toggle */}
      <button 
        onClick={() => setShowDebug(!showDebug)}
        style={{
          padding: 8, fontSize: 12, background: "#f8f9fa", border: "1px solid #dee2e6",
          borderRadius: 8, cursor: "pointer"
        }}
      >
        {showDebug ? "Hide" : "Show"} Debug Info
      </button>

      {showDebug && (
        <div style={{
          background: "#f8f9fa", padding: 12, borderRadius: 12, border: "1px solid #dee2e6",
          fontSize: 12, fontFamily: "monospace"
        }}>
          <div><strong>Debug Information:</strong></div>
          <div>Contract: {getDebugInfo().contractAddress}</div>
          <div>Expected Chain: {getDebugInfo().expectedChainName} ({getDebugInfo().expectedChainId})</div>
          <div>Current Chain: {networkInfo?.chainName} ({networkInfo?.chainId})</div>
          <div>Explorer: {getDebugInfo().explorerUrl}</div>
          <div>Wallet Connected: {address ? 'Yes' : 'No'}</div>
          {address && <div>Address: {address}</div>}
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
