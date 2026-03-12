import { RentStatus } from '../../generated/prisma';

export type TRent = {
  id: string;
  rentStatus: RentStatus;
  startingPoint: string;
  destination: string;
  userId: string;
  carId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TRentFilters = {
  searchTerm?: string;
  rentStatus?: RentStatus;
  userId?: string;
  carId?: string;
};

export type TRentQueryOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};