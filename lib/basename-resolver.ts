"use client";

// Import React for the hook
import * as React from 'react';

// Cache for basename resolutions to avoid repeated API calls
const basenameCache = new Map<string, string | null>();

/**
 * Resolves a wallet address to its basename (if available)
 * Falls back to truncated address if no basename is found
 */
export async function resolveBasename(address: string): Promise<string> {
  if (!address) return '';
  
  // Check cache first
  const cacheKey = address.toLowerCase();
  if (basenameCache.has(cacheKey)) {
    const cached = basenameCache.get(cacheKey);
    return cached || formatAddress(address);
  }
  
  try {
    // Try to resolve basename using Base's API
    const response = await fetch(`https://api.basenames.org/v1/name/${address}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.name) {
        const basename = data.name;
        basenameCache.set(cacheKey, basename);
        return basename;
      }
    }
    
    // If no basename found, cache null and return formatted address
    basenameCache.set(cacheKey, null);
    return formatAddress(address);
    
  } catch (error) {
    console.warn('Failed to resolve basename:', error);
    // Cache null on error and return formatted address
    basenameCache.set(cacheKey, null);
    return formatAddress(address);
  }
}

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
 * Hook for resolving basename with React state management
 */
export function useBasename(address: string | undefined) {
  const [basename, setBasename] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (!address) {
      setBasename('');
      return;
    }
    
    setIsLoading(true);
    resolveBasename(address)
      .then(setBasename)
      .finally(() => setIsLoading(false));
  }, [address]);
  
  return { basename, isLoading };
}
