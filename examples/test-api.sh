#!/bin/bash

# Example: Test all API endpoints

echo "🧪 API Testing Script"
echo "===================="
echo ""

API_URL="http://localhost:3000"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed. Please install it:"
    echo "   sudo apt-get install jq  # Ubuntu/Debian"
    echo "   brew install jq          # macOS"
    exit 1
fi

# Test 1: Health Check
echo "🏥 Test 1: Health Check"
echo "-----------------------"
curl -s "${API_URL}/health" | jq '.'
echo ""

# Test 2: API Documentation
echo "📚 Test 2: API Documentation"
echo "----------------------------"
curl -s "${API_URL}/api" | jq '.'
echo ""

# Test 3: Supported Networks
echo "🌐 Test 3: Supported Networks"
echo "-----------------------------"
curl -s "${API_URL}/api/deploy/networks" | jq '.'
echo ""

# Test 4: Gas Estimation
echo "⛽ Test 4: Gas Estimation"
echo "------------------------"
curl -s -X POST "${API_URL}/api/deploy/estimate" \
  -H "Content-Type: application/json" \
  -d '{
    "bytecode": "0x608060405234801561001057600080fd5b50604051610152380380610152833981810160405281019061003291906100b9565b8060008190555050610109565b600080fd5b6000819050919050565b61005681610043565b811461006157600080fd5b50565b6000815190506100738161004d565b92915050565b600080fd5b600080fd5b60006020828403121561009857610097610079565b5b60006100a684828501610064565b91505092915050565b6100b881610043565b82525050565b60006020820190506100d360008301846100af565b92915050565b603a806100e66000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80632e64cec11460375780636057361d14604c575b600080fd5b60005460405190815260200160405180910390f35b605a605736600460046063565b600055565b005b600060208284031215607457600080fd5b503591905056fea2646970667358221220c9ab7e8e2e7c6f8d5b4a3b2a1a9a8a7a6a5a4a3a2a1a9a8a7a6a5a4a3a2a1a964736f6c63430008130033",
    "constructorArgs": [42],
    "networkId": 84532
  }' | jq '.'
echo ""

# Test 5: Validation Error (invalid bytecode)
echo "❌ Test 5: Validation Error Test"
echo "--------------------------------"
curl -s -X POST "${API_URL}/api/deploy/contract" \
  -H "Content-Type: application/json" \
  -d '{
    "bytecode": "invalid_bytecode",
    "constructorArgs": [42],
    "networkId": 84532
  }' | jq '.'
echo ""

# Test 6: 404 Error
echo "🔍 Test 6: 404 Error Test"
echo "-------------------------"
curl -s "${API_URL}/nonexistent" | jq '.'
echo ""

echo "✅ All tests completed!"
echo ""
echo "💡 To deploy a real contract, run: ./examples/deploy-example.sh"
