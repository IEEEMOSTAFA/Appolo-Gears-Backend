import { NextFunction, Request, Response } from 'express';

/**
 * A higher-order function that wraps an asynchronous Express request handler.
 * It catches any errors thrown within the handler and passes them to the
 * next middleware in the stack (usually the global error handler).
 *
 * @param fn - The asynchronous Express request handler to wrap.
 * @returns A new request handler that handles promise rejections.
 */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;