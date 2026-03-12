import { z } from 'zod';

const FuelTypeEnum = z.enum(['Octane', 'Hybrid', 'Electric', 'Diesel', 'Petrol']);
const ConditionEnum = z.enum(['New', 'Used']);

const createCarValidationSchema = z.object({
  body: z.object({
    name: z.string({ error: 'Car name is required' }).min(1, 'Car name cannot be empty'),
    brand: z.string({ error: 'Brand is required' }).min(1, 'Brand cannot be empty'),
    model: z.string({ error: 'Model is required' }).min(1, 'Model cannot be empty'),
    image: z.string({ error: 'Image URL is required' }).url('Image must be a valid URL'),
    fuelType: FuelTypeEnum,
    passengerCapacity: z
      .number({ error: 'Passenger capacity is required' })
      .int('Passenger capacity must be an integer')
      .positive('Passenger capacity must be a positive number'),
    color: z.string({ error: 'Color is required' }).min(1, 'Color cannot be empty'),
    condition: ConditionEnum,
  }),
});

const updateCarValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Car name cannot be empty').optional(),
    brand: z.string().min(1, 'Brand cannot be empty').optional(),
    model: z.string().min(1, 'Model cannot be empty').optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    fuelType: FuelTypeEnum.optional(),
    passengerCapacity: z
      .number()
      .int('Passenger capacity must be an integer')
      .positive('Passenger capacity must be a positive number')
      .optional(),
    color: z.string().min(1, 'Color cannot be empty').optional(),
    condition: ConditionEnum.optional(),
    rating: z.number().min(0, 'Rating cannot be negative').max(5, 'Rating cannot exceed 5').optional(),
  }),
});

export const CarValidation = {
  createCarValidationSchema,
  updateCarValidationSchema,
};
