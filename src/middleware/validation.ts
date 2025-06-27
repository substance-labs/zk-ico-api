import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const deploymentSchema = Joi.object({
  bytecode: Joi.string()
    .pattern(/^0x[a-fA-F0-9]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Bytecode must be a valid hex string starting with 0x',
      'any.required': 'Bytecode is required'
    }),
  abi: Joi.array().optional(),
  constructorArgs: Joi.array().optional().default([]),
  networkId: Joi.number().valid(8453, 84532).optional().default(84532),
  gasLimit: Joi.number().min(21000).max(30000000).optional(),
  gasPrice: Joi.string().pattern(/^\d+$/).optional(),
  value: Joi.string().pattern(/^\d+(\.\d+)?$/).optional().default('0')
});

const estimateGasSchema = Joi.object({
  bytecode: Joi.string()
    .pattern(/^0x[a-fA-F0-9]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Bytecode must be a valid hex string starting with 0x',
      'any.required': 'Bytecode is required'
    }),
  constructorArgs: Joi.array().optional().default([]),
  networkId: Joi.number().valid(8453, 84532).optional().default(84532),
  value: Joi.string().pattern(/^\d+(\.\d+)?$/).optional().default('0')
});

export const validateDeployment = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = deploymentSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.body = value;
  next();
};

export const validateEstimateGas = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = estimateGasSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.body = value;
  next();
};
