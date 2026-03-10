// import { Prisma } from '../../generated/prisma';
import { Prisma } from '../generated/prisma/client';
import AppError from './AppError';

/**
 * Maps Prisma-specific errors to a friendly AppError instance.
 *
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    // Unique constraint violation
    case 'P2002': {
      const fields = (err.meta?.target as string[])?.join(', ') ?? 'field';
      return new AppError(
        `Duplicate value for unique field(s): ${fields}. Please use a different value.`,
        409,
      );
    }

    // Record not found
    case 'P2025': {
      const cause = (err.meta?.cause as string) ?? 'Record not found.';
      return new AppError(cause, 404);
    }

    // Foreign key constraint failed
    case 'P2003': {
      const field = (err.meta?.field_name as string) ?? 'relation';
      return new AppError(
        `Related record not found for field: ${field}.`,
        400,
      );
    }

    // Required field missing / null constraint violation
    case 'P2011': {
      const field = (err.meta?.constraint as string) ?? 'field';
      return new AppError(`Null constraint violation on field: ${field}.`, 400);
    }

    // Value too long for column
    case 'P2000': {
      return new AppError(
        'One or more field values are too long for their column type.',
        400,
      );
    }

    // Invalid value
    case 'P2006': {
      return new AppError('The provided value for a field is not valid.', 400);
    }

    default:
      return new AppError(
        `Database error (code: ${err.code}): ${err.message}`,
        500,
      );
  }
};

export default handlePrismaError;
