import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import { TBidFilters, TBidQueryOptions } from './bid.interface';
import { bidSearchableFields } from './bid.constant';
import AppError from '../../errors/AppError';
import { BidStatus, RentStatus } from '../../generated/prisma';

const createBidIntoDB = async (
  driverId: string,
  payload: { bidAmount: number; driverLocation: string; rentId: string }
) => {
  // Check if rent exists and is pending
  const rent = await prisma.rent.findUnique({
    where: { id: payload.rentId },
  });

  if (!rent) {
    throw new AppError('Rent not found', httpStatus.NOT_FOUND);
  }

  if (rent.rentStatus !== RentStatus.pending) {
    throw new AppError(
      'Bids can only be placed on pending rents',
      httpStatus.BAD_REQUEST
    );
  }

  const result = await prisma.bid.create({
    data: {
      ...payload,
      driverId,
    },
    include: {
      driver: {
        select: { id: true, name: true, email: true, rating: true },
      },
      rent: true,
    },
  });

  return result;
};

const getAllBidsFromDB = async (
  filters: TBidFilters,
  options: TBidQueryOptions
) => {
  const { searchTerm, ...filterData } = filters;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: bidSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => ({ [key]: value }));

    if (filterConditions.length > 0) {
      andConditions.push(...filterConditions);
    }
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.bid.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      driver: {
        select: { id: true, name: true, email: true, rating: true },
      },
      rent: true,
    },
  });

  const total = await prisma.bid.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleBidFromDB = async (id: string) => {
  const result = await prisma.bid.findUnique({
    where: { id },
    include: {
      driver: {
        select: { id: true, name: true, email: true, rating: true },
      },
      rent: true,
    },
  });

  if (!result) {
    throw new AppError('Bid not found', httpStatus.NOT_FOUND);
  }

  return result;
};

const updateBidStatusIntoDB = async (id: string, payload: { bidStatus: BidStatus }) => {
  const bid = await prisma.bid.findUnique({
    where: { id },
    include: { rent: true },
  });

  if (!bid) {
    throw new AppError('Bid not found', httpStatus.NOT_FOUND);
  }

  if (bid.bidStatus === BidStatus.accepted) {
    throw new AppError('This bid has already been accepted', httpStatus.BAD_REQUEST);
  }

  // If accepting the bid
  if (payload.bidStatus === BidStatus.accepted) {
    if (bid.rent.rentStatus !== RentStatus.pending) {
       throw new AppError(
         'This rent request has already been processed',
         httpStatus.BAD_REQUEST
       );
    }

    // Accept this bid, reject others, and mark rent as ongoing (all in a transaction)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the accepted bid
      const acceptedBid = await tx.bid.update({
        where: { id },
        data: { bidStatus: BidStatus.accepted },
      });

      // 2. Reject all other bids for this rent
      await tx.bid.updateMany({
        where: { 
          rentId: bid.rentId,
          id: { not: id }
        },
        data: { bidStatus: BidStatus.rejected },
      });

      // 3. Mark the rent as ongoing
      await tx.rent.update({
        where: { id: bid.rentId },
        data: { rentStatus: RentStatus.ongoing },
      });

      return acceptedBid;
    });

    return result;
  }

  // If just rejecting the bid
  const result = await prisma.bid.update({
    where: { id },
    data: { bidStatus: payload.bidStatus },
  });

  return result;
};

const deleteBidFromDB = async (id: string) => {
  const bid = await prisma.bid.findUnique({ where: { id } });

  if (!bid) {
    throw new AppError('Bid not found', httpStatus.NOT_FOUND);
  }

  const result = await prisma.bid.delete({
    where: { id },
  });

  return result;
};

export const BidService = {
  createBidIntoDB,
  getAllBidsFromDB,
  getSingleBidFromDB,
  updateBidStatusIntoDB,
  deleteBidFromDB,
};