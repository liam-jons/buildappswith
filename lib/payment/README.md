# Payment Domain

This directory contains the business logic for the payment system in the Buildappswith platform.

## Purpose

The payment domain handles all aspects of payment processing, including:

- Checkout session creation
- Payment status tracking
- Refund processing
- Invoicing and receipts
- Stripe integration

## Directory Structure

```
/payment
├── actions.ts       # Server-side actions for payment processing
├── api.ts           # Client-side API functions for payment operations
├── schemas.ts       # Zod validation schemas for payment data
├── types.ts         # TypeScript type definitions for payment entities
├── utils.ts         # Utility functions specific to payment processing
└── index.ts         # Barrel exports for simplified imports
```

## Integration Points

The payment domain integrates with:

- **Stripe API**: For payment processing
- **Scheduling Domain**: For booking information
- **Profile Domain**: For user payment information
- **Webhooks**: For payment event processing

## Usage

Import payment domain utilities and types:

```typescript
import { createCheckoutSession, getPaymentStatus } from "@/lib/payment";
import type { PaymentStatus, CheckoutSessionParams } from "@/lib/payment/types";
```

## Server Actions

The `actions.ts` file contains server-side functions for payment processing:

- `createCheckoutSession`: Create a new checkout session
- `retrieveCheckoutSession`: Get details of an existing session
- `cancelPayment`: Cancel a pending payment
- `refundPayment`: Process a refund

## API Functions

The `api.ts` file contains client-side functions for interacting with payment APIs:

- `initiateCheckout`: Start the checkout process
- `verifyPaymentStatus`: Check the status of a payment
- `getPaymentHistory`: Retrieve payment history

## Validation

The `schemas.ts` file contains Zod validation schemas for payment data:

- `checkoutSessionSchema`: Validates checkout session parameters
- `paymentStatusSchema`: Validates payment status updates
- `refundRequestSchema`: Validates refund requests

## Types

The `types.ts` file defines TypeScript types for payment entities:

- `PaymentStatus`: Enum for payment statuses
- `CheckoutSessionParams`: Parameters for creating a checkout session
- `PaymentResult`: Result of a payment operation
- `RefundRequest`: Request parameters for a refund

## Utilities

The `utils.ts` file contains utility functions for payment processing:

- `formatCurrency`: Format currency values with appropriate symbols
- `calculateTax`: Calculate tax based on location and amount
- `calculateSessionExpiry`: Determine expiration time for a checkout session
