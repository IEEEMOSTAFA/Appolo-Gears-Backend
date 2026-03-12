import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';
import { PAYMENT_MESSAGES } from './payment.constant';

// ─── Create Payment Intent ────────────────────────────────────────────────────
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { rentId } = req.body;
  const userId = (req as any).user.id;

  const result = await PaymentService.createPaymentIntent({ rentId, userId });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: PAYMENT_MESSAGES.INTENT_CREATED,
    data: result,
  });
});

// ─── Confirm Payment ──────────────────────────────────────────────────────────
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { rentId, transactionId } = req.body;

  const result = await PaymentService.confirmPayment({ rentId, transactionId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: PAYMENT_MESSAGES.PAYMENT_CONFIRMED,
    data: result,
  });
});

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
// Note: This route MUST use express.raw() middleware (see payment.route.ts)
const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  await PaymentService.handleWebhook(req.body as Buffer, signature);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: PAYMENT_MESSAGES.WEBHOOK_RECEIVED,
    data: null,
  });
});

// ─── Get Payment by Rent ID ───────────────────────────────────────────────────
const getPaymentByRentId = catchAsync(async (req: Request, res: Response) => {
  const { rentId } = req.params as { rentId: string };
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  const result = await PaymentService.getPaymentByRentId(rentId, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: PAYMENT_MESSAGES.PAYMENT_FETCHED,
    data: result,
  });
});

// ─── Get Payment by ID ────────────────────────────────────────────────────────
const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  const result = await PaymentService.getPaymentById(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: PAYMENT_MESSAGES.PAYMENT_FETCHED,
    data: result,
  });
});

// ─── Get All Payments (Admin) ─────────────────────────────────────────────────
const getAllPayments = catchAsync(async (_req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: PAYMENT_MESSAGES.ALL_PAYMENTS_FETCHED,
    data: result,
  });
});

// ─── Get My Payments (authenticated User) ─────────────────────────────────────
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const result = await PaymentService.getMyPayments(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: PAYMENT_MESSAGES.ALL_PAYMENTS_FETCHED,
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getPaymentByRentId,
  getPaymentById,
  getAllPayments,
  getMyPayments,
};