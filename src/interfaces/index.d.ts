import { Role } from '../generated/prisma';

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      id: string;
      email: string;
      role: Role;
      iat: number;
      exp: number;
    };
  }
}
