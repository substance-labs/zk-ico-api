# Base Contract Deployment API

A RESTful API for deploying smart contracts on Base network using Viem and TypeScript.

## Features

- Deploy contracts using bytecode and constructor parameters
- Support for Base Mainnet and Base Sepolia Testnet
- Gas estimation before deployment
- Comprehensive error handling
- Request validation
- Logging and monitoring

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Base-compatible wallet with ETH for gas fees

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd base-contract-deployer-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
BASE_RPC_URL=https://mainnet.base.org
BASE_TESTNET_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
```

## Usage

### Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

### API Endpoints

#### 1. Deploy Contract

**POST** `/api/deploy/contract`

Deploy a smart contract to Base network.

**Request Body:**
```json
{
  "bytecode": "0x608060405234801561001057600080fd5b5...",
  "abi": [...], // Optional: Contract ABI
  "constructorArgs": ["arg1", "arg2"], // Optional: Constructor parameters
  "networkId": 84532, // Optional: 8453 for mainnet, 84532 for testnet
  "gasLimit": 1000000, // Optional: Gas limit
  "gasPrice": "1000000000", // Optional: Gas price in wei
  "value": "0" // Optional: ETH value to send (for payable constructors)
}
```

**Response:**
```json
{
  "success": true,
  "contractAddress": "0x742d35C673C4C5a7d8C9b8B24e5e7a2E4a6E9E7D",
  "transactionHash": "0x1234567890abcdef...",
  "blockNumber": 12345678,
  "gasUsed": 987654,
  "deploymentCost": "0.001234",
  "network": "Base Sepolia",
  "timestamp": "2025-06-27T10:30:00.000Z"
}
```

#### 2. Estimate Gas

**POST** `/api/deploy/estimate`

Estimate gas cost for contract deployment.

**Request Body:**
```json
{
  "bytecode": "0x608060405234801561001057600080fd5b5...",
  "constructorArgs": ["arg1", "arg2"], // Optional
  "networkId": 84532, // Optional
  "value": "0" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "gasEstimate": 987654,
  "gasPrice": 1000000000,
  "estimatedCostWei": 987654000000000,
  "estimatedCostEth": "0.000988",
  "network": "Base Sepolia"
}
```

#### 3. Get Supported Networks

**GET** `/api/deploy/networks`

Get list of supported networks.

**Response:**
```json
{
  "success": true,
  "networks": [
    {
      "id": 8453,
      "name": "Base Mainnet",
      "rpcUrl": "https://mainnet.base.org",
      "blockExplorer": "https://basescan.org"
    },
    {
      "id": 84532,
      "name": "Base Sepolia Testnet",
      "rpcUrl": "https://sepolia.base.org",
      "blockExplorer": "https://sepolia.basescan.org"
    }
  ]
}
```

#### 4. Health Check

**GET** `/health`

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-27T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Example Usage

### Deploy a Simple Contract

```bash
curl -X POST http://localhost:3000/api/deploy/contract \
  -H "Content-Type: application/json" \
  -d '{
    "bytecode": "0x608060405234801561001057600080fd5b50348015610d1d57600080fd5b506040516020806100ed8339810180604052810190808051906020019092919050505080600081905550506040516020806100ed8339810180604052810190808051906020019092919050505080600081905550506040516020806100ed8339810180604052810190808051906020019092919050505080600081905550506040516020806100ed8339810180604052810190808051906020019092919050505080600081905550506040516020806100ed8339810180604052810190808051906020019092919050505080600081905550500",
    "constructorArgs": [42],
    "networkId": 84532
  }'
```

### Estimate Gas Before Deployment

```bash
curl -X POST http://localhost:3000/api/deploy/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "bytecode": "0x608060405234801561001057600080fd5b50...",
    "constructorArgs": [42],
    "networkId": 84532
  }'
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Contract deployed successfully
- `400` - Bad request (validation errors, insufficient funds, etc.)
- `404` - Route not found
- `500` - Internal server error
- `503` - Network connection error

## Security Considerations

1. **Private Key Security**: Never commit your private key to version control. Use environment variables.
2. **Rate Limiting**: Consider implementing rate limiting for production use.
3. **Input Validation**: All inputs are validated, but ensure bytecode comes from trusted sources.
4. **Network Security**: Use HTTPS in production and validate SSL certificates.

## Development

### Project Structure

```
src/
├── index.ts              # Main application entry
├── routes/
│   └── deploy.ts         # Deployment routes
├── services/
│   └── deploymentService.ts # Contract deployment logic
├── middleware/
│   ├── validation.ts     # Request validation
│   └── errorHandler.ts   # Error handling
├── types/
│   └── deployment.ts     # TypeScript interfaces
└── utils/
    └── logger.ts         # Logging configuration
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run watch` - Start development server with file watching

## License

MIT License
