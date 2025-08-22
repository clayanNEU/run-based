"use client";

// Import React for the hook
import * as React from 'react';
import { useName } from '@coinbase/onchainkit/identity';

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
 * Hook for resolving basename using OnchainKit's useName
 * This provides a simple hook-based approach for custom identity displays
 */
export function useBasename(address: string | undefined) {
  const { data: name, isLoading } = useName({
    address: address as `0x${string}` | undefined,
  });

  // Format the result: use name if available, otherwise format address
  const basename = React.useMemo(() => {
    if (!address) return '';
    if (name && isBasename(name)) return name;
    return formatAddress(address);
  }, [address, name]);

  return { basename, isLoading: isLoading || false };
}

// Re-export OnchainKit components for convenience
export { Name, IdentityCard, Identity, Avatar, Badge } from '@coinbase/onchainkit/identity';
