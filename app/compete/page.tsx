"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import EmptyState from '@/components/EmptyState';

type Competition = {
  id: string;
  name: string;
  description: string;
  entryFee: number;
  prizePool: number;
  participants: number;
  endTime: string;
  status: 'active' | 'upcoming' | 'completed';
  winner?: {
    name: string;
    time: string;
  };
  myEntry?: {
    time: string;
    rank: number;
  };
};

const mockCompetitions: Competition[] = [
  {
    id: '1',
    name: '5K Speed Challenge',
    description: 'Fastest 5K time wins the pot! Submit your time with proof.',
    entryFee: 5,
    prizePool: 45,
    participants: 9,
    endTime: '2 days left',
    status: 'active',
    myEntry: {
      time: '22:30',
      rank: 2
    }
  },
  {
    id: '2',
    name: 'Weekend 10K',
    description: 'Best 10K time this weekend takes all the prize money!',
    entryFee: 10,
    prizePool: 120,
    participants: 12,
    endTime: '5 days left',
    status: 'active'
  },
  {
    id: '3',
    name: 'Marathon Challenge',
    description: 'Full marathon distance - biggest prize pool yet!',
    entryFee: 25,
    prizePool: 300,
    participants: 12,
    endTime: 'Ended',
    status: 'completed',
    winner: {
      name: 'SpeedRunner.base',
      time: '3:05:42'
    }
  }
];

export default function CompetePage() {
  const { isConnected } = useAccount();
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  const filteredCompetitions = mockCompetitions.filter(comp => comp.status === selectedTab);

  if (!isConnected) {
    return (
      <EmptyState
        icon="🔐"
        title="Connect Wallet"
        description="Connect your wallet to view and join competitions"
      />
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>⚡ Compete</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
          Join friendly competitions and win USDC prizes!
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-background)'
      }}>
        {(['active', 'upcoming', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: selectedTab === tab ? 'var(--color-primary)' : 'transparent',
              color: selectedTab === tab ? 'white' : 'var(--color-text)',
              fontSize: 14,
              fontWeight: selectedTab === tab ? 600 : 400,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab} ({mockCompetitions.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>

      {/* Competitions List */}
      <div style={{ padding: 16 }}>
        {filteredCompetitions.length === 0 ? (
          <EmptyState
            icon="🏃‍♂️"
            title={`No ${selectedTab} competitions`}
            description={`Check back later for ${selectedTab} competitions`}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        )}
      </div>

      {/* Create Competition Button */}
      <div style={{ padding: 16, borderTop: '1px solid var(--color-border)' }}>
        <button
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px dashed var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
          onClick={() => alert('Create competition feature coming soon!')}
        >
          + Create New Competition
        </button>
      </div>
    </div>
  );
}

function CompetitionCard({ competition }: { competition: Competition }) {
  const getStatusColor = (status: Competition['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'upcoming': return '#f59e0b';
      case 'completed': return '#6b7280';
    }
  };

  const getStatusEmoji = (status: Competition['status']) => {
    switch (status) {
      case 'active': return '🔥';
      case 'upcoming': return '⏰';
      case 'completed': return '🏆';
    }
  };

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: 16,
      background: 'var(--color-background)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{competition.name}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>
            {competition.description}
          </p>
        </div>
        <div style={{
          padding: '4px 8px',
          borderRadius: 6,
          background: getStatusColor(competition.status) + '20',
          color: getStatusColor(competition.status),
          fontSize: 12,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          {getStatusEmoji(competition.status)} {competition.status}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>
            ${competition.entryFee}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Entry Fee</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#10b981' }}>
            ${competition.prizePool}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Prize Pool</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {competition.participants}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Runners</div>
        </div>
      </div>

      {/* Time Info */}
      {competition.status === 'active' && (
        <div style={{ 
          padding: 8, 
          background: '#fef3c7', 
          borderRadius: 6, 
          marginBottom: 12,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#92400e' }}>
            ⏰ {competition.endTime}
          </div>
        </div>
      )}

      {/* My Entry */}
      {competition.myEntry && (
        <div style={{
          padding: 12,
          background: 'var(--color-primary)' + '10',
          borderRadius: 8,
          marginBottom: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Your Time</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>
                {competition.myEntry.time}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Rank</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                #{competition.myEntry.rank}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winner */}
      {competition.winner && (
        <div style={{
          padding: 12,
          background: '#f0fdf4',
          borderRadius: 8,
          marginBottom: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#166534' }}>🏆 Winner</div>
              <div style={{ fontSize: 14, color: '#166534' }}>
                {competition.winner.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#166534' }}>
                {competition.winner.time}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div>
        {competition.status === 'upcoming' && (
          <button
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '1px solid var(--color-primary)',
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
            onClick={() => alert('Join competition feature coming soon!')}
          >
            Join Competition (${competition.entryFee})
          </button>
        )}
        {competition.status === 'active' && !competition.myEntry && (
          <button
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '1px solid var(--color-primary)',
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
            onClick={() => alert('Join competition feature coming soon!')}
          >
            Join Competition (${competition.entryFee})
          </button>
        )}
        {competition.status === 'active' && competition.myEntry && (
          <button
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '1px solid #10b981',
              background: '#10b981',
              color: 'white',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
            onClick={() => alert('Submit new time feature coming soon!')}
          >
            Submit New Time
          </button>
        )}
        {competition.status === 'completed' && (
          <button
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              borderRadius: 8,
              cursor: 'not-allowed',
              fontSize: 14,
              fontWeight: 500
            }}
            disabled
          >
            Competition Ended
          </button>
        )}
      </div>
    </div>
  );
}
