import { ZodError, ZodIssue } from 'zod';
import AppError from './AppError';

/**
 * A single structured validation issue returned to the client.
 */
export interface ValidationIssue {
  field: string;
  message: string;
}

/**
 * Extended error class that carries the list of Zod validation issues
 * alongside the standard AppError fields.
 */
export class ZodValidationError extends AppError {
  public readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super('Validation failed. Please check the provided data.', 422);
    this.issues = issues;
    this.name = 'ZodValidationError';
  }
}

/**
 * Converts a ZodError into a ZodValidationError that the global error
 * handler can serialise and send back to the client.
 */
const handleZodError = (err: ZodError): ZodValidationError => {
  const issues: ValidationIssue[] = err.issues.map((issue: ZodIssue) => ({
    // Build a human-readable field path, e.g. "user.email"
    field: issue.path.join('.') || 'value',
    message: issue.message,
  }));

  return new ZodValidationError(issues);
};

export default handleZodError;
