const fs = require('fs');
const path = require('path');

// Load contract data
const contractPath = path.join(__dirname, 'SimpleStorage.json');
const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

const API_URL = 'http://localhost:3000';

/**
 * Deploy the SimpleStorage contract
 */
async function deployContract() {
    try {
        console.log('🚀 Deploying SimpleStorage contract...');
        
        const deploymentData = {
            bytecode: contractData.bytecode,
            constructorArgs: [42], // Initial value
            networkId: 84532 // Base Sepolia testnet
        };

        // First, estimate gas
        console.log('⛽ Estimating gas...');
        const estimateResponse = await fetch(`${API_URL}/api/deploy/estimate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deploymentData)
        });

        const estimate = await estimateResponse.json();
        console.log('📊 Gas estimation:', estimate);

        if (!estimate.success) {
            throw new Error(`Gas estimation failed: ${estimate.error}`);
        }

        // Deploy the contract
        console.log('🚀 Deploying contract...');
        const deployResponse = await fetch(`${API_URL}/api/deploy/contract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deploymentData)
        });

        const deployment = await deployResponse.json();
        console.log('📋 Deployment result:', deployment);

        if (deployment.success) {
            console.log('✅ Contract deployed successfully!');
            console.log(`📍 Contract Address: ${deployment.contractAddress}`);
            console.log(`🔗 Transaction Hash: ${deployment.transactionHash}`);
            console.log(`💰 Gas Used: ${deployment.gasUsed}`);
            console.log(`💸 Cost: ${deployment.deploymentCost} ETH`);
            console.log(`🌐 View on BaseScan: https://sepolia.basescan.org/tx/${deployment.transactionHash}`);
            
            return deployment.contractAddress;
        } else {
            throw new Error(`Deployment failed: ${deployment.error}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

/**
 * Get supported networks
 */
async function getNetworks() {
    try {
        const response = await fetch(`${API_URL}/api/deploy/networks`);
        const networks = await response.json();
        console.log('🌐 Supported networks:', networks);
        return networks;
    } catch (error) {
        console.error('❌ Error getting networks:', error.message);
        throw error;
    }
}

/**
 * Test API health
 */
async function testHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const health = await response.json();
        console.log('❤️ API Health:', health);
        return health;
    } catch (error) {
        console.error('❌ Error testing health:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        console.log('🧪 Running Node.js example...\n');

        // Test health
        await testHealth();
        console.log();

        // Get networks
        await getNetworks();
        console.log();

        // Deploy contract
        const contractAddress = await deployContract();
        console.log();

        console.log('🎉 Example completed successfully!');
        console.log(`📝 Your contract is deployed at: ${contractAddress}`);
        console.log('💡 You can now interact with it using web3 libraries');

    } catch (error) {
        console.error('💥 Example failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    deployContract,
    getNetworks,
    testHealth
};
