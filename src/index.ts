import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { deployRouter } from './routes/deploy';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes
app.use('/api/deploy', deployRouter);

// Health check endpoint
app.get('/health', async (req, res) => {
  let ngrokUrl = null;
  
  // Try to get ngrok tunnel URL
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    if (response.ok) {
      const data = await response.json() as any;
      const httpsTunnel = data.tunnels?.find((tunnel: any) => 
        tunnel.proto === 'https' && tunnel.config.addr === 'http://localhost:3000'
      );
      ngrokUrl = httpsTunnel?.public_url || null;
    }
  } catch (error) {
    // ngrok not running or not accessible
  }

  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    ...(ngrokUrl && { 
      ngrokUrl,
      publicEndpoints: {
        'Health Check': `${ngrokUrl}/health`,
        'API Documentation': `${ngrokUrl}/api`,
        'Deploy Contract': `${ngrokUrl}/api/deploy/contract`,
        'Estimate Gas': `${ngrokUrl}/api/deploy/estimate`,
        'Networks': `${ngrokUrl}/api/deploy/networks`
      }
    })
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Base Contract Deployment API',
    version: '1.0.0',
    description: 'Deploy smart contracts on Base network using bytecode and constructor parameters',
    endpoints: {
      'POST /api/deploy/contract': 'Deploy a contract',
      'POST /api/deploy/estimate': 'Estimate gas for deployment',
      'GET /api/deploy/networks': 'Get supported networks',
      'GET /health': 'Health check'
    },
    documentation: 'https://github.com/your-repo/base-contract-deployer'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    availableEndpoints: [
      'POST /api/deploy/contract',
      'POST /api/deploy/estimate', 
      'GET /api/deploy/networks',
      'GET /health',
      'GET /api'
    ]
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API documentation available at http://localhost:${PORT}/api`);
  logger.info(`❤️ Health check available at http://localhost:${PORT}/health`);
});

export default app;
