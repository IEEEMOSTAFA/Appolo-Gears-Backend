import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { createToken, verifyToken } from './auth.utils';

const registerUser = async (payload: any) => {
  // Check if user exists
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    throw new AppError('User already exists', httpStatus.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds) || 12
  );

  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    } as any, // Cast to any because the generated types are stale
  });

  return newUser;
};

const loginUser = async (payload: any) => {
  const user: any = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user || (!user.password)) {
    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedUser;
  try {
    decodedUser = verifyToken(token, config.jwt_refresh_secret as string);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', httpStatus.UNAUTHORIZED);
  }

  // check if user exist
  const isUserExist: any = await prisma.user.findUnique({
    where: { id: decodedUser.userId },
  });

  if (!isUserExist) {
    throw new AppError('User does not exist', httpStatus.NOT_FOUND);
  }

  const jwtPayload = {
    userId: isUserExist.id,
    role: isUserExist.role,
  };

  const newAccessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
};