"use client";

import { createPublicClient, createWalletClient, custom, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import ContributionBadgesABI from './ContributionBadgesV2.json';
import { 
  makeContributionSponsored, 
  sendTipSponsored, 
  PaymasterError, 
  parsePaymasterError,
  isPaymasterAvailable,
  checkPaymasterSupport
} from './paymaster-client';

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const CONTRIBUTION_TYPES = { 
  ATTEND: 1, 
  HOST: 2, 
  PACE: 3, 
  SUPPLIES: 4 
} as const;

// Network configuration
const EXPECTED_CHAIN = base; // Base Mainnet
const EXPECTED_CHAIN_ID = 8453;

// USDC has 6 decimals (not 18 like ETH)
const USDC_DECIMALS = 6;

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
  tipsReceived: number; // in USDC
  tipsSent: number;     // in USDC
};

const defaultTotals: BlockchainTotals = { 
  attend: 0, host: 0, pace: 0, supplies: 0, 
  points: 0, badges: [], streak: 0, 
  tipsReceived: 0, tipsSent: 0 
};

// ERC-20 ABI for USDC operations
const ERC20_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

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
      abi: ContributionBadgesABI.abi,
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
      tipsReceived: Number(formatUnits(stats.totalTipsReceived, USDC_DECIMALS)),
      tipsSent: Number(formatUnits(stats.totalTipsSent, USDC_DECIMALS))
    };
  } catch (error) {
    console.error('Failed to load from blockchain:', error);
    return defaultTotals;
  }
}

/**
 * Make contribution with sponsored transaction first, fallback to regular
 */
export async function makeContributionWithSponsorship(type: ContributionType): Promise<{ 
  hash: string; 
  explorerUrl: string; 
  sponsored: boolean;
  fallbackReason?: string;
}> {
  // Try sponsored transaction first if paymaster is available
  if (isPaymasterAvailable()) {
    try {
      console.log('Attempting sponsored contribution...');
      const result = await makeContributionSponsored(type);
      console.log('✅ Sponsored contribution successful!');
      return { ...result, sponsored: true };
    } catch (error) {
      if (error instanceof PaymasterError) {
        const fallbackReason = parsePaymasterError(error);
        console.log('⚠️ Sponsored transaction failed, falling back to regular transaction:', fallbackReason);
        
        try {
          const result = await makeBlockchainContribution(type);
          return { ...result, sponsored: false, fallbackReason };
        } catch (fallbackError) {
          console.error('❌ Fallback transaction also failed:', fallbackError);
          throw fallbackError;
        }
      } else {
        console.error('❌ Sponsored transaction failed with non-paymaster error:', error);
        throw error;
      }
    }
  }

  // Use regular transaction if paymaster not available
  console.log('Using regular transaction (paymaster not available)');
  const result = await makeBlockchainContribution(type);
  return { ...result, sponsored: false, fallbackReason: 'Paymaster not configured' };
}

/**
 * Send USDC tip with sponsored transaction first, fallback to regular
 */
export async function sendTipWithSponsorship(
  recipientAddress: string, 
  amount: string, 
  message: string
): Promise<{ 
  hash: string; 
  explorerUrl: string; 
  sponsored: boolean;
  fallbackReason?: string;
}> {
  // Try sponsored transaction first if paymaster is available
  if (isPaymasterAvailable()) {
    try {
      console.log('Attempting sponsored USDC tip...');
      const result = await sendTipSponsored(recipientAddress, amount, message);
      console.log('✅ Sponsored USDC tip successful!');
      return { ...result, sponsored: true };
    } catch (error) {
      if (error instanceof PaymasterError) {
        const fallbackReason = parsePaymasterError(error);
        console.log('⚠️ Sponsored tip failed, falling back to regular transaction:', fallbackReason);
        
        try {
          const result = await sendUSDCTip(recipientAddress, amount, message);
          return { ...result, sponsored: false, fallbackReason };
        } catch (fallbackError) {
          console.error('❌ Fallback tip also failed:', fallbackError);
          throw fallbackError;
        }
      } else {
        console.error('❌ Sponsored tip failed with non-paymaster error:', error);
        throw error;
      }
    }
  }

  // Use regular transaction if paymaster not available
  console.log('Using regular USDC tip transaction (paymaster not available)');
  const result = await sendUSDCTip(recipientAddress, amount, message);
  return { ...result, sponsored: false, fallbackReason: 'Paymaster not configured' };
}

/**
 * Check if paymaster is supported by the current wallet
 */
export async function getPaymasterStatus(): Promise<{
  available: boolean;
  walletSupported: boolean;
  configured: boolean;
}> {
  const configured = isPaymasterAvailable();
  const walletSupported = configured ? await checkPaymasterSupport() : false;
  
  return {
    available: configured && walletSupported,
    walletSupported,
    configured
  };
}

