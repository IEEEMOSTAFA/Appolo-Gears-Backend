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
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TCarFilters = {
  searchTerm?: string;
  fuelType?: FuelType;
  condition?: Condition;
  color?: string;
  brand?: string;
};

export type TCarQueryOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
