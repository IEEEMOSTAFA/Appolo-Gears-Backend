import { z } from 'zod';

const FuelTypeEnum = z.enum(['Octane', 'Hybrid', 'Electric', 'Diesel', 'Petrol']);
const ConditionEnum = z.enum(['New', 'Used']);

const createCarValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    image: z.string(),
    fuelType: FuelTypeEnum,
    passengerCapacity: z.number(),
    color: z.string(),
    condition: ConditionEnum,
  }),
});

const updateCarValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    image: z.string().optional(),
    fuelType: FuelTypeEnum.optional(),
    passengerCapacity: z.number().optional(),
    color: z.string().optional(),
    condition: ConditionEnum.optional(),
    rating: z.number().optional(),
  }),
});

export const CarValidation = {
  createCarValidationSchema,
  updateCarValidationSchema,
};
