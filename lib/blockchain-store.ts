"use client";

import { readContract, writeContract } from '@wagmi/core';
import { parseEther } from 'viem';
import ContributionBadgesABI from './ContributionBadges.json';

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const CONTRIBUTION_TYPES = { 
  ATTEND: 1, 
  HOST: 2, 
  PACE: 3, 
  SUPPLIES: 4 
} as const;

// Types
export type ContributionType = keyof typeof CONTRIBUTION_TYPES;

export type BlockchainTotals = {
  attend: number;
  host: number;
  pace: number;
  supplies: number;
  points: number;
  badges: string[];
  streak: number;
  tipsReceived: number;
  tipsSent: number;
};

const defaultTotals: BlockchainTotals = { 
  attend: 0, host: 0, pace: 0, supplies: 0, 
  points: 0, badges: [], streak: 0, 
  tipsReceived: 0, tipsSent: 0 
};

/**
 * Load user data from blockchain
 */
export async function getBlockchainTotals(userAddress?: string): Promise<BlockchainTotals> {
  if (!userAddress || !CONTRACT_ADDRESS) {
    console.warn('No user address or contract address provided');
    return defaultTotals;
  }
  
  try {
    const [contributions, stats, badges] = await readContract({
      address: CONTRACT_ADDRESS,
      abi: ContributionBadgesABI,
      functionName: 'getUserData',
      args: [userAddress]
    }) as [bigint[], any, string[]];
    
    return {
      attend: Number(contributions[0]),
      host: Number(contributions[1]),
      pace: Number(contributions[2]),
      supplies: Number(contributions[3]),
      points: Number(stats.totalPoints),
      streak: Number(stats.currentStreak),
      badges: badges,
      tipsReceived: Number(stats.totalTipsReceived),
      tipsSent: Number(stats.totalTipsSent)
    };
  } catch (error) {
    console.error('Failed to load from blockchain:', error);
    return defaultTotals;
  }
}

/**
 * Make contribution on blockchain
 */
export async function makeBlockchainContribution(type: ContributionType): Promise<void> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  await writeContract({
    address: CONTRACT_ADDRESS,
    abi: ContributionBadgesABI,
    functionName: 'makeContribution',
    args: [CONTRIBUTION_TYPES[type]]
  });
}

/**
 * Send tip on blockchain
 */
export async function sendBlockchainTip(
  recipientAddress: string, 
  amount: string, 
  message: string
): Promise<void> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  await writeContract({
    address: CONTRACT_ADDRESS,
    abi: ContributionBadgesABI,
    functionName: 'tipContributor',
    args: [recipientAddress, message],
    value: parseEther(amount)
  });
}

/**
 * Check if user can contribute today (simplified - let contract handle validation)
 */
export async function canMakeContribution(
  type: ContributionType, 
  userAddress: string
): Promise<{ ok: boolean; reason?: string }> {
  // For simplicity, let the contract handle the validation
  // The contract will revert with a clear error message if not allowed
  return { ok: true };
}

/**
 * Get points for contribution type (matches contract logic)
 */
export function getPointsForType(type: ContributionType): number {
  switch (type) {
    case 'ATTEND': return 10;
    case 'HOST': return 50;
    case 'PACE': return 20;
    case 'SUPPLIES': return 15;
    default: return 0;
  }
}

/**
 * Get success message for contribution type
 */
export function getSuccessMessage(type: ContributionType): string {
  switch (type) {
    case 'ATTEND': return "Attendance logged! +10 points";
    case 'HOST': return "Host logged! +50 points";
    case 'PACE': return "Pacing logged! +20 points";
    case 'SUPPLIES': return "Supplies logged! +15 points";
    default: return "Contribution logged!";
  }
}

/**
 * Format ETH amount for display
 */
export function formatEthAmount(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}

/**
 * Get contract address (for debugging)
 */
export function getContractAddress(): string | undefined {
  return CONTRACT_ADDRESS;
}
