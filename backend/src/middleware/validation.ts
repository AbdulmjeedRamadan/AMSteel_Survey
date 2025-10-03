/**
 * Validation middleware
 * Uses express-validator for input validation
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendValidationError } from '../utils/response';
import { ValidationError } from '../types';

/**
 * Middleware to handle validation results
 * Checks for validation errors and returns formatted error response
 */
export function validate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: ValidationError[] = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
    }));

    sendValidationError(res, formattedErrors);
    return;
  }

  next();
}

/**
 * Run validation chains and then validate
 */
export function runValidation(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    for (const validation of validations) {
      await validation.run(req);
    }

    // Check results
    validate(req, res, next);
  };
}

export default {
  validate,
  runValidation,
};
