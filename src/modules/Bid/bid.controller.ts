import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BidService } from './bid.service';
import { bidFilterableFields } from './bid.constant';
import { TBidFilters, TBidQueryOptions } from './bid.interface';

const createBid = catchAsync(async (req: Request, res: Response) => {
  // driverId from auth context
  const driverId = (req as any).user.id;
  const result = await BidService.createBidIntoDB(driverId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bid placed successfully',
    data: result,
  });
});

const getAllBids = catchAsync(async (req: Request, res: Response) => {
  const filters: TBidFilters = {};
  bidFilterableFields.forEach((key) => {
    if (req.query[key] !== undefined) {
      (filters as any)[key] = req.query[key];
    }
  });

  const options: TBidQueryOptions = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await BidService.getAllBidsFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bids fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleBid = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await BidService.getSingleBidFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bid fetched successfully',
    data: result,
  });
});

const updateBid = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  
  // NOTE: According to PRD, user can accept bid. Handled in the service.
  const result = await BidService.updateBidStatusIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bid status updated successfully',
    data: result,
  });
});

const deleteBid = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await BidService.deleteBidFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bid deleted successfully',
    data: result,
  });
});

export const BidController = {
  createBid,
  getAllBids,
  getSingleBid,
  updateBid,
  deleteBid,
};