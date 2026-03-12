import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RentService } from './rent.service';
import { rentFilterableFields } from './rent.constant';
import { TRentFilters, TRentQueryOptions } from './rent.interface';

const createRent = catchAsync(async (req: Request, res: Response) => {
  // userId comes from the auth middleware (decoded JWT)
  const userId = (req as any).user.id;
  const result = await RentService.createRentIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rent request created successfully',
    data: result,
  });
});

const getAllRents = catchAsync(async (req: Request, res: Response) => {
  // Pick only allowed filter keys from query
  const filters: TRentFilters = {};
  rentFilterableFields.forEach((key) => {
    if (req.query[key] !== undefined) {
      (filters as any)[key] = req.query[key];
    }
  });

  // Pick pagination options
  const options: TRentQueryOptions = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await RentService.getAllRentsFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rents fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleRent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await RentService.getSingleRentFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rent fetched successfully',
    data: result,
  });
});

const updateRent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await RentService.updateRentIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rent updated successfully',
    data: result,
  });
});

const deleteRent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await RentService.deleteRentFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rent deleted successfully',
    data: result,
  });
});

export const RentController = {
  createRent,
  getAllRents,
  getSingleRent,
  updateRent,
  deleteRent,
};