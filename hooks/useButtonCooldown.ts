"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ContributionType } from '../lib/blockchain-store';

interface ButtonState {
  isDisabled: boolean;
  lastUsed: number | null;
  cooldownPeriod: number;
  timeRemaining: number;
}

const COOLDOWN_PERIODS = {
  ATTEND: 5000,    // 5 seconds
  HOST: 10000,     // 10 seconds  
  PACE: 7000,      // 7 seconds
  SUPPLIES: 5000,  // 5 seconds
} as const;

export function useButtonCooldown(contributionType: ContributionType): ButtonState & {
  triggerCooldown: () => void;
  resetCooldown: () => void;
} {
  const [lastUsed, setLastUsed] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const cooldownPeriod = COOLDOWN_PERIODS[contributionType];
  
  // Update time remaining every second
  useEffect(() => {
    if (!lastUsed) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastUsed;
      const remaining = Math.max(0, cooldownPeriod - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100); // Update every 100ms for smooth countdown
    
    return () => clearInterval(interval);
  }, [lastUsed, cooldownPeriod]);
  
  const triggerCooldown = useCallback(() => {
    const now = Date.now();
    setLastUsed(now);
    setTimeRemaining(cooldownPeriod);
  }, [cooldownPeriod]);
  
  const resetCooldown = useCallback(() => {
    setLastUsed(null);
    setTimeRemaining(0);
  }, []);
  
  const isDisabled = timeRemaining > 0;
  
  return {
    isDisabled,
    lastUsed,
    cooldownPeriod,
    timeRemaining,
    triggerCooldown,
    resetCooldown,
  };
}

// Utility function to format time remaining for display
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '';
  
  const seconds = Math.ceil(milliseconds / 1000);
  return `${seconds}s`;
}

// Hook for managing multiple button cooldowns
export function useMultipleButtonCooldowns() {
  const attendCooldown = useButtonCooldown('ATTEND');
  const hostCooldown = useButtonCooldown('HOST');
  const paceCooldown = useButtonCooldown('PACE');
  const suppliesCooldown = useButtonCooldown('SUPPLIES');
  
  const getCooldownForType = useCallback((type: ContributionType) => {
    switch (type) {
      case 'ATTEND': return attendCooldown;
      case 'HOST': return hostCooldown;
      case 'PACE': return paceCooldown;
      case 'SUPPLIES': return suppliesCooldown;
      default: return attendCooldown;
    }
  }, [attendCooldown, hostCooldown, paceCooldown, suppliesCooldown]);
  
  return {
    getCooldownForType,
    cooldowns: {
      ATTEND: attendCooldown,
      HOST: hostCooldown,
      PACE: paceCooldown,
      SUPPLIES: suppliesCooldown,
    }
  };
}
