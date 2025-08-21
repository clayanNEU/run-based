"use client";

import { createPublicClient, createWalletClient, custom, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import ContributionBadgesABI from './ContributionBadges.json';

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const CONTRIBUTION_TYPES = { 
  ATTEND: 1, 
  HOST: 2, 
  PACE: 3, 
  SUPPLIES: 4 
} as const;

// Network configuration
const EXPECTED_CHAIN = baseSepolia; // Base Sepolia testnet
const EXPECTED_CHAIN_ID = 84532;

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
    const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!ethereum) {
      throw new Error('No ethereum provider found');
    }

    const publicClient = createPublicClient({
      chain: EXPECTED_CHAIN,
      transport: custom(ethereum)
    });

    const [contributions, stats, badges] = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ContributionBadgesABI,
      functionName: 'getUserData',
      args: [userAddress]
    }) as [bigint[], { totalPoints: bigint; currentStreak: bigint; totalTipsReceived: bigint; totalTipsSent: bigint }, string[]];
    
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
 * Make contribution on blockchain with proper transaction handling
 */
export async function makeBlockchainContribution(type: ContributionType): Promise<{ hash: string; explorerUrl: string }> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!ethereum) {
    throw new Error('No ethereum provider found');
  }

  // Check network
  const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;
  const currentChainId = parseInt(chainId, 16);
  
  if (currentChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`Wrong network. Please switch to Base Sepolia testnet (Chain ID: ${EXPECTED_CHAIN_ID}). Currently on Chain ID: ${currentChainId}`);
  }

  const publicClient = createPublicClient({
    chain: EXPECTED_CHAIN,
    transport: custom(ethereum)
  });

  const walletClient = createWalletClient({
    chain: EXPECTED_CHAIN,
    transport: custom(ethereum)
  });

  const [account] = await ethereum.request({ method: 'eth_accounts' }) as string[];
  if (!account) {
    throw new Error('No account connected');
  }

  console.log('Making contribution:', { type, account, contract: CONTRACT_ADDRESS });

  // Submit transaction
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ContributionBadgesABI,
    functionName: 'makeContribution',
    args: [CONTRIBUTION_TYPES[type]],
    account: account as `0x${string}`
  });

  console.log('Transaction submitted:', hash);

  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ 
    hash,
    timeout: 60_000 // 60 second timeout
  });

  console.log('Transaction confirmed:', receipt);

  const explorerUrl = `https://sepolia.basescan.org/tx/${hash}`;
  
  return { hash, explorerUrl };
}

/**
 * Send tip on blockchain with proper transaction handling
 */
export async function sendBlockchainTip(
  recipientAddress: string, 
  amount: string, 
  message: string
): Promise<{ hash: string; explorerUrl: string }> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!ethereum) {
    throw new Error('No ethereum provider found');
  }

  // Check network
  const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;
  const currentChainId = parseInt(chainId, 16);
  
  if (currentChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`Wrong network. Please switch to Base Sepolia testnet (Chain ID: ${EXPECTED_CHAIN_ID}). Currently on Chain ID: ${currentChainId}`);
  }

  const publicClient = createPublicClient({
    chain: EXPECTED_CHAIN,
    transport: custom(ethereum)
  });

  const walletClient = createWalletClient({
    chain: EXPECTED_CHAIN,
    transport: custom(ethereum)
  });

  const [account] = await ethereum.request({ method: 'eth_accounts' }) as string[];
  if (!account) {
    throw new Error('No account connected');
  }

  console.log('Sending tip:', { recipient: recipientAddress, amount, message, account });

  // Submit transaction
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ContributionBadgesABI,
    functionName: 'tipContributor',
    args: [recipientAddress, message],
    value: parseEther(amount),
    account: account as `0x${string}`
  });

  console.log('Tip transaction submitted:', hash);

  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ 
    hash,
    timeout: 60_000 // 60 second timeout
  });

  console.log('Tip transaction confirmed:', receipt);

  const explorerUrl = `https://sepolia.basescan.org/tx/${hash}`;
  
  return { hash, explorerUrl };
}

/**
 * Check if user can contribute today (simplified - let contract handle validation)
 */
export async function canMakeContribution(
  _type: ContributionType, 
  _userAddress: string
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
 * Get network information
 */
export async function getNetworkInfo(): Promise<{
  chainId: number;
  chainName: string;
  isCorrectNetwork: boolean;
  expectedChainId: number;
  expectedChainName: string;
}> {
  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  
  if (!ethereum) {
    return {
      chainId: 0,
      chainName: 'No wallet',
      isCorrectNetwork: false,
      expectedChainId: EXPECTED_CHAIN_ID,
      expectedChainName: 'Base Sepolia'
    };
  }

  try {
    const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;
    const currentChainId = parseInt(chainId, 16);
    
    const chainNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      8453: 'Base Mainnet',
      84532: 'Base Sepolia',
      11155111: 'Ethereum Sepolia'
    };

    return {
      chainId: currentChainId,
      chainName: chainNames[currentChainId] || `Chain ${currentChainId}`,
      isCorrectNetwork: currentChainId === EXPECTED_CHAIN_ID,
      expectedChainId: EXPECTED_CHAIN_ID,
      expectedChainName: 'Base Sepolia'
    };
  } catch (error) {
    console.error('Failed to get network info:', error);
    return {
      chainId: 0,
      chainName: 'Unknown',
      isCorrectNetwork: false,
      expectedChainId: EXPECTED_CHAIN_ID,
      expectedChainName: 'Base Sepolia'
    };
  }
}

/**
 * Get contract address (for debugging)
 */
export function getContractAddress(): string | undefined {
  return CONTRACT_ADDRESS;
}

/**
 * Get debug information
 */
export function getDebugInfo() {
  return {
    contractAddress: CONTRACT_ADDRESS,
    expectedChainId: EXPECTED_CHAIN_ID,
    expectedChainName: 'Base Sepolia',
    explorerUrl: 'https://sepolia.basescan.org'
  };
}
