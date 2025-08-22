"use client";

import * as React from "react";
import { Identity, Name, Avatar } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import { formatAddress, type LeaderboardEntry } from '../lib/leaderboard-api';

type LeaderboardEntryProps = {
  entry: LeaderboardEntry;
  rank: number;
  currentUserAddress?: string;
  onTip?: (address: string, name: string) => void;
};


export default function LeaderboardEntryComponent({ 
  entry, 
  rank, 
  currentUserAddress,
  onTip 
}: LeaderboardEntryProps) {
  const isCurrentUser = currentUserAddress?.toLowerCase() === entry.address.toLowerCase();
  const fallbackName = entry.displayName || formatAddress(entry.address);
  
  return (
    <div style={{
      display: "grid", 
      gridTemplateColumns: "32px 48px 1fr auto auto",
      alignItems: "center", 
      padding: 12, 
      border: "1px solid #eee", 
      borderRadius: 12,
      background: isCurrentUser ? "#f0f8ff" : "#fff",
      gap: 12
    }}>
      {/* Rank */}
      <div style={{ 
        textAlign: "center", 
        fontWeight: 600,
        color: rank <= 3 ? "#d4af37" : "#666"
      }}>
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
      </div>

      {/* Avatar */}
      <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden" }}>
        <Identity address={entry.address as `0x${string}`} chain={base}>
          <Avatar 
            className="w-10 h-10" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: 'block'
            }} 
          />
        </Identity>
      </div>

      {/* Name and Address */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <Name 
            address={entry.address as `0x${string}`} 
            chain={base}
            className="font-semibold"
          />
          {isCurrentUser && (
            <span style={{ 
              fontSize: 12, 
              color: "#0066cc",
              fontWeight: 500
            }}>
              (You)
            </span>
          )}
          {!entry.isRealUser && (
            <span style={{ 
              fontSize: 10, 
              color: "#888",
              background: "#f0f0f0",
              padding: "2px 6px",
              borderRadius: 4,
              fontWeight: 500
            }}>
              DEMO
            </span>
          )}
        </div>
        
        {/* Contribution breakdown */}
        <div style={{ 
          fontSize: 12, 
          color: "#888", 
          marginTop: 2,
          display: "flex",
          gap: 8
        }}>
          {entry.contributions.attend > 0 && (
            <span>✅ {entry.contributions.attend}</span>
          )}
          {entry.contributions.host > 0 && (
            <span>🏁 {entry.contributions.host}</span>
          )}
          {entry.contributions.pace > 0 && (
            <span>⏱️ {entry.contributions.pace}</span>
          )}
          {entry.contributions.supplies > 0 && (
            <span>🧃 {entry.contributions.supplies}</span>
          )}
        </div>
      </div>

      {/* Points */}
      <div style={{ 
        textAlign: "right",
        fontWeight: 600,
        fontSize: 16
      }}>
        <div>{entry.points} pts</div>
      </div>

      {/* Tip Button */}
      {onTip && !isCurrentUser && (
        <button
          onClick={() => onTip(entry.address, fallbackName)}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            background: "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          👏 Tip
        </button>
      )}
    </div>
  );
}
