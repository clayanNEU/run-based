"use client";

import { encodeFunctionData, parseUnits } from 'viem';
import ContributionBadgesABI from './ContributionBadgesV2.json';

// USDC has 6 decimals
const USDC_DECIMALS = 6;

// Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const PAYMASTER_RPC_URL = process.env.NEXT_PUBLIC_PAYMASTER_RPC_URL as string;

// Types
export type ContributionType = 'ATTEND' | 'HOST' | 'PACE' | 'SUPPLIES';

const CONTRIBUTION_TYPES = { 
  ATTEND: 1, 
  HOST: 2, 
  PACE: 3, 
  SUPPLIES: 4 
} as const;

/**
 * Check if paymaster is configured and available
 */
export function isPaymasterAvailable(): boolean {
  return !!(CONTRACT_ADDRESS && PAYMASTER_RPC_URL);
}

/**
 * Make a sponsored contribution using ERC-4337 wallet_sendCalls
 */
export async function makeContributionSponsored(type: ContributionType): Promise<{ hash: string; explorerUrl: string }> {
  if (!isPaymasterAvailable()) {
    throw new Error('Paymaster not available');
  }

  console.log('Attempting sponsored contribution:', { type, contract: CONTRACT_ADDRESS });

  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!ethereum) {
    throw new Error('No ethereum provider found');
  }

  // Get connected account
  const [account] = await ethereum.request({ method: 'eth_accounts' }) as string[];
  if (!account) {
    throw new Error('No account connected');
  }

  try {
    // Encode the contract call
    const callData = encodeFunctionData({
      abi: ContributionBadgesABI.abi,
      functionName: 'makeContribution',
      args: [CONTRIBUTION_TYPES[type]]
    });

    // Use wallet_sendCalls with paymaster capability
    const result = await ethereum.request({
      method: 'wallet_sendCalls',
      params: [{
        version: "1.0",
        chainId: "0x2105", // Base mainnet chain ID in hex
        from: account,
        calls: [{
          to: CONTRACT_ADDRESS,
          value: "0x0",
          data: callData
        }],
        capabilities: {
          paymasterService: {
            url: PAYMASTER_RPC_URL
          }
        }
      }]
    }) as string;

    console.log('Sponsored contribution transaction submitted:', result);

    const explorerUrl = `https://basescan.org/tx/${result}`;
    return { hash: result, explorerUrl };

  } catch (error) {
    console.error('Sponsored contribution failed:', error);
    
    // Check if it's a paymaster-specific error
    if (isPaymasterError(error)) {
      throw new PaymasterError('Paymaster sponsorship failed', error);
    }
    
    throw error;
  }
}

/**
 * Send a sponsored USDC tip using ERC-4337 wallet_sendCalls
 */
export async function sendTipSponsored(
  recipientAddress: string, 
  amount: string, 
  message: string
): Promise<{ hash: string; explorerUrl: string }> {
  if (!isPaymasterAvailable()) {
    throw new Error('Paymaster not available');
  }

  console.log('Attempting sponsored USDC tip:', { recipient: recipientAddress, amount, message });

  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!ethereum) {
    throw new Error('No ethereum provider found');
  }

  // Get connected account
  const [account] = await ethereum.request({ method: 'eth_accounts' }) as string[];
  if (!account) {
    throw new Error('No account connected');
  }

  try {
    // Convert USDC amount to proper units (6 decimals)
    const amountInUnits = parseUnits(amount, USDC_DECIMALS);

    // Encode the contract call for USDC tipping
    const callData = encodeFunctionData({
      abi: ContributionBadgesABI.abi,
      functionName: 'tipContributorUSDC',
      args: [recipientAddress, amountInUnits, message]
    });

    // Use wallet_sendCalls with paymaster capability
    const result = await ethereum.request({
      method: 'wallet_sendCalls',
      params: [{
        version: "1.0",
        chainId: "0x2105", // Base mainnet chain ID in hex
        from: account,
        calls: [{
          to: CONTRACT_ADDRESS,
          value: "0x0", // No ETH value for USDC tips
          data: callData
        }],
        capabilities: {
          paymasterService: {
            url: PAYMASTER_RPC_URL
          }
        }
      }]
    }) as string;

    console.log('Sponsored USDC tip transaction submitted:', result);

    const explorerUrl = `https://basescan.org/tx/${result}`;
    return { hash: result, explorerUrl };

  } catch (error) {
    console.error('Sponsored USDC tip failed:', error);
    
    // Check if it's a paymaster-specific error
    if (isPaymasterError(error)) {
      throw new PaymasterError('Paymaster sponsorship failed', error);
    }
    
    throw error;
  }
}

