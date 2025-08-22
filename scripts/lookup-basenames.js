/**
 * Script to lookup actual basenames for addresses
 * This will query the Base network to find real basename registrations
 */

const { createPublicClient, http } = require('viem');
const { base, mainnet } = require('viem/chains');

// Addresses from the leaderboard that need basename lookup
const addresses = [
  '0xe2d858b3d24787f4af64bbc1380dbf34386274d9',
  '0x14d23ff0cb6a59f8cf3b389ca94bef75c69a68e7', 
  '0x4338c5b43a506b2cda1fe09d019e55934cac61e0',
  '0x015b5df1673499e32d11cf786a43d1c42b3d725c',
  '0x7437aa79e56995d8b10320981f870b66c135e06f',
  '0xd7e315a3d8fa74767911537138ac77c5adb89931',
  '0xda8ab8571ff944bf5eeca7addfc100cbe1982f32',
  '0xddf9816d4ceed1f40005ca2276ff613cb2d54028'
];

// Create clients for Base and Ethereum mainnet
const baseClient = createPublicClient({
  chain: base,
  transport: http()
});

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

async function lookupBasename(address) {
  try {
    console.log(`\nLooking up basename for ${address}...`);
    
    // Try to resolve using ENS reverse lookup on both chains
    try {
      // Try Base chain first (for basenames)
      const baseName = await baseClient.getEnsName({
        address: address
      });
      if (baseName) {
        console.log(`✅ Found basename on Base: ${baseName}`);
        return { address, basename: baseName, chain: 'base' };
      }
    } catch (error) {
      console.log(`❌ No basename found on Base for ${address}`);
    }

    try {
      // Try Ethereum mainnet (for ENS names)
      console.log(`🔍 Checking Ethereum mainnet for ENS name...`);
      const ensName = await mainnetClient.getEnsName({
        address: address
      });
      if (ensName) {
        console.log(`✅ Found ENS name on Ethereum: ${ensName}`);
        return { address, basename: ensName, chain: 'ethereum' };
      }
      console.log(`❌ No ENS name found on Ethereum for ${address}`);
    } catch (error) {
      console.log(`❌ Error checking ENS on Ethereum for ${address}:`, error.message);
    }

    console.log(`❌ No name found for ${address}`);
    return { address, basename: null, chain: null };
    
  } catch (error) {
    console.error(`Error looking up ${address}:`, error.message);
    return { address, basename: null, chain: null, error: error.message };
  }
}

async function main() {
  console.log('🔍 Looking up basenames for leaderboard addresses...\n');
  
  const results = [];
  
  for (const address of addresses) {
    const result = await lookupBasename(address);
    results.push(result);
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 RESULTS SUMMARY:');
  console.log('===================');
  
  const foundNames = results.filter(r => r.basename);
  const notFound = results.filter(r => !r.basename);
  
  console.log(`\n✅ Found ${foundNames.length} names:`);
  foundNames.forEach(r => {
    console.log(`  ${r.address} -> ${r.basename} (${r.chain})`);
  });
  
  console.log(`\n❌ No names found for ${notFound.length} addresses:`);
  notFound.forEach(r => {
    console.log(`  ${r.address}`);
  });
  
  // Generate mapping object for code
  console.log('\n📝 MAPPING FOR CODE:');
  console.log('====================');
  console.log('export const REAL_BASENAME_MAPPING: Record<string, string> = {');
  foundNames.forEach(r => {
    console.log(`  '${r.address.toLowerCase()}': '${r.basename}',`);
  });
  console.log('};');
}

main().catch(console.error);
