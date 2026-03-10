import { z } from 'zod';

const RoleEnum = z.enum(['admin', 'user', 'driver']);

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: RoleEnum.optional(),
    profileImage: z.string().optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    role: RoleEnum.optional(),
    profileImage: z.string().optional(),
    rating: z.number().optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
