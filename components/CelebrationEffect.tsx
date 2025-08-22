"use client";

import * as React from "react";
import type { ContributionType } from '../lib/blockchain-store';

interface CelebrationEffectProps {
  isActive: boolean;
  type: ContributionType;
  onComplete?: () => void;
}

export default function CelebrationEffect({ 
  isActive, 
  type, 
  onComplete 
}: CelebrationEffectProps) {
  const [showEffect, setShowEffect] = React.useState(false);
  
  React.useEffect(() => {
    if (isActive) {
      setShowEffect(true);
      
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        setShowEffect(false);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);
  
  if (!showEffect) return null;
  
  const getEmoji = (contributionType: ContributionType) => {
    switch (contributionType) {
      case 'ATTEND': return '✅';
      case 'HOST': return '🏁';
      case 'PACE': return '⏱️';
      case 'SUPPLIES': return '🧃';
      default: return '🎉';
    }
  };
  
  const getMessage = (contributionType: ContributionType) => {
    switch (contributionType) {
      case 'ATTEND': return 'Checked In!';
      case 'HOST': return 'Host Badge Earned!';
      case 'PACE': return 'Pace Leader!';
      case 'SUPPLIES': return 'Supply Hero!';
      default: return 'Badge Earned!';
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {/* Backdrop */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.3s ease-out',
      }} />
      
      {/* Main celebration content */}
      <div style={{
        background: 'var(--color-background)',
        border: '2px solid var(--color-success)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-3xl)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        animation: 'celebrationBounce 0.6s ease-out',
        maxWidth: '300px',
        width: '90%',
      }}>
        {/* Emoji */}
        <div style={{
          fontSize: '48px',
          marginBottom: 'var(--spacing-lg)',
          animation: 'celebrationPulse 1s ease-in-out infinite',
        }}>
          {getEmoji(type)}
        </div>
        
        {/* Message */}
        <div style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-success)',
          marginBottom: 'var(--spacing-md)',
        }}>
          {getMessage(type)}
        </div>
        
        {/* NFT Badge text */}
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          NFT Badge Minted! 🎉
        </div>
        
        {/* Confetti elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          right: '10%',
          bottom: '10%',
          pointerEvents: 'none',
        }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: `hsl(${i * 45}, 70%, 60%)`,
                borderRadius: '50%',
                animation: `confetti${i % 4} 1.5s ease-out`,
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
            />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes celebrationBounce {
          0% { 
            transform: scale(0.3) translateY(100px);
            opacity: 0;
          }
          50% { 
            transform: scale(1.05) translateY(-10px);
            opacity: 1;
          }
          70% { 
            transform: scale(0.95) translateY(5px);
          }
          100% { 
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes confetti0 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(180deg); opacity: 0; }
        }
        
        @keyframes confetti1 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-80px) rotate(-180deg); opacity: 0; }
        }
        
        @keyframes confetti2 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-120px) rotate(270deg); opacity: 0; }
        }
        
        @keyframes confetti3 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-90px) rotate(-270deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Hook for managing celebration state
export function useCelebration() {
  const [celebrationState, setCelebrationState] = React.useState<{
    isActive: boolean;
    type: ContributionType | null;
  }>({
    isActive: false,
    type: null,
  });
  
  const triggerCelebration = React.useCallback((type: ContributionType) => {
    setCelebrationState({
      isActive: true,
      type,
    });
  }, []);
  
  const completeCelebration = React.useCallback(() => {
    setCelebrationState({
      isActive: false,
      type: null,
    });
  }, []);
  
  return {
    ...celebrationState,
    triggerCelebration,
    completeCelebration,
  };
}
