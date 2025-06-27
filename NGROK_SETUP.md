# Exposing Base Contract Deployment API via ngrok

## Quick Start

### Option 1: Using the provided script (Recommended)
```bash
./start-tunnel.sh
```

### Option 2: Manual setup
```bash
# Terminal 1 - Start the API
npm run dev

# Terminal 2 - Start ngrok tunnel (after API is running)
npm run tunnel
```

### Option 3: Using concurrently
```bash
npm run dev:tunnel
```

## Getting Your Public URL

1. **Via ngrok web interface**: Open http://127.0.0.1:4040 in your browser
2. **Via API health check**: Make a GET request to your local API at `http://localhost:3000/health`
3. **Via command line**: The ngrok terminal will show the public URL

## Example Usage with Public URL

Once ngrok is running, you'll get a URL like `https://abc123.ngrok.io`. You can then use your API from anywhere:

### Health Check
```bash
curl https://abc123.ngrok.io/health
```

### API Documentation
```bash
curl https://abc123.ngrok.io/api
```

### Deploy Contract
```bash
curl -X POST https://abc123.ngrok.io/api/deploy/contract \
  -H "Content-Type: application/json" \
  -d '{
    "bytecode": "0x608060405234801561001057600080fd5b5060405161014d38038061014d8339818101604052810190610032919061007a565b80600081905550506100a7565b600080fd5b6000819050919050565b61005781610044565b811461006257600080fd5b50565b6000815190506100748161004e565b92915050565b6000602082840312156100905761008f61003f565b5b600061009e84828501610065565b91505092915050565b6098806100b66000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80632e64cec11460375780636057361d14604c575b600080fd5b60005460405190815260200160405180910390f35b6059605736600460046063565b600055565b005b600060208284031215607457600080fd5b503591905056fea26469706673582212207c0a9b8b0e68c1b2b19a8a1b7a9b8f7e6d5c4b3a2919f8d7e6c5b4a392817d6e64736f6c63430008120033",
    "constructorArgs": [42],
    "networkId": 84532
  }'
```

## Security Considerations for Public Exposure

⚠️ **Important Security Notes:**

1. **Private Key Protection**: Your private key is server-side only, never exposed to clients
2. **Rate Limiting**: Consider adding rate limiting for production use
3. **Authentication**: For production, add API keys or authentication
4. **HTTPS Only**: ngrok provides HTTPS by default, always use it
5. **Whitelist IPs**: Consider restricting access to known IPs if needed

## Production Setup

For production use, consider:

1. **Custom Domain**: Use ngrok's custom domains feature
2. **Reserved URL**: Get a reserved ngrok URL that doesn't change
3. **Authentication**: Add your own authentication layer
4. **Rate Limiting**: Implement proper rate limiting
5. **Monitoring**: Add monitoring and alerting

## Ngrok Features

- **Web Inspector**: View all HTTP requests at http://127.0.0.1:4040
- **Request Replay**: Replay requests for testing
- **Traffic Analysis**: See detailed request/response data
- **Custom Domains**: Use your own domain (paid feature)
- **Password Protection**: Add basic auth (paid feature)

## Troubleshooting

### ngrok not found
```bash
# Install ngrok
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### API not accessible
1. Ensure your API is running on port 3000
2. Check firewall settings
3. Verify ngrok tunnel is active
4. Check ngrok web interface at http://127.0.0.1:4040

## Example Integration

Here's how someone could integrate with your public API:

```javascript
// JavaScript example
const deployContract = async (bytecode, constructorArgs) => {
  const response = await fetch('https://your-ngrok-url.ngrok.io/api/deploy/contract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bytecode,
      constructorArgs,
      networkId: 84532 // Base Sepolia testnet
    })
  });
  
  const result = await response.json();
  return result;
};

// Usage
const result = await deployContract(
  '0x608060405234801561001057600080fd5b50...', 
  [42]
);
console.log('Contract deployed at:', result.contractAddress);
```

```python
# Python example
import requests

def deploy_contract(bytecode, constructor_args):
    url = "https://your-ngrok-url.ngrok.io/api/deploy/contract"
    payload = {
        "bytecode": bytecode,
        "constructorArgs": constructor_args,
        "networkId": 84532
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = deploy_contract(
    "0x608060405234801561001057600080fd5b50...",
    [42]
)
print(f"Contract deployed at: {result['contractAddress']}")
```

## Sharing Your API

Your API is now publicly accessible! Share the ngrok URL with others who need to deploy contracts on Base. They can:

1. Deploy contracts without setting up their own infrastructure
2. Estimate gas costs before deployment
3. Deploy to both Base mainnet and testnet
4. Get deployment status and transaction details

Remember to monitor usage and costs if you're providing this as a service!
