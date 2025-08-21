"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { getBlockchainTotals, getNetworkInfo, getDebugInfo, type BlockchainTotals } from "../../lib/blockchain-store";

export default function ProfilePage() {
  const { address } = useAccount();
  const [totals, setTotals] = React.useState<BlockchainTotals>({
    attend: 0, host: 0, pace: 0, supplies: 0,
    points: 0, streak: 0, badges: [],
    tipsReceived: 0, tipsSent: 0
  });
  const [networkInfo, setNetworkInfo] = React.useState<{
    chainId: number;
    chainName: string;
    isCorrectNetwork: boolean;
    expectedChainId: number;
    expectedChainName: string;
  } | null>(null);

  // Load blockchain data and network info when wallet connects
  React.useEffect(() => {
    if (address) {
      getBlockchainTotals(address).then(setTotals);
      getNetworkInfo().then(setNetworkInfo);
    }
  }, [address]);

  if (!address) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <h2 style={{ marginTop: 0 }}>My Profile</h2>
        <div style={{ 
          padding: 20, 
          background: "#f9f9f9", 
          borderRadius: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Connect Wallet
          </div>
          <div style={{ fontSize: 14, color: "#666" }}>
            Connect your wallet to view your contribution profile and NFT collection
          </div>
        </div>
      </div>
    );
  }

  const badges = totals.badges.length ? totals.badges : ["No badges yet"];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ marginTop: 0 }}>My Profile</h2>
        <div style={{ fontSize: 14, color: "#666", fontFamily: "monospace" }}>
          {address}
        </div>
      </div>

      {/* Badge Collection */}
      <div>
        <h3 style={{ marginBottom: 12 }}>🏆 Badge Collection</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <BadgeCard emoji="✅" label="Attend" count={totals.attend} />
          <BadgeCard emoji="🏁" label="Host" count={totals.host} />
          <BadgeCard emoji="⏱️" label="Pace" count={totals.pace} />
          <BadgeCard emoji="🧃" label="Supplies" count={totals.supplies} />
        </div>
        <div style={{ 
          fontSize: 12, 
          color: "#888", 
          marginTop: 8,
          textAlign: "center"
        }}>
          <span title="Your badges are permanently stored onchain on Base network">
            ⓘ Badges are onchain & permanent on Base
          </span>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 style={{ marginBottom: 12 }}>📊 Stats</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Stat label="Total Points" value={totals.points} />
          <Stat label="Current Streak" value={`${totals.streak || 0} 🔥`} />
          <Stat label="Tips Received" value={`${(totals.tipsReceived / 1e18).toFixed(4)} ETH`} />
          <Stat label="Tips Sent" value={`${(totals.tipsSent / 1e18).toFixed(4)} ETH`} />
        </div>
      </div>

      {/* Achievement Badges */}
      <div>
        <h3 style={{ marginBottom: 12 }}>🎖️ Achievement Badges</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {badges.map((badge, i) => (
            <span 
              key={i} 
              style={{ 
                padding: "8px 12px", 
                borderRadius: 999, 
                background: badge === "No badges yet" ? "#f1f1f1" : "#e8f5e8", 
                fontSize: 12,
                border: badge === "No badges yet" ? "1px solid #ddd" : "1px solid #90ee90"
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Network Status */}
      {networkInfo && (
        <div>
          <h3 style={{ marginBottom: 12 }}>🌐 Network Status</h3>
          <div style={{
            background: networkInfo.isCorrectNetwork ? "#d4edda" : "#f8d7da",
            border: networkInfo.isCorrectNetwork ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
            padding: 12, borderRadius: 12, fontSize: 14
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Connected to: {networkInfo.chainName}
            </div>
            {!networkInfo.isCorrectNetwork && (
              <div style={{ color: "#721c24" }}>
                ⚠️ Please switch to {networkInfo.expectedChainName} to use the app
              </div>
            )}
          </div>
        </div>
      )}


      {/* Debug Information */}
      <div>
        <h3 style={{ marginBottom: 12 }}>🔧 Debug Information</h3>
        <div style={{
          background: "#f8f9fa", padding: 12, borderRadius: 12, border: "1px solid #dee2e6",
          fontSize: 12, fontFamily: "monospace"
        }}>
          <div><strong>Contract Address:</strong> {getDebugInfo().contractAddress}</div>
          <div><strong>Expected Network:</strong> {getDebugInfo().expectedChainName} ({getDebugInfo().expectedChainId})</div>
          <div><strong>Current Network:</strong> {networkInfo?.chainName} ({networkInfo?.chainId})</div>
          <div><strong>Network Status:</strong> {networkInfo?.isCorrectNetwork ? '✅ Correct' : '❌ Wrong'}</div>
          <div><strong>Explorer:</strong> <a href={getDebugInfo().explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc" }}>{getDebugInfo().explorerUrl}</a></div>
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ emoji, label, count }: { emoji: string; label: string; count: number }) {
  return (
    <div style={{ 
      border: "1px solid #e8e8e8", 
      borderRadius: 12, 
      padding: 12,
      textAlign: "center",
      background: count > 0 ? "#f0f8ff" : "#fff"
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{count}</div>
      <div style={{ fontSize: 12, color: "#777" }}>{label} Badges</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#777" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
    </div>
  );
}
