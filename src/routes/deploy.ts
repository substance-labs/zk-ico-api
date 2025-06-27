import { Router, Request, Response } from 'express';
import { ContractDeploymentService } from '../services/deploymentService';
import { validateDeployment, validateEstimateGas } from '../middleware/validation';
import { DeploymentRequest, EstimateGasRequest } from '../types/deployment';

const router = Router();
const deploymentService = new ContractDeploymentService();

// POST /api/deploy/contract - Deploy a contract
router.post('/contract', validateDeployment, async (req: Request, res: Response) => {
  try {
    const deploymentRequest: DeploymentRequest = req.body;
    const result = await deploymentService.deployContract(deploymentRequest);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// POST /api/deploy/estimate - Estimate gas for deployment
router.post('/estimate', validateEstimateGas, async (req: Request, res: Response) => {
  try {
    const estimateRequest: EstimateGasRequest = req.body;
    const result = await deploymentService.estimateGas(estimateRequest);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// GET /api/deploy/networks - Get supported networks
router.get('/networks', (req: Request, res: Response) => {
  res.json({
    success: true,
    networks: [
      {
        id: 8453,
        name: 'Base Mainnet',
        rpcUrl: 'https://mainnet.base.org',
        blockExplorer: 'https://basescan.org'
      },
      {
        id: 84532,
        name: 'Base Sepolia Testnet',
        rpcUrl: 'https://sepolia.base.org',
        blockExplorer: 'https://sepolia.basescan.org'
      }
    ]
  });
});

export { router as deployRouter };
