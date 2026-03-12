import Stripe from 'stripe';
import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import config from '../../config';
import AppError from '../../errors/AppError';
import { RentStatus, BidStatus } from '../../generated/prisma';
import {
  ICreatePaymentIntent,
  IConfirmPayment,
  IStripePaymentIntent,
} from './payment.interface';
import {
  STRIPE_CURRENCY,
  STRIPE_WEBHOOK_EVENTS,
  PAYMENT_MESSAGES,
} from './payment.constant';

// ─── Stripe instance ──────────────────────────────────────────────────────────
const stripe = new Stripe(config.stripe_secret_key as string);

// ─── Payment model helper (works before & after prisma generate) ──────────────
// Using (prisma as any).payment until `npx prisma generate` adds Payment model
const db = prisma as any;

// ─── Create Payment Intent ────────────────────────────────────────────────────
const createPaymentIntent = async (
  payload: ICreatePaymentIntent
): Promise<IStripePaymentIntent> => {
  const { rentId, userId } = payload;

  // 1. Verify rent exists and belongs to the user
  const rent = await prisma.rent.findUnique({
    where: { id: rentId },
    include: {
      bids: { where: { bidStatus: BidStatus.accepted } },
    },
  });

  if (!rent) {
    throw new AppError(PAYMENT_MESSAGES.RENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (rent.userId !== userId) {
    throw new AppError(PAYMENT_MESSAGES.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  // 2. Only allow payment when rent is "ongoing" (bid accepted)
  if (rent.rentStatus !== RentStatus.ongoing) {
    throw new AppError(PAYMENT_MESSAGES.BID_NOT_ACCEPTED, httpStatus.BAD_REQUEST);
  }

  // 3. Check not already paid
  const existingPayment = await db.payment.findUnique({ where: { rentId } });
  if (existingPayment?.status === 'paid') {
    throw new AppError(PAYMENT_MESSAGES.ALREADY_PAID, httpStatus.BAD_REQUEST);
  }

  // 4. Get the accepted bid amount
  const acceptedBid = rent.bids[0];
  if (!acceptedBid) {
    throw new AppError(PAYMENT_MESSAGES.BID_NOT_ACCEPTED, httpStatus.BAD_REQUEST);
  }

  const amountInCents = Math.round(acceptedBid.bidAmount * 100); // Stripe uses cents

  // 5. Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: STRIPE_CURRENCY,
    metadata: { rentId, userId, bidId: acceptedBid.id },
  });

  // 6. Upsert Payment record in DB as pending
  await db.payment.upsert({
    where: { rentId },
    create: {
      amount: acceptedBid.bidAmount,
      rentId,
      userId,
      status: 'pending',
      transactionId: paymentIntent.id,
    },
    update: {
      transactionId: paymentIntent.id,
      status: 'pending',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret as string,
    paymentIntentId: paymentIntent.id,
    amount: acceptedBid.bidAmount,
    currency: STRIPE_CURRENCY,
  };
};

// ─── Confirm Payment ──────────────────────────────────────────────────────────
const confirmPayment = async (payload: IConfirmPayment) => {
  const { rentId, transactionId } = payload;

  // Verify Stripe payment status server-side
  const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

  if (paymentIntent.status !== 'succeeded') {
    throw new AppError(PAYMENT_MESSAGES.PAYMENT_FAILED, httpStatus.BAD_REQUEST);
  }

  // Update payment and rent status in a single transaction
  const result = await prisma.$transaction(async (tx: any) => {
    const updatedPayment = await tx.payment.update({
      where: { rentId },
      data: { status: 'paid', transactionId },
    });

    await tx.rent.update({
      where: { id: rentId },
      data: {
        paymentStatus: 'paid',
        rentStatus: RentStatus.completed,
      },
    });

    return updatedPayment;
  });

  return result;
};

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
const handleWebhook = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret as string
    );
  } catch (err: any) {
    throw new AppError(
      `Webhook signature verification failed: ${err.message}`,
      httpStatus.BAD_REQUEST
    );
  }

  switch (event.type) {
    case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED: {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { rentId } = intent.metadata;
      if (rentId) {
        await prisma.$transaction(async (tx: any) => {
          await tx.payment.update({
            where: { rentId },
            data: { status: 'paid', transactionId: intent.id },
          });
          await tx.rent.update({
            where: { id: rentId },
            data: { paymentStatus: 'paid', rentStatus: RentStatus.completed },
          });
        });
      }
      break;
    }

    case STRIPE_WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED: {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { rentId } = intent.metadata;
      if (rentId) {
        await db.payment.updateMany({
          where: { rentId },
          data: { status: 'failed' },
        });
        await prisma.rent.update({
          where: { id: rentId },
          data: { paymentStatus: 'failed' },
        });
      }
      break;
    }

    default:
      break;
  }
};

// ─── Get Payment by Rent ID ───────────────────────────────────────────────────
const getPaymentByRentId = async (
  rentId: string,
  userId: string,
  userRole: string
) => {
  const payment = await db.payment.findUnique({
    where: { rentId },
    include: {
      rent: {
        include: {
          car: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(PAYMENT_MESSAGES.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (userRole !== 'admin' && payment.userId !== userId) {
    throw new AppError(PAYMENT_MESSAGES.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  return payment;
};

// ─── Get Payment by ID ────────────────────────────────────────────────────────
const getPaymentById = async (
  id: string,
  userId: string,
  userRole: string
) => {
  const payment = await db.payment.findUnique({
    where: { id },
    include: {
      rent: {
        include: {
          car: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(PAYMENT_MESSAGES.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (userRole !== 'admin' && payment.userId !== userId) {
    throw new AppError(PAYMENT_MESSAGES.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  return payment;
};

// ─── Get All Payments (Admin) ─────────────────────────────────────────────────
const getAllPayments = async () => {
  return db.payment.findMany({
    include: {
      rent: {
        include: {
          car: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ─── Get My Payments (User) ───────────────────────────────────────────────────
const getMyPayments = async (userId: string) => {
  return db.payment.findMany({
    where: { userId },
    include: {
      rent: { include: { car: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const PaymentService = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentByRentId,
  getPaymentById,
  getAllPayments,
  getMyPayments,
};