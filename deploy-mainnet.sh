#!/bin/bash

# Secure Base Mainnet Deployment Script
# This script deploys the ContributionBadges contract to Base Mainnet

echo "🚀 Base Mainnet Deployment Script"
echo "================================="

# Check if required environment variables are set
if [ -z "$BASE_MAINNET_RPC_URL" ]; then
    echo "❌ Error: BASE_MAINNET_RPC_URL not set"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo "⚠️  Warning: BASESCAN_API_KEY not set - contract verification will be skipped"
fi

# Prompt for private key (will not be stored)
echo "🔐 Enter your deployment wallet private key (will not be stored):"
echo "   Make sure this wallet has at least 0.005 ETH on Base Mainnet"
read -s PRIVATE_KEY

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: Private key is required"
    exit 1
fi

# Validate private key format
if [[ ! $PRIVATE_KEY =~ ^0x[a-fA-F0-9]{64}$ ]]; then
    echo "❌ Error: Invalid private key format (should be 0x followed by 64 hex characters)"
    exit 1
fi

echo ""
echo "📋 Deployment Configuration:"
echo "   Network: Base Mainnet (Chain ID: 8453)"
echo "   RPC URL: $BASE_MAINNET_RPC_URL"
echo "   Contract: ContributionBadges.sol"
echo ""

# Confirm deployment
read -p "🤔 Do you want to proceed with deployment? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🔨 Starting deployment..."

# Change to contracts directory
cd contracts

# Deploy contract
if [ -n "$BASESCAN_API_KEY" ]; then
    echo "📝 Deploying with verification..."
    PRIVATE_KEY=$PRIVATE_KEY forge script script/Deploy.s.sol \
        --rpc-url $BASE_MAINNET_RPC_URL \
        --private-key $PRIVATE_KEY \
        --broadcast \
        --verify \
        --etherscan-api-key $BASESCAN_API_KEY
else
    echo "📝 Deploying without verification..."
    PRIVATE_KEY=$PRIVATE_KEY forge script script/Deploy.s.sol \
        --rpc-url $BASE_MAINNET_RPC_URL \
        --private-key $PRIVATE_KEY \
        --broadcast
fi

deployment_result=$?

# Clear private key from memory
unset PRIVATE_KEY

if [ $deployment_result -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Copy the deployed contract address from the output above"
    echo "2. Update NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file"
    echo "3. Test the deployment with small amounts"
    echo ""
    echo "🔍 You can view your deployment on BaseScan:"
    echo "   https://basescan.org/address/[CONTRACT_ADDRESS]"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "   Check the error messages above"
    echo "   Common issues:"
    echo "   - Insufficient ETH balance"
    echo "   - Network connectivity issues"
    echo "   - Invalid private key"
fi
