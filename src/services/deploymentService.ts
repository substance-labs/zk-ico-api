import { createWalletClient, createPublicClient, http, parseEther, encodeFunctionData, encodeDeployData, encodeAbiParameters, parseAbiParameters } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { DeploymentRequest, DeploymentResponse, EstimateGasRequest, EstimateGasResponse } from '../types/deployment';
import { logger } from '../utils/logger';

// Network configurations
const getChain = (networkId: number) => {
  switch (networkId) {
    case 8453:
      return base;
    case 84532:
      return baseSepolia;
    default:
      return baseSepolia; // Default to testnet
  }
};

const getRpcUrl = (networkId: number): string => {
  switch (networkId) {
    case 8453:
      return process.env.BASE_RPC_URL || 'https://mainnet.base.org';
    case 84532:
      return process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org';
    default:
      return process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org';
  }
};

// Helper function to infer ABI parameter types and encode constructor arguments
const encodeConstructorArguments = (args: any[]): string => {
  if (args.length === 0) return '';
  
  // Infer types from the arguments
  const types = args.map(arg => {
    if (typeof arg === 'string') {
      // Check if it's an address (starts with 0x and is 42 characters)
      if (arg.startsWith('0x') && arg.length === 42) {
        return 'address';
      }
      // Otherwise it's a string
      return 'string';
    } else if (typeof arg === 'number' || typeof arg === 'bigint') {
      return 'uint256';
    } else if (typeof arg === 'boolean') {
      return 'bool';
    } else if (Array.isArray(arg)) {
      // Handle arrays - this is a simple case, you might need more complex logic
      return 'uint256[]';
    }
    // Default to string for unknown types
    return 'string';
  });
  
  try {
    // Create ABI parameter string
    const abiParams = parseAbiParameters(types.join(', '));
    
    // Encode the arguments
    const encoded = encodeAbiParameters(abiParams, args);
    
    // Return without the '0x' prefix since it will be appended to bytecode
    return encoded.slice(2);
  } catch (error) {
    logger.error('Failed to encode constructor arguments:', error);
    throw new Error(`Failed to encode constructor arguments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export class ContractDeploymentService {
  private getClients(networkId: number = 84532) {
    const chain = getChain(networkId);
    const rpcUrl = getRpcUrl(networkId);
    
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl)
    });

    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl)
    });

    return { publicClient, walletClient, account };
  }

  async estimateGas(request: EstimateGasRequest): Promise<EstimateGasResponse> {
    try {
      const { bytecode, constructorArgs = [], networkId = 84532, value = '0' } = request;
      const { publicClient, account } = this.getClients(networkId);
      const chain = getChain(networkId);

      // Prepare deployment data with proper constructor argument encoding
      let deploymentData: `0x${string}`;
      
      if (constructorArgs.length > 0) {
        // Use proper ABI encoding for constructor arguments
        const encodedArgs = encodeConstructorArguments(constructorArgs);
        deploymentData = (bytecode + encodedArgs) as `0x${string}`;
      } else {
        deploymentData = bytecode as `0x${string}`;
      }

      // Estimate gas for deployment
      const gasEstimate = await publicClient.estimateGas({
        account: account.address,
        data: deploymentData,
        value: parseEther(value)
      });

      // Get current gas price
      const gasPrice = await publicClient.getGasPrice();
      
      const estimatedCostWei = gasEstimate * gasPrice;
      const estimatedCostEth = (Number(estimatedCostWei) / 1e18).toFixed(6);

      return {
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        estimatedCostWei: estimatedCostWei.toString(),
        estimatedCostEth,
        network: chain.name
      };
    } catch (error) {
      logger.error('Gas estimation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deployContract(request: DeploymentRequest): Promise<DeploymentResponse> {
    try {
      const { 
        bytecode, 
        abi,
        constructorArgs = [], 
        networkId = 84532, 
        gasLimit,
        gasPrice,
        value = '0'
      } = request;

      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY environment variable is required');
      }

      const { publicClient, walletClient, account } = this.getClients(networkId);
      const chain = getChain(networkId);

      logger.info(`Deploying contract on ${chain.name}`, {
        networkId,
        account: account.address,
        bytecodeLength: bytecode.length
      });

      // Prepare deployment data
      let deploymentData: `0x${string}`;
      
      if (abi && constructorArgs.length > 0) {
        // Use encodeDeployData when we have ABI and constructor args
        deploymentData = encodeDeployData({
          abi,
          bytecode: bytecode as `0x${string}`,
          args: constructorArgs
        });
      } else if (constructorArgs.length > 0) {
        // Use proper ABI encoding when we don't have ABI but have constructor args
        const encodedArgs = encodeConstructorArguments(constructorArgs);
        deploymentData = (bytecode + encodedArgs) as `0x${string}`;
      } else {
        // Use raw bytecode when no ABI or constructor args
        deploymentData = bytecode as `0x${string}`;
      }

      // Prepare transaction parameters
      const txParams: any = {
        data: deploymentData,
        value: parseEther(value)
      };

      if (gasLimit) {
        txParams.gas = BigInt(gasLimit);
      }

      if (gasPrice) {
        txParams.gasPrice = BigInt(gasPrice);
      }

      // Send the deployment transaction
      const hash = await walletClient.sendTransaction(txParams);

      logger.info(`Transaction submitted: ${hash}`);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000 // 60 second timeout
      });

      const deploymentCost = (Number(receipt.gasUsed * receipt.effectiveGasPrice) / 1e18).toFixed(6);

      logger.info(`Contract deployed successfully`, {
        contractAddress: receipt.contractAddress,
        transactionHash: hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString()
      });

      return {
        success: true,
        contractAddress: receipt.contractAddress!,
        transactionHash: hash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        deploymentCost,
        network: chain.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Contract deployment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
