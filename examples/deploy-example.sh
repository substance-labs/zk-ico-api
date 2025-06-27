#!/bin/bash

# Example: Deploy SimpleStorage contract using the Base Contract Deployment API
# This script demonstrates how to deploy a simple storage contract

echo "🚀 Base Contract Deployment Example"
echo "=================================="
echo ""

# Check if API is running
echo "🔍 Checking if API is running..."
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ API is not running. Please start it first:"
    echo "   npm run dev"
    echo "   or"
    echo "   ./start-tunnel.sh"
    exit 1
echo "✅ API is running!"
echo ""

# Get contract details from the compiled JSON file
BYTECODE="0x6080604052348015600e575f5ffd5b5060405161020f38038061020f8339818101604052810190602e9190606b565b805f81905550506091565b5f5ffd5b5f819050919050565b604d81603d565b81146056575f5ffd5b50565b5f815190506065816046565b92915050565b5f60208284031215607d57607c6039565b5b5f6088848285016059565b91505092915050565b6101718061009e5f395ff3fe608060405234801561000f575f5ffd5b506004361061003f575f3560e01c80632a1afcd91461004357806360fe47b1146100615780636d4ce63c1461007d575b5f5ffd5b61004b61009b565b60405161005891906100c9565b60405180910390f35b61007b60048036038101906100769190610110565b6100a0565b005b6100856100a9565b60405161009291906100c9565b60405180910390f35b5f5481565b805f8190555050565b5f5f54905090565b5f819050919050565b6100c3816100b1565b82525050565b5f6020820190506100dc5f8301846100ba565b92915050565b5f5ffd5b6100ef816100b1565b81146100f9575f5ffd5b50565b5f8135905061010a816100e6565b92915050565b5f60208284031215610125576101246100e2565b5b5f610132848285016100fc565b9150509291505056fea2646970667358221220d0eeae2ad87ea8407f05126b50da0ae507fc312d2714014d0b225b3e20c3bedc64736f6c634300081c0033"
CONSTRUCTOR_ARGS='[42]'
NETWORK_ID=84532
fi

echo "✅ API is running!"
echo ""

# Get contract details
BYTECODE="0x6080604052348015600e575f5ffd5b5060405161020f38038061020f8339818101604052810190602e9190606b565b805f81905550506091565b5f5ffd5b5f819050919050565b604d81603d565b81146056575f5ffd5b50565b5f815190506065816046565b92915050565b5f60208284031215607d57607c6039565b5b5f6088848285016059565b91505092915050565b6101718061009e5f395ff3fe608060405234801561000f575f5ffd5b506004361061003f575f3560e01c80632a1afcd91461004357806360fe47b1146100615780636d4ce63c1461007d575b5f5ffd5b61004b61009b565b60405161005891906100c9565b60405180910390f35b61007b60048036038101906100769190610110565b6100a0565b005b6100856100a9565b60405161009291906100c9565b60405180910390f35b5f5481565b805f8190555050565b5f5f54905090565b5f819050919050565b6100c3816100b1565b82525050565b5f6020820190506100dc5f8301846100ba565b92915050565b5f5ffd5b6100ef816100b1565b81146100f9575f5ffd5b50565b5f8135905061010a816100e6565b92915050565b5f60208284031215610125576101246100e2565b5b5f610132848285016100fc565b9150509291505056fea2646970667358221220d0eeae2ad87ea8407f05126b50da0ae507fc312d2714014d0b225b3e20c3bedc64736f6c634300081c0033"
CONSTRUCTOR_ARGS='[42]'
NETWORK_ID=84532

echo "📋 Contract Details:"
echo "   Name: SimpleStorage"
echo "   Initial Value: 42"
echo "   Network: Base Sepolia Testnet (${NETWORK_ID})"
echo ""

# Step 1: Estimate gas
echo "⛽ Step 1: Estimating gas cost..."
ESTIMATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/deploy/estimate \
  -H "Content-Type: application/json" \
  -d "{
    \"bytecode\": \"${BYTECODE}\",
    \"constructorArgs\": ${CONSTRUCTOR_ARGS},
    \"networkId\": ${NETWORK_ID}
  }")

echo "📊 Gas Estimation Result:"
echo "$ESTIMATE_RESPONSE" | jq '.'
echo ""

# Check if estimation was successful
if echo "$ESTIMATE_RESPONSE" | jq -e '.success' > /dev/null; then
    ESTIMATED_COST=$(echo "$ESTIMATE_RESPONSE" | jq -r '.estimatedCostEth')
    echo "💰 Estimated deployment cost: ${ESTIMATED_COST} ETH"
    echo ""
    
    read -p "🤔 Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Step 2: Deploy contract
        echo "🚀 Step 2: Deploying contract..."
        DEPLOY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/deploy/contract \
          -H "Content-Type: application/json" \
          -d "{
            \"bytecode\": \"${BYTECODE}\",
            \"constructorArgs\": ${CONSTRUCTOR_ARGS},
            \"networkId\": ${NETWORK_ID}
          }")

        echo "📋 Deployment Result:"
        echo "$DEPLOY_RESPONSE" | jq '.'
        echo ""
        
        # Check if deployment was successful
        if echo "$DEPLOY_RESPONSE" | jq -e '.success' > /dev/null; then
            CONTRACT_ADDRESS=$(echo "$DEPLOY_RESPONSE" | jq -r '.contractAddress')
            TX_HASH=$(echo "$DEPLOY_RESPONSE" | jq -r '.transactionHash')
            
            echo "🎉 Contract deployed successfully!"
            echo "📍 Contract Address: ${CONTRACT_ADDRESS}"
            echo "🔗 Transaction Hash: ${TX_HASH}"
            echo "🌐 View on Block Explorer: https://sepolia.basescan.org/tx/${TX_HASH}"
            echo ""
            echo "📝 You can now interact with your contract using:"
            echo "   - Contract Address: ${CONTRACT_ADDRESS}"
            echo "   - ABI: See examples/SimpleStorage.json"
            echo "   - Network: Base Sepolia Testnet"
        else
            echo "❌ Deployment failed!"
            ERROR=$(echo "$DEPLOY_RESPONSE" | jq -r '.error')
            echo "🔍 Error: ${ERROR}"
        fi
    else
        echo "⏹️ Deployment cancelled by user."
    fi
else
    echo "❌ Gas estimation failed!"
    ERROR=$(echo "$ESTIMATE_RESPONSE" | jq -r '.error')
    echo "🔍 Error: ${ERROR}"
fi

echo ""
echo "✨ Example completed!"
