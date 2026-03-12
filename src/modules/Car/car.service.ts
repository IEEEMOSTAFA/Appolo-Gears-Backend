import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import { TCar, TCarFilters, TCarQueryOptions } from './car.interface';
import { carSearchableFields } from './car.constant';
import AppError from '../../errors/AppError';

const createCarIntoDB = async (payload: TCar) => {
  const result = await prisma.car.create({
    data: payload,
  });
  return result;
};

const getAllCarsFromDB = async (
  filters: TCarFilters,
  options: TCarQueryOptions
) => {
  const { searchTerm, ...filterData } = filters;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const skip = (page - 1) * limit;

  // Build where conditions
  const andConditions: any[] = [{ isDeleted: false }];

  // Search across name, brand, model
  if (searchTerm) {
    andConditions.push({
      OR: carSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      })),
    });
  }

  // Exact-match filters (fuelType, condition, color, brand)
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => ({ [key]: value }));

    if (filterConditions.length > 0) {
      andConditions.push(...filterConditions);
    }
  }

  const whereConditions = { AND: andConditions };

  const result = await prisma.car.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.car.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleCarFromDB = async (id: string) => {
  const result = await prisma.car.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!result) {
    throw new AppError('Car not found', httpStatus.NOT_FOUND);
  }

  return result;
};

const updateCarIntoDB = async (id: string, payload: Partial<TCar>) => {
  // Check car exists and is not soft-deleted
  const car = await prisma.car.findUnique({
    where: { id, isDeleted: false },
  });

  if (!car) {
    throw new AppError('Car not found', httpStatus.NOT_FOUND);
  }

  const result = await prisma.car.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteCarFromDB = async (id: string) => {
  // Check car exists and is not already soft-deleted
  const car = await prisma.car.findUnique({
    where: { id, isDeleted: false },
  });

  if (!car) {
    throw new AppError('Car not found', httpStatus.NOT_FOUND);
  }

  // Soft delete
  const result = await prisma.car.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};

export const CarService = {
  createCarIntoDB,
  getAllCarsFromDB,
  getSingleCarFromDB,
  updateCarIntoDB,
  deleteCarFromDB,
};
