import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import { TRentFilters, TRentQueryOptions } from './rent.interface';
import { rentSearchableFields } from './rent.constant';
import AppError from '../../errors/AppError';

const createRentIntoDB = async (userId: string, payload: { startingPoint: string; destination: string; carId: string }) => {
  // Check if the car exists and is not deleted
  const car = await prisma.car.findUnique({
    where: { id: payload.carId, isDeleted: false },
  });

  if (!car) {
    throw new AppError('Car not found', httpStatus.NOT_FOUND);
  }

  const result = await prisma.rent.create({
    data: {
      startingPoint: payload.startingPoint,
      destination: payload.destination,
      userId,
      carId: payload.carId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      car: true,
    },
  });

  return result;
};

const getAllRentsFromDB = async (
  filters: TRentFilters,
  options: TRentQueryOptions
) => {
  const { searchTerm, ...filterData } = filters;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  // Search across startingPoint, destination
  if (searchTerm) {
    andConditions.push({
      OR: rentSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })),
    });
  }

  // Exact-match filters (rentStatus, userId, carId)
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => ({ [key]: value }));

    if (filterConditions.length > 0) {
      andConditions.push(...filterConditions);
    }
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.rent.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      car: true,
      bids: {
        include: {
          driver: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
  });

  const total = await prisma.rent.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleRentFromDB = async (id: string) => {
  const result = await prisma.rent.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      car: true,
      bids: {
        include: {
          driver: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError('Rent not found', httpStatus.NOT_FOUND);
  }

  return result;
};

import { RentStatus } from '../../generated/prisma';

const updateRentIntoDB = async (
  id: string,
  payload: { rentStatus?: RentStatus; startingPoint?: string; destination?: string }
) => {
  // Check rent exists
  const rent = await prisma.rent.findUnique({ where: { id } });

  if (!rent) {
    throw new AppError('Rent not found', httpStatus.NOT_FOUND);
  }

  const result = await prisma.rent.update({
    where: { id },
    data: payload,
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      car: true,
    },
  });

  return result;
};

const deleteRentFromDB = async (id: string) => {
  // Check rent exists
  const rent = await prisma.rent.findUnique({ where: { id } });

  if (!rent) {
    throw new AppError('Rent not found', httpStatus.NOT_FOUND);
  }

  const result = await prisma.rent.delete({
    where: { id },
  });

  return result;
};

export const RentService = {
  createRentIntoDB,
  getAllRentsFromDB,
  getSingleRentFromDB,
  updateRentIntoDB,
  deleteRentFromDB,
};