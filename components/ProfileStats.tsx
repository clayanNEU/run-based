"use client";

import * as React from "react";
import type { BlockchainTotals } from "../lib/blockchain-store";

interface ProfileStatsProps {
  totals: BlockchainTotals;
  className?: string;
}

export default function ProfileStats({ totals, className = '' }: ProfileStatsProps) {
  // Calculate total contributions
  const totalContributions = totals.attend + totals.host + totals.pace + totals.supplies;
  
  // Calculate tips in ETH (assuming tips are in wei)
  const tipsReceivedEth = Number(totals.tipsReceived) / 1e18;
  const tipsSentEth = Number(totals.tipsSent) / 1e18;
  
  const stats = [
    {
      value: totalContributions,
      label: 'Contributions',
      icon: '🏃‍♀️'
    },
    {
      value: totals.points,
      label: 'Points',
      icon: '⭐'
    },
    {
      value: totals.streak || 0,
      label: 'Streak',
      icon: '🔥'
    },
    {
      value: totals.badges.length,
      label: 'Badges',
      icon: '🏆'
    }
  ];
  
  // Add tips stats if user has received or sent tips
  if (tipsReceivedEth > 0 || tipsSentEth > 0) {
    stats.push({
      value: parseFloat(tipsReceivedEth.toFixed(4)),
      label: 'USDC Received',
      icon: '💰'
    });
  }
  
  return (
    <div className={`stats-grid ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-value">
            {typeof stat.value === 'number' && stat.value > 999 
              ? `${(stat.value / 1000).toFixed(1)}k`
              : stat.value
            }
          </div>
          <div className="stat-label">
            <span style={{ marginRight: 'var(--spacing-xs)' }}>{stat.icon}</span>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced version with detailed breakdown
interface DetailedProfileStatsProps {
  totals: BlockchainTotals;
  showBreakdown?: boolean;
  className?: string;
}

export function DetailedProfileStats({ 
  totals, 
  showBreakdown = false, 
  className = '' 
}: DetailedProfileStatsProps) {
  const [showDetails, setShowDetails] = React.useState(showBreakdown);
  
  const contributionBreakdown = [
    { type: 'Attend', count: totals.attend, emoji: '✅', points: totals.attend * 10 },
    { type: 'Host', count: totals.host, emoji: '🏁', points: totals.host * 50 },
    { type: 'Pace', count: totals.pace, emoji: '⏱️', points: totals.pace * 20 },
    { type: 'Supplies', count: totals.supplies, emoji: '🧃', points: totals.supplies * 15 },
  ].filter(item => item.count > 0);
  
  return (
    <div className={className}>
      <ProfileStats totals={totals} />
      
      {contributionBreakdown.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              padding: 'var(--spacing-xs) 0',
              marginBottom: 'var(--spacing-md)'
            }}
          >
            {showDetails ? 'Hide' : 'Show'} Contribution Breakdown
          </button>
          
          {showDetails && (
            <div className="card" style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ 
                display: 'grid', 
                gap: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {contributionBreakdown.map((item, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--spacing-xs) 0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span style={{ fontSize: 'var(--font-size-lg)' }}>{item.emoji}</span>
                      <span>{item.type}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-md)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      <span>{item.count}x</span>
                      <span style={{ 
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-success)'
                      }}>
                        {item.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {totals.badges.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            Achievement Badges
          </div>
          <div className="card status-success" style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-sm)'
            }}>
              {totals.badges.map((badge, index) => (
                <span 
                  key={index}
                  className="pill-badge pill-badge--success"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
