# Base Mainnet Deployment Guide

## Current Status
- ✅ Contract deployed on Base Sepolia testnet at `0xBde3f5dd0787e5e7309dcA010d955d630a9024Cf`
- ✅ Frontend configured for Base Mainnet (Chain ID: 8453)
- ✅ Import error fixed (blockchain-store.ts now imports `base` instead of `baseSepolia`)
- ✅ Private key security issue resolved
- ✅ Paymaster protection enabled (`autoConnect: false`)

## Deployment Options

### Option 1: Deploy New Contract to Base Mainnet (Recommended)
Deploy a fresh contract to Base Mainnet for production use.

**Steps:**
1. **Prepare Deployment Wallet**
   ```bash
   # Create a new wallet with minimal ETH (~0.005 ETH)
   # Never use your main wallet for deployment
   ```

2. **Run Secure Deployment**
   ```bash
   cd run-based
   ./deploy-mainnet.sh
   ```

3. **Update Environment**
   ```bash
   # Update .env with new contract address
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x[NEW_MAINNET_ADDRESS]
   ```

### Option 2: Use Existing Testnet Contract
Switch frontend to use the existing Base Sepolia deployment.

**Steps:**
1. **Update Network Configuration**
   ```typescript
   // In blockchain-store.ts, change:
   const EXPECTED_CHAIN = baseSepolia; // Base Sepolia
   const EXPECTED_CHAIN_ID = 84532;
   ```

2. **Update RootProvider**
   ```typescript
   // In app/rootProvider.tsx, change:
   chain={baseSepolia}
   ```

## Pre-Deployment Checklist

### Security ✅
- [x] Private key removed from .env file
- [x] Deployment script uses secure input method
- [x] Private key cleared from memory after use

### Configuration ✅
- [x] Import error fixed (base vs baseSepolia)
- [x] Network configuration matches target (Base Mainnet)
- [x] Contract address environment variable ready
- [x] Paymaster protection enabled

### Dependencies ✅
- [x] Foundry installed and configured
- [x] Base Mainnet RPC URL configured
- [x] BaseScan API key configured (optional)

## Deployment Process

### 1. Pre-Deployment
```bash
# Verify environment
echo $BASE_MAINNET_RPC_URL
echo $BASESCAN_API_KEY

# Check Foundry installation
forge --version

# Verify contract compiles
cd run-based/contracts
forge build
```

### 2. Execute Deployment
```bash
cd run-based
./deploy-mainnet.sh
```

**Expected Output:**
```
🚀 Base Mainnet Deployment Script
=================================
🔐 Enter your deployment wallet private key (will not be stored):
   Make sure this wallet has at least 0.005 ETH on Base Mainnet

📋 Deployment Configuration:
   Network: Base Mainnet (Chain ID: 8453)
   RPC URL: https://mainnet.base.org
   Contract: ContributionBadges.sol

🤔 Do you want to proceed with deployment? (y/N): y

🔨 Starting deployment...
📝 Deploying with verification...

== Logs ==
  ContributionBadges deployed at: 0x[NEW_ADDRESS]
  Chain ID: 8453
  Deployer: 0x[DEPLOYER_ADDRESS]

✅ Deployment completed successfully!
```

### 3. Post-Deployment
```bash
# Update environment variable
# Edit .env file:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x[NEW_MAINNET_ADDRESS]

# Restart development server
npm run dev
```

## Testing Strategy

### 1. Network Connection Test
```bash
# Test wallet connection to Base Mainnet
# Open app and connect wallet
# Verify network shows "Base Mainnet (8453)"
```

### 2. Small Amount Testing
```bash
# Test with minimal amounts first:
# - 0.001 ETH for tips
# - Single contribution per type
# - Verify NFT minting
```

### 3. Functionality Testing
- [ ] Wallet connection to Base Mainnet
- [ ] All four contribution types (Attend, Host, Pace, Supplies)
- [ ] NFT badge minting
- [ ] Points calculation
- [ ] Streak tracking
- [ ] ETH tipping functionality
- [ ] Transaction confirmation
- [ ] BaseScan explorer links

## Gas Cost Monitoring