/**
 * Check USDC allowance for the contract
 */
export async function getUSDCAllowance(userAddress: string): Promise<number> {
  if (!userAddress || !CONTRACT_ADDRESS || !USDC_ADDRESS) {
    return 0;
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

    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress as `0x${string}`, CONTRACT_ADDRESS]
    }) as bigint;

    return Number(formatUnits(allowance, USDC_DECIMALS));
  } catch (error) {
    console.error('Failed to get USDC allowance:', error);
    return 0;
  }
}

/**
 * Get USDC balance for user
 */
export async function getUSDCBalance(userAddress: string): Promise<number> {
  if (!userAddress || !USDC_ADDRESS) {
    return 0;
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

    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`]
    }) as bigint;

    return Number(formatUnits(balance, USDC_DECIMALS));
  } catch (error) {
    console.error('Failed to get USDC balance:', error);
    return 0;
  }
}

/**
 * Approve USDC spending for the contract
 */
export async function approveUSDC(amount: string): Promise<{ hash: string; explorerUrl: string }> {
  if (!CONTRACT_ADDRESS || !USDC_ADDRESS) {
    throw new Error('Contract or USDC address not configured');
  }

  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!ethereum) {
    throw new Error('No ethereum provider found');
  }

  // Check network
  const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;
  const currentChainId = parseInt(chainId, 16);
  
  if (currentChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`Wrong network. Please switch to Base Mainnet (Chain ID: ${EXPECTED_CHAIN_ID}). Currently on Chain ID: ${currentChainId}`);
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

  const amountInUnits = parseUnits(amount, USDC_DECIMALS);

  console.log('Approving USDC spending:', { amount, amountInUnits: amountInUnits.toString(), contract: CONTRACT_ADDRESS });

  // Submit approval transaction
  const hash = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [CONTRACT_ADDRESS, amountInUnits],
    account: account as `0x${string}`
  });

  console.log('USDC approval transaction submitted:', hash);

  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ 
    hash,
    timeout: 60_000 // 60 second timeout
  });

  console.log('USDC approval confirmed:', receipt);

  const explorerUrl = `https://basescan.org/tx/${hash}`;
  
  return { hash, explorerUrl };
}

/**
 * Send USDC tip on blockchain with proper transaction handling
 */
export async function sendUSDCTip(
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
    throw new Error(`Wrong network. Please switch to Base Mainnet (Chain ID: ${EXPECTED_CHAIN_ID}). Currently on Chain ID: ${currentChainId}`);
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

  const amountInUnits = parseUnits(amount, USDC_DECIMALS);

  console.log('Sending USDC tip:', { recipient: recipientAddress, amount, amountInUnits: amountInUnits.toString(), message, account });

  // Submit transaction
  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ContributionBadgesABI.abi,
    functionName: 'tipContributorUSDC',
    args: [recipientAddress, amountInUnits, message],
    account: account as `0x${string}`
  });

  console.log('USDC tip transaction submitted:', hash);

  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ 
    hash,
    timeout: 60_000 // 60 second timeout
  });

  console.log('USDC tip transaction confirmed:', receipt);

  const explorerUrl = `https://basescan.org/tx/${hash}`;
  
  return { hash, explorerUrl };
}

/**
 * Make contribution on blockchain with proper transaction handling (original function)
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
    throw new Error(`Wrong network. Please switch to Base Mainnet (Chain ID: ${EXPECTED_CHAIN_ID}). Currently on Chain ID: ${currentChainId}`);
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
    abi: ContributionBadgesABI.abi,
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

  const explorerUrl = `https://basescan.org/tx/${hash}`;
  
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
 * Format USDC amount for display
 */
export function formatUSDCAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
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
      expectedChainName: 'Base Mainnet'
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
      expectedChainName: 'Base Mainnet'
    };
  } catch (error) {
    console.error('Failed to get network info:', error);
    return {
      chainId: 0,
      chainName: 'Unknown',
      isCorrectNetwork: false,
      expectedChainId: EXPECTED_CHAIN_ID,
      expectedChainName: 'Base Mainnet'
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
 * Get USDC address (for debugging)
 */
export function getUSDCAddress(): string | undefined {
  return USDC_ADDRESS;
}

/**
 * Get debug information
 */
export function getDebugInfo() {
  return {
    contractAddress: CONTRACT_ADDRESS,
    usdcAddress: USDC_ADDRESS,
    expectedChainId: EXPECTED_CHAIN_ID,
    expectedChainName: 'Base Mainnet',
    explorerUrl: 'https://basescan.org'
  };
}
