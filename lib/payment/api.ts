/**
 * Client-side API functions for payment operations
 */

import { CheckoutSessionParams, PaymentClientResult, PaymentClientErrorType } from "./types";

/**
 * Initiates the checkout process for a booking
 * 
 * @param params The checkout session parameters
 * @returns The checkout session details with URL for redirection
 */
export async function initiateCheckout(
  params: CheckoutSessionParams
): Promise<PaymentClientResult<{ sessionId: string; url: string }>> {
  try {
    const response = await fetch("/api/payment/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to create checkout session",
        error: {
          type: PaymentClientErrorType.CHECKOUT,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to create checkout session",
        error: {
          type: PaymentClientErrorType.CHECKOUT,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Checkout session created successfully",
      data: {
        sessionId: data.data.id,
        url: data.data.url,
      },
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      message: "Failed to create checkout session",
      error: {
        type: PaymentClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Verifies the status of a payment
 * 
 * @param sessionId The checkout session ID
 * @returns The payment status details
 */
export async function verifyPaymentStatus(
  sessionId: string
): Promise<PaymentClientResult<{ status: string; bookingId?: string }>> {
  try {
    const response = await fetch(`/api/payment/sessions/${sessionId}`);

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to verify payment status",
        error: {
          type: PaymentClientErrorType.VERIFICATION,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to verify payment status",
        error: {
          type: PaymentClientErrorType.VERIFICATION,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Payment status verified successfully",
      data: {
        status: data.data.payment_status,
        bookingId: data.data.metadata?.bookingId,
      },
    };
  } catch (error) {
    console.error("Error verifying payment status:", error);
    return {
      success: false,
      message: "Failed to verify payment status",
      error: {
        type: PaymentClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Retrieves payment history for the current user
 * 
 * @returns List of payment transactions
 */
export async function getPaymentHistory(): Promise<PaymentClientResult<any[]>> {
  try {
    const response = await fetch("/api/payment/history");

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to retrieve payment history",
        error: {
          type: PaymentClientErrorType.RETRIEVAL,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to retrieve payment history",
        error: {
          type: PaymentClientErrorType.RETRIEVAL,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Payment history retrieved successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error retrieving payment history:", error);
    return {
      success: false,
      message: "Failed to retrieve payment history",
      error: {
        type: PaymentClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Requests a refund for a completed payment
 * 
 * @param paymentIntentId The payment intent ID to refund
 * @param amount Optional amount to refund (refunds entire payment if omitted)
 * @returns Refund result
 */
export async function requestRefund(
  paymentIntentId: string,
  amount?: number
): Promise<PaymentClientResult<any>> {
  try {
    const response = await fetch("/api/payment/refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentIntentId,
        amount,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to process refund request",
        error: {
          type: PaymentClientErrorType.REFUND,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to process refund request",
        error: {
          type: PaymentClientErrorType.REFUND,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Refund processed successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    return {
      success: false,
      message: "Failed to process refund",
      error: {
        type: PaymentClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Completes a booking with payment
 * 
 * @param params Booking parameters with payment details
 * @returns Checkout URL for completing payment
 */
export async function completeBookingWithPayment(
  params: {
    bookingId: string;
    sessionTypeId: string;
    returnUrl: string;
  }
): Promise<PaymentClientResult<{ redirectUrl: string }>> {
  try {
    // First create the booking
    const bookingResponse = await fetch("/api/scheduling/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionTypeId: params.sessionTypeId,
        // Additional booking parameters would go here
      }),
    });

    if (!bookingResponse.ok) {
      return {
        success: false,
        message: "Failed to create booking",
        error: {
          type: PaymentClientErrorType.BOOKING,
          detail: `Server responded with ${bookingResponse.status}`,
        },
      };
    }

    const bookingData = await bookingResponse.json();

    if (!bookingData.success) {
      return {
        success: false,
        message: bookingData.message || "Failed to create booking",
        error: {
          type: PaymentClientErrorType.BOOKING,
          detail: bookingData.error?.detail || "Unknown error",
        },
      };
    }

    // Then create the checkout session
    const bookingId = bookingData.data.id;
    const checkoutResult = await initiateCheckout({
      bookingId,
      sessionTypeId: params.sessionTypeId,
      returnUrl: params.returnUrl,
    });

    if (!checkoutResult.success) {
      return checkoutResult;
    }

    return {
      success: true,
      message: "Booking created and checkout initiated",
      data: {
        redirectUrl: checkoutResult.data?.url || '',
      },
    };
  } catch (error) {
    console.error("Error completing booking with payment:", error);
    return {
      success: false,
      message: "Failed to complete booking with payment",
      error: {
        type: PaymentClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
