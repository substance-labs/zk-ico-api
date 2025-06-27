import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Viem errors
  if (err.message?.includes('insufficient funds')) {
    error = { name: 'InsufficientFundsError', message: 'Insufficient funds for deployment', statusCode: 400 } as CustomError;
  }

  if (err.message?.includes('gas required exceeds allowance')) {
    error = { name: 'GasError', message: 'Gas limit too low for deployment', statusCode: 400 } as CustomError;
  }

  if (err.message?.includes('invalid bytecode')) {
    error = { name: 'BytecodeError', message: 'Invalid contract bytecode', statusCode: 400 } as CustomError;
  }

  // Network errors
  if (err.message?.includes('network')) {
    error = { name: 'NetworkError', message: 'Network connection error', statusCode: 503 } as CustomError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
