import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CarService } from './car.service';
import { carFilterableFields } from './car.constant';
import { TCarFilters, TCarQueryOptions } from './car.interface';

const createCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.createCarIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Car created successfully',
    data: result,
  });
});

const getAllCars = catchAsync(async (req: Request, res: Response) => {
  // Pick only allowed filter keys from query
  const filters: TCarFilters = {};
  carFilterableFields.forEach((key) => {
    if (req.query[key] !== undefined) {
      (filters as any)[key] = req.query[key];
    }
  });

  // Pick pagination options
  const options: TCarQueryOptions = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await CarService.getAllCarsFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cars fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CarService.getSingleCarFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Car fetched successfully',
    data: result,
  });
});

const updateCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CarService.updateCarIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Car updated successfully',
    data: result,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CarService.deleteCarFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Car deleted successfully',
    data: result,
  });
});

export const CarController = {
  createCar,
  getAllCars,
  getSingleCar,
  updateCar,
  deleteCar,
};
