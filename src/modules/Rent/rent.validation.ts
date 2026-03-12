import { z } from 'zod';

const RentStatusEnum = z.enum(['pending', 'ongoing', 'completed']);

const createRentValidationSchema = z.object({
  body: z.object({
    startingPoint: z.string({ error: 'Starting point is required' }).min(1, 'Starting point cannot be empty'),
    destination: z.string({ error: 'Destination is required' }).min(1, 'Destination cannot be empty'),
    carId: z.string({ error: 'Car ID is required' }).uuid('Car ID must be a valid UUID'),
  }),
});

const updateRentValidationSchema = z.object({
  body: z.object({
    rentStatus: RentStatusEnum.optional(),
    startingPoint: z.string().min(1, 'Starting point cannot be empty').optional(),
    destination: z.string().min(1, 'Destination cannot be empty').optional(),
  }),
});

export const RentValidation = {
  createRentValidationSchema,
  updateRentValidationSchema,
};