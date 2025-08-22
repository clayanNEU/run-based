/**
 * Manual basename/ENS mapping for real users
 * These are the actual basenames and ENS names provided by the user
 * Mapped to addresses from the leaderboard in order from top to bottom
 */

export const MANUAL_BASENAME_MAPPING: Record<string, string> = {
  // Real user basenames/ENS names (from top of leaderboard down)
  '0xe2d858b3d24787f4af64bbc1380dbf34386274d9': 'clayan',           // 80 points - #1
  '0x14d23ff0cb6a59f8cf3b389ca94bef75c69a68e7': 'chintan',          // 75 points - #2  
  '0x4338c5b43a506b2cda1fe09d019e55934cac61e0': 'chineseman',       // 60 points - #3
  '0x015b5df1673499e32d11cf786a43d1c42b3d725c': 'spicypaprika.eth',  // 15 points - #4
  '0x7437aa79e56995d8b10320981f870b66c135e06f': 'what',             // 10 points - #5
  '0xd7e315a3d8fa74767911537138ac77c5adb89931': 'alecurtu',         // 10 points - #6
  '0xda8ab8571ff944bf5eeca7addfc100cbe1982f32': 'hurls',            // 10 points - #7
  '0xddf9816d4ceed1f40005ca2276ff613cb2d54028': 'kaelis.eth',       // 10 points - #8
};

/**
 * Get manual basename mapping for an address
 */
export function getManualBasename(address: string): string | null {
  if (!address) return null;
  
  // Normalize address to lowercase for consistent lookup
  const normalizedAddress = address.toLowerCase();
  return MANUAL_BASENAME_MAPPING[normalizedAddress] || null;
}

/**
 * Check if an address has a manual basename mapping
 */
export function hasManualBasename(address: string): boolean {
  return getManualBasename(address) !== null;
}
