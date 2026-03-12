import { z } from "zod";

export const createPaymentIntentSchema = z.object({
    body: z.object({
        rentId: z.string().uuid({ message: "Invalid rent ID" }),
    }),
});

export const confirmPaymentSchema = z.object({
    body: z.object({
        rentId: z.string().uuid({ message: "Invalid rent ID" }),
        transactionId: z.string().min(1, { message: "Transaction ID is required" }),
    }),
});

export const getPaymentByRentSchema = z.object({
    params: z.object({
        rentId: z.string().uuid({ message: "Invalid rent ID" }),
    }),
});

export const getPaymentByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: "Invalid payment ID" }),
    }),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;