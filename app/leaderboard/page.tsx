"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { getEnhancedLeaderboardData, type LeaderboardEntry } from "../../lib/leaderboard-api";
import LeaderboardEntryComponent from "../../components/LeaderboardEntry";
import TipButton from "../../components/TipButton";

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTip, setSelectedTip] = React.useState<{ address: string; name: string } | null>(null);

  // Load leaderboard data
  React.useEffect(() => {
    loadLeaderboard();
  }, [address]); // Reload when wallet address changes

  async function loadLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      const data = await getEnhancedLeaderboardData(address);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }

  function handleTipClick(tipAddress: string, name: string) {
    setSelectedTip({ address: tipAddress, name });
  }

  if (loading) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>All-Time Leaderboard</h2>
        <div style={{ 
          padding: 40, 
          textAlign: "center", 
          color: "#666",
          background: "#f9f9f9",
          borderRadius: 12,
          border: "1px solid #eee"
        }}>
          Loading blockchain data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>All-Time Leaderboard</h2>
        <div style={{ 
          padding: 20, 
          textAlign: "center", 
          color: "#d32f2f",
          background: "#ffebee",
          borderRadius: 12,
          border: "1px solid #ffcdd2"
        }}>
          {error}
          <button 
            onClick={loadLeaderboard}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: 0, marginBottom: 16 }}>All-Time Leaderboard</h2>

      {leaderboard.length === 0 ? (
        <div style={{ 
          padding: 40, 
          textAlign: "center", 
          color: "#666",
          background: "#f9f9f9",
          borderRadius: 12,
          border: "1px solid #eee"
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏃‍♀️</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No contributions yet</div>
          <div style={{ fontSize: 14 }}>
            Be the first to earn badges and climb the leaderboard!
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {leaderboard.map((entry, index) => (
            <LeaderboardEntryComponent
              key={entry.address}
              entry={entry}
              rank={index + 1}
              currentUserAddress={address}
              onTip={handleTipClick}
            />
          ))}
        </div>
      )}

      {/* Tip Modal */}
      {selectedTip && (
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
          zIndex: 100
        }}>
          <div style={{
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            maxWidth: 400,
            width: "90%"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: 16 
            }}>
              <h3 style={{ margin: 0 }}>
                Support {selectedTip.name}
              </h3>
              <button 
                onClick={() => setSelectedTip(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            
            <TipButton 
              recipientAddress={selectedTip.address}
              recipientName={selectedTip.name}
            />
          </div>
        </div>
      )}

    </div>
  );
}
