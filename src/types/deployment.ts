import { Abi } from 'viem';

export interface DeploymentRequest {
  bytecode: string; // Contract bytecode (hex string with 0x prefix)
  abi?: Abi; // Contract ABI (optional, for better error handling)
  constructorArgs?: any[]; // Constructor parameters
  networkId?: number; // 8453 for Base mainnet, 84532 for Base Sepolia testnet
  gasLimit?: number;
  gasPrice?: string; // In wei
  value?: string; // ETH value to send with deployment (for payable constructors)
}

export interface DeploymentResponse {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: string;
  gasUsed?: string;
  deploymentCost?: string; // Cost in ETH
  network?: string;
  timestamp?: string;
  error?: string;
}

export interface EstimateGasRequest {
  bytecode: string;
  constructorArgs?: any[];
  networkId?: number;
  value?: string;
}

export interface EstimateGasResponse {
  success: boolean;
  gasEstimate?: string;
  gasPrice?: string;
  estimatedCostWei?: string;
  estimatedCostEth?: string;
  network?: string;
  error?: string;
}
