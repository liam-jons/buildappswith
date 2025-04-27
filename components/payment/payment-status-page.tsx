"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatusIndicator } from "./payment-status-indicator";
import { getCheckoutSession } from "@/lib/stripe/stripe-client";
import { logger } from "@/lib/logger";
import { CheckCircle, XCircle, Clock, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

/**
 * Payment status page component
 * Displays detailed payment status information and allows users to view their booking
 * 
 * @version 1.0.111
 */
export function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");
  const [session, setSession] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);

  // Fetch session data when component mounts or session ID changes
  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("No session ID provided");
      return;
    }

    // Fetch initial session data
    fetchSessionData();

    // Set up polling for pending payments (every 3 seconds, max 20 times)
    const intervalId = setInterval(() => {
      if (status === "pending" && pollingCount < 20) {
        fetchSessionData();
        setPollingCount(prev => prev + 1);
      } else {
        clearInterval(intervalId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [sessionId, status, pollingCount]);

  // Function to fetch session data from the API
  const fetchSessionData = async () => {
    try {
      logger.info("Fetching checkout session status", { sessionId });
      
      const response = await getCheckoutSession(sessionId as string);
      
      if (!response.success) {
        setStatus("error");
        setError(response.message || "Failed to retrieve session data");
        return;
      }
      
      const sessionData = response.data;
      setSession(sessionData);
      
      // Extract booking details from metadata
      if (sessionData.metadata) {
        setBookingDetails({
          id: sessionData.metadata.bookingId,
          builderId: sessionData.metadata.builderId,
          sessionTypeId: sessionData.metadata.sessionTypeId,
          startTime: sessionData.metadata.startTime,
          endTime: sessionData.metadata.endTime,
        });
      }
      
      // Set status based on payment status
      if (sessionData.status === "complete" && sessionData.paymentStatus === "paid") {
        setStatus("success");
      } else if (sessionData.status === "expired" || sessionData.paymentStatus === "unpaid") {
        setStatus("error");
        setError("Payment was not completed");
      } else {
        setStatus("pending");
      }
      
      logger.info("Payment status updated", {
        sessionId,
        status: sessionData.status,
        paymentStatus: sessionData.paymentStatus,
      });
    } catch (error) {
      logger.error("Error fetching session data", {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      setStatus("error");
      setError("Failed to retrieve payment information");
    }
  };

  // Navigate to booking details
  const viewBooking = () => {
    if (bookingDetails?.id) {
      router.push(`/bookings/${bookingDetails.id}`);
    }
  };

  // Try payment again
  const tryAgain = () => {
    router.push(`/builders/${bookingDetails?.builderId || 'featured'}`);
  };

  // Return to home page
  const goHome = () => {
    router.push("/");
  };

  // Calculate formatted date if available
  const getFormattedDate = () => {
    if (!bookingDetails?.startTime) return "";
    
    try {
      return format(new Date(bookingDetails.startTime), "MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Payment Status</CardTitle>
          <CardDescription className="text-center">
            {status === "loading" 
              ? "Checking your payment status..." 
              : status === "success"
              ? "Your payment has been processed successfully"
              : status === "pending"
              ? "Your payment is being processed"
              : "There was an issue with your payment"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status indicator */}
          <PaymentStatusIndicator 
            status={status} 
            message={error || undefined} 
            showDetails 
          />
          
          {/* Session details (if available) */}
          {session && (
            <div className="rounded-md border p-4 space-y-4">
              <h3 className="font-medium">Session Details</h3>
              
              {bookingDetails?.startTime && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{getFormattedDate()}</span>
                </div>
              )}
              
              {session.amountTotal && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: session.currency || 'USD',
                    }).format(session.amountTotal / 100)}
                  </span>
                </div>
              )}
              
              {session.paymentStatus && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium">
                    {session.paymentStatus.charAt(0).toUpperCase() + session.paymentStatus.slice(1)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Success animation */}
          {status === "success" && (
            <motion.div 
              className="flex justify-center py-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>
          )}
          
          {/* Error animation */}
          {status === "error" && (
            <motion.div 
              className="flex justify-center py-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </motion.div>
          )}
          
          {/* Pending animation */}
          {status === "pending" && (
            <motion.div 
              className="flex justify-center py-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="rounded-full bg-blue-100 dark:bg-blue-900 p-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4 flex-wrap">
          {status === "success" && (
            <Button onClick={viewBooking} className="gap-2">
              View Booking
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          
          {status === "error" && (
            <Button onClick={tryAgain} variant="default">
              Try Again
            </Button>
          )}
          
          <Button onClick={goHome} variant="outline">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
