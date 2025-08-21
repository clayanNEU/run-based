"use client";

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const BASESCAN_API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;

// ERC-1155 TransferSingle event signature
const TRANSFER_SINGLE_TOPIC = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';

// Point values (must match contract)
const POINT_VALUES = {
  1: 10,  // ATTEND
  2: 50,  // HOST
  3: 20,  // PACE
  4: 15   // SUPPLIES
};

export type LeaderboardEntry = {
  address: string;
  points: number;
  contributions: {
    attend: number;
    host: number;
    pace: number;
    supplies: number;
  };
  displayName?: string;
  avatar?: string;
  isRealUser: boolean; // Distinguishes real blockchain users from fallback demo data
};

/**
 * Fetch leaderboard data from BaseScan API
 */
export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  if (!CONTRACT_ADDRESS) {
    console.warn('Contract address not configured');
    return [];
  }

  try {
    // Construct BaseScan API URL for recent TransferSingle events
    const baseUrl = 'https://api.basescan.org/api';
    const params = new URLSearchParams({
      module: 'logs',
      action: 'getLogs',
      address: CONTRACT_ADDRESS,
      topic0: TRANSFER_SINGLE_TOPIC,
      fromBlock: 'earliest',
      toBlock: 'latest',
      page: '1',
      offset: '1000'
    });

    if (BASESCAN_API_KEY) {
      params.append('apikey', BASESCAN_API_KEY);
    }

    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();

    if (data.status !== '1' || !data.result) {
      console.warn('BaseScan API error:', data.message);
      return getFallbackLeaderboard();
    }

    // Parse events and aggregate by user
    const userStats: Record<string, LeaderboardEntry> = {};

    for (const log of data.result) {
      try {
        // Parse TransferSingle event data
        // topics[1] = operator, topics[2] = from, topics[3] = to
        // data contains id and value (both uint256)
        
        const fromAddress = log.topics[2];
        const toAddress = log.topics[3];
        
        // Only count mints (from zero address)
        if (fromAddress !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          continue;
        }

        // Extract recipient address (remove padding)
        const recipient = '0x' + toAddress.slice(-40);
        
        // Parse token ID from data (first 32 bytes)
        const tokenIdHex = log.data.slice(2, 66);
        const tokenId = parseInt(tokenIdHex, 16);
        
        // Skip if invalid token ID
        if (tokenId < 1 || tokenId > 4) {
          continue;
        }

        // Initialize user stats if not exists
        if (!userStats[recipient]) {
          userStats[recipient] = {
            address: recipient,
            points: 0,
            contributions: { attend: 0, host: 0, pace: 0, supplies: 0 },
            isRealUser: true // Real blockchain users
          };
        }

        // Add points and contribution count
        const points = POINT_VALUES[tokenId as keyof typeof POINT_VALUES] || 0;
        userStats[recipient].points += points;

        // Update contribution counts
        switch (tokenId) {
          case 1: userStats[recipient].contributions.attend++; break;
          case 2: userStats[recipient].contributions.host++; break;
          case 3: userStats[recipient].contributions.pace++; break;
          case 4: userStats[recipient].contributions.supplies++; break;
        }
      } catch (error) {
        console.warn('Error parsing log:', error, log);
      }
    }

    // Convert to array and sort by points
    const leaderboard = Object.values(userStats)
      .filter(entry => entry.points > 0)
      .sort((a, b) => b.points - a.points);

    console.log('Leaderboard data loaded:', leaderboard.length, 'entries');
    return leaderboard;

  } catch (error) {
    console.error('Failed to fetch leaderboard data:', error);
    return getFallbackLeaderboard();
  }
}

/**
 * Fallback leaderboard data when API fails
 */
function getFallbackLeaderboard(): LeaderboardEntry[] {
  return [
    {
      address: '0x1234567890123456789012345678901234567890',
      points: 120,
      contributions: { attend: 8, host: 1, pace: 2, supplies: 1 },
      displayName: 'Demo User 1',
      isRealUser: false // Fallback demo data
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      points: 95,
      contributions: { attend: 6, host: 0, pace: 1, supplies: 2 },
      displayName: 'Demo User 2',
      isRealUser: false // Fallback demo data
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      points: 80,
      contributions: { attend: 5, host: 1, pace: 0, supplies: 1 },
      displayName: 'Demo User 3',
      isRealUser: false // Fallback demo data
    }
  ];
}

/**
 * Format address for display (shortened)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Cache for leaderboard data (60 second cache)
 */
let cachedData: { data: LeaderboardEntry[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 60 seconds

/**
 * Get cached leaderboard data or fetch fresh data
 */
export async function getCachedLeaderboardData(): Promise<LeaderboardEntry[]> {
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    return cachedData.data;
  }

  const data = await fetchLeaderboardData();
  cachedData = { data, timestamp: now };
  
  return data;
}

/**
 * Get enhanced leaderboard data with current user prioritization
 * Ensures the current user appears in the leaderboard with their actual points
 */
export async function getEnhancedLeaderboardData(currentUserAddress?: string): Promise<LeaderboardEntry[]> {
  const leaderboard = await getCachedLeaderboardData();
  
  // If no current user address, return standard leaderboard
  if (!currentUserAddress) {
    return leaderboard;
  }

  const normalizedCurrentUser = currentUserAddress.toLowerCase();
  
  // Check if current user is already in the leaderboard
  const currentUserInLeaderboard = leaderboard.find(
    entry => entry.address.toLowerCase() === normalizedCurrentUser
  );

  // If current user is already in leaderboard, return as-is
  if (currentUserInLeaderboard) {
    return leaderboard;
  }

  // If we have real blockchain data but current user isn't in it,
  // they likely have 0 points, so we'll add them with 0 points
  const hasRealData = leaderboard.some(entry => entry.isRealUser);
  
  if (hasRealData) {
    // Add current user with 0 points to the end
    const currentUserEntry: LeaderboardEntry = {
      address: currentUserAddress,
      points: 0,
      contributions: { attend: 0, host: 0, pace: 0, supplies: 0 },
      isRealUser: true
    };
    
    return [...leaderboard, currentUserEntry];
  }

  // If we only have fallback data, prioritize showing current user
  // by replacing one of the demo users
  const currentUserEntry: LeaderboardEntry = {
    address: currentUserAddress,
    points: 0,
    contributions: { attend: 0, host: 0, pace: 0, supplies: 0 },
    isRealUser: true
  };

  // Replace the last demo user with current user
  const enhancedLeaderboard = [...leaderboard];
  enhancedLeaderboard[enhancedLeaderboard.length - 1] = currentUserEntry;
  
  return enhancedLeaderboard;
}

/**
 * Get debug information about the leaderboard API
 */
export function getLeaderboardDebugInfo() {
  return {
    contractAddress: CONTRACT_ADDRESS,
    hasApiKey: !!BASESCAN_API_KEY,
    transferSingleTopic: TRANSFER_SINGLE_TOPIC,
    pointValues: POINT_VALUES,
    cacheStatus: cachedData ? {
      entries: cachedData.data.length,
      age: Date.now() - cachedData.timestamp,
      fresh: (Date.now() - cachedData.timestamp) < CACHE_DURATION
    } : null
  };
}