### Expected Costs on Base Mainnet
- **Contract Deployment**: ~0.003-0.005 ETH
- **Make Contribution**: ~0.0001-0.0003 ETH
- **Send Tip**: ~0.0001-0.0003 ETH
- **Total per user session**: ~0.0005 ETH

### Cost Optimization
- Single contract call for user data loading
- Efficient NFT minting with ERC-1155
- Minimal storage operations
- Gas-optimized Solidity patterns

## Paymaster Configuration

### Current Settings (Recommended)
```typescript
// In app/rootProvider.tsx
miniKit: {
  enabled: true,
  autoConnect: false, // ✅ Prevents automatic paymaster usage
  notificationProxyUrl: undefined,
}
```

### Why autoConnect: false?
- Prevents automatic wallet connection
- Avoids unexpected paymaster consumption
- Users must manually connect wallets
- Preserves your Base ETH budget

### Monitoring Paymaster Usage
```bash
# Check OnchainKit dashboard for paymaster usage
# Monitor Base ETH balance in connected wallet
# Set up alerts for unexpected consumption
```

## Troubleshooting

### Common Issues

#### 1. "Wrong network" Error
```
Error: Wrong network. Please switch to Base Mainnet (Chain ID: 8453)
```
**Solution:** User needs to switch wallet to Base Mainnet

#### 2. "Contract address not configured" Error
```
Error: Contract address not configured
```
**Solution:** Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in .env

#### 3. "No ethereum provider found" Error
```
Error: No ethereum provider found
```
**Solution:** User needs to install wallet extension (MetaMask, Coinbase Wallet, etc.)

#### 4. Transaction Failures
```
Error: Transaction failed
```
**Common Causes:**
- Insufficient ETH balance
- Network congestion
- Already contributed today
- Invalid contribution type

### Debug Information
The app provides comprehensive debugging:
- Transaction hashes with BaseScan links
- Network status and chain ID
- Contract address verification
- Error message parsing

## Base Dependencies

### Core Dependencies
```json
{
  "@coinbase/onchainkit": "1.0.0-alpha.13",
  "viem": "^2.31.6",
  "wagmi": "^2.16.3"
}
```

### Network Configuration
- **Base Mainnet RPC**: https://mainnet.base.org
- **Chain ID**: 8453
- **Block Explorer**: https://basescan.org
- **Native Token**: ETH

### OnchainKit Features Used
- Wallet connection and management
- Base network integration
- Transaction handling
- Paymaster functionality (disabled)

## Security Best Practices

### Deployment Security
- ✅ Never commit private keys
- ✅ Use dedicated deployment wallets
- ✅ Minimal ETH in deployment wallet
- ✅ Clear private keys from memory
- ✅ Verify contract on BaseScan

### Runtime Security
- ✅ Smart contract validation
- ✅ Soulbound NFTs prevent gaming
- ✅ Daily contribution limits
- ✅ Direct ETH transfers (no intermediaries)
- ✅ Immutable contribution records

## Next Steps After Deployment

### 1. Immediate Testing
- [ ] Deploy contract to Base Mainnet
- [ ] Update environment configuration
- [ ] Test all functionality with small amounts
- [ ] Verify BaseScan integration

### 2. User Onboarding
- [ ] Create wallet connection guide
- [ ] Explain NFT benefits to users
- [ ] Set up user support documentation
- [ ] Monitor transaction success rates

### 3. Production Monitoring
- [ ] Set up gas cost alerts
- [ ] Monitor contract interactions
- [ ] Track user adoption metrics
- [ ] Plan for contract upgrades (if needed)

## Support and Resources

### Documentation
- [Base Network Docs](https://docs.base.org/)
- [OnchainKit Docs](https://onchainkit.xyz/)
- [Foundry Docs](https://book.getfoundry.sh/)

### Block Explorers
- [BaseScan](https://basescan.org/) - Base Mainnet
- [BaseScan Sepolia](https://sepolia.basescan.org/) - Base Testnet

### Community
- [Base Discord](https://discord.gg/buildonbase)
- [Coinbase Developer Platform](https://www.coinbase.com/developer-platform)
