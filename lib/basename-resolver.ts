"use client";

// Import React for the hook
import * as React from 'react';
import { useName } from '@coinbase/onchainkit/identity';
import { base, mainnet } from 'viem/chains';
import { getManualBasename } from './manual-basename-mapping';

/**
 * Formats an address for display (truncated)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Checks if a string is a valid basename format
 */
export function isBasename(name: string): boolean {
  return name.includes('.base.eth') || name.includes('.basetest.eth');
}

/**
 * Checks if a string is a valid ENS name format
 */
export function isENSName(name: string): boolean {
  return name.endsWith('.eth') && !name.includes('.base.eth') && !name.includes('.basetest.eth');
}

/**
 * Hook for resolving both ENS names and basenames using OnchainKit's useName
 * This provides a simple hook-based approach for custom identity displays
 */
export function useBasename(address: string | undefined) {
  // Convert address to the correct type or undefined
  const validAddress = React.useMemo(() => {
    if (!address || !address.startsWith('0x')) return undefined;
    return address as `0x${string}`;
  }, [address]);
  
  // Try basename resolution first (Base chain)
  const { data: basename, isLoading: basenameLoading, error: basenameError } = useName({
    address: validAddress,
    chain: base, // For basename resolution
  });

  // Try ENS resolution (Ethereum mainnet)
  const { data: ensName, isLoading: ensLoading, error: ensError } = useName({
    address: validAddress,
    chain: mainnet, // For ENS resolution
  });

  // Format the result: prioritize basename, then ENS, then manual mapping, then truncated address
  const resolvedName = React.useMemo(() => {
    if (!address) return '';
    
    // Prioritize basename if available
    if (basename) return basename;
    
    // Fall back to ENS name if available
    if (ensName) return ensName;
    
    // Check manual mapping as fallback
    const manualName = getManualBasename(address);
    if (manualName) return manualName;
    
    // Finally fall back to truncated address
    return formatAddress(address);
  }, [address, basename, ensName]);

  const isLoading = basenameLoading || ensLoading;
  const error = basenameError || ensError;

  return { 
    basename: resolvedName, // Keep the same property name for backward compatibility
    isLoading: isLoading || false,
    error: error || null,
    // Additional info for debugging
    resolvedBasename: basename,
    resolvedENS: ensName,
  };
}

// Re-export OnchainKit components for convenience
export { Name, IdentityCard, Identity, Avatar, Badge } from '@coinbase/onchainkit/identity';
