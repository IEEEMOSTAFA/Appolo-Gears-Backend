import { z } from 'zod';

const BidStatusEnum = z.enum(['pending', 'accepted', 'rejected']);

const createBidValidationSchema = z.object({
  body: z.object({
    bidAmount: z
      .number({ error: 'Bid amount is required' })
      .positive('Bid amount must be a positive number'),
    driverLocation: z
      .string({ error: 'Driver location is required' })
      .min(1, 'Driver location cannot be empty'),
    rentId: z
      .string({ error: 'Rent ID is required' })
      .uuid('Rent ID must be a valid UUID'),
  }),
});

const updateBidValidationSchema = z.object({
  body: z.object({
    bidStatus: BidStatusEnum,
  }),
});

export const BidValidation = {
  createBidValidationSchema,
  updateBidValidationSchema,
};