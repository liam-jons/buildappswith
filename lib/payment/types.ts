/**
 * TypeScript type definitions for payment entities
 */

/**
 * Payment status enum
 */
export enum PaymentStatus {
  UNPAID = "UNPAID",
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

/**
 * Payment error type enum for server-side errors
 */
export enum PaymentErrorType {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RESOURCE_ERROR = "RESOURCE_ERROR",
  STRIPE_ERROR = "STRIPE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Payment client error type enum for client-side errors
 */
export enum PaymentClientErrorType {
  INITIALIZATION = "INITIALIZATION_ERROR",
  NETWORK = "NETWORK_ERROR",
  CHECKOUT = "CHECKOUT_ERROR",
  VERIFICATION = "VERIFICATION_ERROR",
  RETRIEVAL = "RETRIEVAL_ERROR",
  REFUND = "REFUND_ERROR",
  BOOKING = "BOOKING_ERROR",
}

/**
 * Parameters for creating a checkout session
 */
export interface CheckoutSessionParams {
  bookingId: string;
  sessionTypeId: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

/**
 * Result of a payment operation
 */
export interface PaymentResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: PaymentErrorType | string;
    detail?: string;
    code?: string;
  };
}

/**
 * Result of a client-side payment operation
 */
export interface PaymentClientResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: PaymentClientErrorType;
    detail?: string;
  };
}

/**
 * Request parameters for a refund
 */
export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason?: "requested_by_customer" | "duplicate" | "fraudulent";
}

/**
 * Payment method type
 */
export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

/**
 * Payment history filter parameters
 */
export interface PaymentHistoryFilter {
  startDate?: string;
  endDate?: string;
  status?: PaymentStatus;
  limit?: number;
  offset?: number;
}

/**
 * Payment transaction record
 */
export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  refunds?: Array<{
    id: string;
    amount: number;
    reason?: string;
    status: string;
    createdAt: string;
  }>;
}

/**
 * Checkout session response
 */
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  expiresAt?: number;
}

/**
 * Invoice details
 */
export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  description?: string;
  items: Array<{
    amount: number;
    currency: string;
    description: string;
  }>;
  dueDate?: string;
  paidAt?: string;
  url?: string;
  createdAt: string;
}
