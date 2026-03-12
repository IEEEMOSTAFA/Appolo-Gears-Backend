export const PAYMENT_GATEWAY = {
    STRIPE: "stripe",
} as const;

export const STRIPE_CURRENCY = "usd";

export const PAYMENT_MESSAGES = {
    INTENT_CREATED: "Payment intent created successfully",
    PAYMENT_CONFIRMED: "Payment confirmed successfully",
    PAYMENT_FAILED: "Payment failed",
    PAYMENT_NOT_FOUND: "Payment not found",
    RENT_NOT_FOUND: "Rent not found",
    BID_NOT_ACCEPTED: "No accepted bid found for this rent",
    ALREADY_PAID: "This rent has already been paid",
    INVALID_AMOUNT: "Invalid payment amount",
    WEBHOOK_RECEIVED: "Webhook received successfully",
    UNAUTHORIZED: "You are not authorized to make this payment",
    PAYMENT_FETCHED: "Payment retrieved successfully",
    ALL_PAYMENTS_FETCHED: "All payments retrieved successfully",
} as const;

export const STRIPE_WEBHOOK_EVENTS = {
    PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded",
    PAYMENT_INTENT_FAILED: "payment_intent.payment_failed",
    PAYMENT_INTENT_CREATED: "payment_intent.created",
} as const;