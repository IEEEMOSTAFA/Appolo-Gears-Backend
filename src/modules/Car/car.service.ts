import { prisma } from '../../lib/prisma';
import { TCar } from './car.interface';
import { FuelType, Condition } from '../../generated/prisma';

const createCarIntoDB = async (payload: TCar) => {
  const result = await prisma.car.create({
    data: payload,
  });
  return result;
};

const getAllCarsFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, ...filterData } = query;

  const searchConditions = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm as string, mode: 'insensitive' as const } },
          { brand: { contains: searchTerm as string, mode: 'insensitive' as const } },
          { model: { contains: searchTerm as string, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const result = await prisma.car.findMany({
    where: {
      ...searchConditions,
      ...filterData,
    },
  });
  return result;
};

const getSingleCarFromDB = async (id: string) => {
  const result = await prisma.car.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateCarIntoDB = async (id: string, payload: Partial<TCar>) => {
  const result = await prisma.car.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteCarFromDB = async (id: string) => {
  const result = await prisma.car.delete({
    where: {
      id,
    },
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
