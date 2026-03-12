// PaymentStatus is defined here locally for now.
// Once `npx prisma generate` is run it will be auto-generated.
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface ICreatePaymentIntent {
    rentId: string;
    userId: string;
}

export interface IConfirmPayment {
    rentId: string;
    transactionId: string;
}

export interface IPaymentResponse {
    id: string;
    amount: number;
    transactionId: string | null;
    paymentGateway: string;
    status: PaymentStatus;
    rentId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStripePaymentIntent {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
}

export interface IWebhookEvent {
    type: string;
    data: {
        object: {
            id: string;
            status: string;
            metadata?: Record<string, string>;
        };
    };
}