/**
 * Check if wallet supports paymaster capabilities
 */
export async function checkPaymasterSupport(): Promise<boolean> {
  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!ethereum) {
    return false;
  }

  try {
    const [account] = await ethereum.request({ method: 'eth_accounts' }) as string[];
    if (!account) {
      return false;
    }

    const capabilities = await ethereum.request({
      method: 'wallet_getCapabilities',
      params: [account]
    }) as Record<string, unknown>;

    const baseCapabilities = capabilities["0x2105"] as Record<string, unknown>;
    const paymasterSupport = baseCapabilities?.paymasterService as { supported?: boolean };
    
    return paymasterSupport?.supported === true;
  } catch (error) {
    console.error('Failed to check paymaster support:', error);
    return false;
  }
}

/**
 * Check if an error is paymaster-related
 */
function isPaymasterError(error: unknown): boolean {
  const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
  const errorCode = (error as { code?: number })?.code;
  
  return (
    errorMessage.includes('paymaster') ||
    errorMessage.includes('sponsorship') ||
    errorMessage.includes('request denied') ||
    errorMessage.includes('maximum per address') ||
    errorMessage.includes('global usd spend') ||
    errorCode === -32001 || // Common paymaster rejection code
    errorCode === 4100 || // Paymaster service not supported
    errorCode === 4200 || // Invalid paymaster URL
    errorCode === 4300 || // Paymaster service error
    errorCode === 5700    // Paymaster capability required
  );
}

/**
 * Custom error class for paymaster failures
 */
export class PaymasterError extends Error {
  public readonly originalError: unknown;
  
  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'PaymasterError';
    this.originalError = originalError;
  }
}

/**
 * Get paymaster status and debug info
 */
export function getPaymasterInfo() {
  return {
    available: isPaymasterAvailable(),
    contractAddress: CONTRACT_ADDRESS,
    paymasterRpcUrl: PAYMASTER_RPC_URL ? 'Configured' : 'Not configured',
    chainId: '0x2105', // Base mainnet
    chainName: 'Base Mainnet'
  };
}

/**
 * Parse paymaster error for user-friendly message
 */
export function parsePaymasterError(error: unknown): string {
  const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
  const errorCode = (error as { code?: number })?.code;
  
  if (errorCode === 4100) {
    return 'Wallet does not support gas sponsorship. Transaction will use regular gas fees.';
  }
  
  if (errorCode === 4200) {
    return 'Paymaster service configuration error. Transaction will use regular gas fees.';
  }
  
  if (errorCode === 4300) {
    return 'Paymaster service temporarily unavailable. Transaction will use regular gas fees.';
  }
  
  if (errorCode === 5700) {
    return 'Gas sponsorship not available for this transaction. Transaction will use regular gas fees.';
  }
  
  if (errorMessage.includes('maximum per address transaction count')) {
    return 'Daily sponsored transaction limit reached. Transaction will use regular gas fees.';
  }
  
  if (errorMessage.includes('global usd spend')) {
    return 'Global sponsorship limit reached. Transaction will use regular gas fees.';
  }
  
  if (errorMessage.includes('request denied')) {
    return 'Sponsorship not available. Transaction will use regular gas fees.';
  }
  
  if (errorMessage.includes('paymaster')) {
    return 'Gas sponsorship unavailable. Transaction will use regular gas fees.';
  }
  
  return 'Sponsorship failed. Transaction will use regular gas fees.';
}
