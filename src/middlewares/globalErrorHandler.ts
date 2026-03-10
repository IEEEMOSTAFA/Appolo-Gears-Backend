import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
// import { Prisma } from '../../generated/prisma';
import { ZodError } from 'zod';
import AppError from '../errors/AppError';
import handlePrismaError from '../errors/handlePrismaError';
import handleZodError, { ZodValidationError } from '../errors/handleZodError';
import { Prisma } from '../generated/prisma/client';


const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  // ── 1. Zod validation errors ──────────────────────────────────────────────
  if (err instanceof ZodError) {
    const appErr = handleZodError(err);
    res.status(appErr.statusCode).json({
      success: false,
      message: appErr.message,
      error: {
        statusCode: appErr.statusCode,
        name: appErr.name,
        issues: appErr.issues,
        stack: process.env.NODE_ENV === 'development' ? appErr.stack : undefined,
      },
    });
    return;
  }

  // ── 2. Prisma known-request errors ───────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const appErr = handlePrismaError(err);
    res.status(appErr.statusCode).json({
      success: false,
      message: appErr.message,
      error: {
        statusCode: appErr.statusCode,
        name: appErr.status,
        stack: process.env.NODE_ENV === 'development' ? appErr.stack : undefined,
      },
    });
    return;
  }

  // ── 3. Operational AppErrors (thrown explicitly in the app) ───────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        statusCode: err.statusCode,
        name: err.status,
        issues: err instanceof ZodValidationError ? err.issues : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
    });
    return;
  }

  // ── 4. Unhandled / unknown errors ─────────────────────────────────────────
  const unknownErr = err as Error;
  res.status(500).json({
    success: false,
    message: unknownErr?.message ?? 'Internal Server Error',
    error: {
      statusCode: 500,
      name: 'InternalServerError',
      stack: process.env.NODE_ENV === 'development' ? unknownErr?.stack : undefined,
    },
  });
};

export default globalErrorHandler;
