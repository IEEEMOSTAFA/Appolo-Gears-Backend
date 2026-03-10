import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CarService } from './car.service';

const createCar = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.createCarIntoDB(req.body);

  sendResponse(res, {
    success: true,
    message: 'Car created successfully',
    data: result,
  });
});

const getAllCars = catchAsync(async (req: Request, res: Response) => {
  const result = await CarService.getAllCarsFromDB(req.query);

  sendResponse(res, {
    success: true,
    message: 'Cars fetched successfully',
    data: result,
  });
});

const getSingleCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CarService.getSingleCarFromDB(id);

  sendResponse(res, {
    success: true,
    message: 'Car fetched successfully',
    data: result,
  });
});

const updateCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CarService.updateCarIntoDB(id, req.body);

  sendResponse(res, {
    success: true,
    message: 'Car updated successfully',
    data: result,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await CarService.deleteCarFromDB(id);

  sendResponse(res, {
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
