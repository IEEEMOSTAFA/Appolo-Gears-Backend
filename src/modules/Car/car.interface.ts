import { FuelType, Condition } from '../../generated/prisma';

export interface TCar {
  id: string;
  name: string;
  brand: string;
  model: string;
  image: string;
  rating: number;
  fuelType: FuelType;
  passengerCapacity: number;
  color: string;
  condition: Condition;
  createdAt: Date;
  updatedAt: Date;
}
