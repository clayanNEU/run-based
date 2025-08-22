"use client";

import * as React from "react";
import { useAccount } from 'wagmi';
import { Identity, Name, Avatar } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import { getBlockchainTotals, type BlockchainTotals } from "../../lib/blockchain-store";
import { DetailedProfileStats } from "../../components/ProfileStats";

export default function ProfilePage() {
  const { address } = useAccount();
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
          overflow: 'hidden',
          margin: '0 auto var(--spacing-md)',
          border: '3px solid var(--color-primary)'
        }}>
          {address ? (
            <Identity address={address as `0x${string}`} chain={base}>
              <Avatar 
                className="w-full h-full" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  display: 'block'
                }} 
              />
            </Identity>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-2xl)',
              color: 'white',
              fontWeight: 'var(--font-weight-bold)'
            }}>
              🏃‍♀️
            </div>
          )}
        </div>
        
        {/* Username/Address */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          {address ? (
            <h2 style={{ 
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)'
            }}>
              <Name 
                address={address as `0x${string}`} 
                chain={base}
                className="font-bold text-xl" 
              />
            </h2>
          ) : (
            <h2 style={{ 
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)'
            }}>
              Runner
            </h2>
          )}
        </div>
        
        {/* Address */}
        {address && (
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--color-text-secondary)',
            fontFamily: 'monospace',
            background: 'var(--color-surface)',
            padding: 'var(--spacing-xs) var(--spacing-md)',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block'
          }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
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
    </div>
  );
}
