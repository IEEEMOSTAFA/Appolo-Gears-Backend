import { Role } from '../../generated/prisma';

export interface TUser {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  role: Role;
  profileImage?: string | null;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
