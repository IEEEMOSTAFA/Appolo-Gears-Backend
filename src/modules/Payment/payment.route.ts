import express, { Router } from 'express';
import { PaymentController } from './payment.controller';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  getPaymentByRentSchema,
  getPaymentByIdSchema,
} from './payment.validation';

const router = Router();


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC - Stripe Webhook (MUST use raw body, NO auth)
// Register this BEFORE any json() middleware in your app.ts
// ─────────────────────────────────────────────────────────────────────────────
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.stripeWebhook
);

// ─────────────────────────────────────────────────────────────────────────────
// USER Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/payments/create-intent  → user initiates payment (gets clientSecret)
router.post(
    "/create-intent",
    auth("user"),
    validateRequest(createPaymentIntentSchema),
    PaymentController.createPaymentIntent
);

// POST /api/payments/confirm  → user confirms after Stripe frontend success
router.post(
    "/confirm",
    auth("user"),
    validateRequest(confirmPaymentSchema),
    PaymentController.confirmPayment
);

// GET /api/payments/my-payments  → user sees their own payments
router.get(
    "/my-payments",
    auth("user"),
    PaymentController.getMyPayments
);

// GET /api/payments/rent/:rentId  → user/admin gets payment by rentId
router.get(
    "/rent/:rentId",
    auth("user", "admin"),
    validateRequest(getPaymentByRentSchema),
    PaymentController.getPaymentByRentId
);

// GET /api/payments/:id  → user/admin gets payment by paymentId
router.get(
    "/:id",
    auth("user", "admin"),
    validateRequest(getPaymentByIdSchema),
    PaymentController.getPaymentById
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/payments  → admin sees all payments
router.get(
    "/",
    auth("admin"),
    PaymentController.getAllPayments
);

export const PaymentRoutes = router;