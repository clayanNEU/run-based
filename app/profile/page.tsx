"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { getBlockchainTotals, type BlockchainTotals } from "../../lib/blockchain-store";
import { useBasename, isBasename } from "../../lib/basename-resolver";
import { DetailedProfileStats } from "../../components/ProfileStats";

export default function ProfilePage() {
  const { address } = useAccount();
  const { basename, isLoading: basenameLoading } = useBasename(address);
  const [totals, setTotals] = React.useState<BlockchainTotals>({
    attend: 0, host: 0, pace: 0, supplies: 0,
    points: 0, streak: 0, badges: [],
    tipsReceived: 0, tipsSent: 0
  });

  // Load blockchain data when wallet connects
  React.useEffect(() => {
    if (address) {
      getBlockchainTotals(address).then(setTotals);
    }
  }, [address]);

  if (!address) {
    return (
      <div style={{ display: "grid", gap: 'var(--spacing-lg)' }}>
        <h2 style={{ 
          marginTop: 0, 
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text)'
        }}>
          My Profile
        </h2>
        <div className="card" style={{ 
          padding: 'var(--spacing-xl)', 
          textAlign: "center",
          background: 'var(--color-surface)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>🔗</div>
          <div style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 'var(--font-weight-semibold)', 
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-text)'
          }}>
            Connect Wallet
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--color-text-secondary)' 
          }}>
            Connect your wallet to view your contribution profile and NFT collection
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 'var(--spacing-lg)' }}>
      {/* Profile Header */}
      <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
        {/* Profile Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-md)',
          fontSize: 'var(--font-size-2xl)',
          color: 'white',
          fontWeight: 'var(--font-weight-bold)'
        }}>
          🏃‍♀️
        </div>
        
        {/* Username/Address */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          {basenameLoading ? (
            <div style={{ 
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)'
            }}>
              Loading...
            </div>
          ) : (
            <h2 style={{ 
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)'
            }}>
              {isBasename(basename) ? basename : 'Runner'}
            </h2>
          )}
        </div>
        
        {/* Address */}
        <div style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--color-text-secondary)',
          fontFamily: 'monospace',
          background: 'var(--color-surface)',
          padding: 'var(--spacing-xs) var(--spacing-md)',
          borderRadius: 'var(--radius-full)',
          display: 'inline-block'
        }}>
          {address ? (isBasename(basename) ? address.slice(0, 6) + '...' + address.slice(-4) : basename) : ''}
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <h3 style={{ 
          marginBottom: 'var(--spacing-md)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text)'
        }}>
          📊 Your Stats
        </h3>
        <DetailedProfileStats totals={totals} showBreakdown={false} />
      </div>


      {/* Blockchain Info */}
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        <div style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-xs)'
        }}>
          <span>⛓️</span>
          <span>Your achievements are permanently stored on Base blockchain</span>
        </div>
      </div>
    </div>
  );
}
