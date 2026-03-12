import { BidStatus } from '../../generated/prisma';

export type TBid = {
  id: string;
  bidAmount: number;
  bidStatus: BidStatus;
  driverLocation: string;
  rentId: string;
  driverId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TBidFilters = {
  searchTerm?: string;
  bidStatus?: BidStatus;
  rentId?: string;
  driverId?: string;
};

export type TBidQueryOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};