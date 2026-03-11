import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { Role } from '../generated/prisma';
import catchAsync from '../utils/catchAsync';

const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // checking if the token is missing
    if (!token) {
      throw new AppError('You are not authorized!', httpStatus.UNAUTHORIZED);
    }

    // checking if the given token is valid
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (error) {
       throw new AppError('Unauthorized', httpStatus.UNAUTHORIZED);
    }

    const { role } = decoded;

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(
        'You have no access to this route',
        httpStatus.FORBIDDEN
      );
    }

    (req as any).user = decoded as JwtPayload & {
      id: string;
      email: string;
      role: Role;
      iat: number;
      exp: number;
    };
    next();
  });
};

export default auth;
