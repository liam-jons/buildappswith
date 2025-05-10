"use client";

import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/core/button";
import { useReducedMotion } from "framer-motion";

/**
 * Payment status types
 */
export type PaymentStatus = "idle" | "processing" | "success" | "error" | "pending";

/**
 * Payment status indicator component props
 */
interface PaymentStatusIndicatorProps {
  status: PaymentStatus;
  message?: string;
  showDetails?: boolean;
  retryHandler?: () => void;
  className?: string;
}

/**
 * Component for visualizing payment processing status
 * Provides visual feedback for different payment states
 * 
 * @version 1.0.111
 */
export function PaymentStatusIndicator({
  status,
  message,
  showDetails = false,
  retryHandler,
  className = "",
}: PaymentStatusIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showHelp, setShowHelp] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);
  
  // Update help visibility based on status
  useEffect(() => {
    if (status === "error" || status === "pending") {
      setShowHelp(true);
    } else {
      setShowHelp(false);
    }
  }, [status]);

  // Determine background color based on status
  const getBackgroundColor = () => {
    switch (status) {
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      case "processing":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800";
    }
  };

  // Get the appropriate icon component based on status
  const StatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "pending":
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case "processing":
        return (
          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Get the status title text
  const getStatusTitle = () => {
    switch (status) {
      case "success":
        return "Payment Successful";
      case "error":
        return "Payment Failed";
      case "pending":
        return "Payment Pending";
      case "processing":
        return "Processing Payment";
      default:
        return "Payment Status";
    }
  };

  // Get the detailed status message
  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case "success":
        return "Your payment was processed successfully.";
      case "error":
        return "We encountered an issue processing your payment.";
      case "pending":
        return "Your payment is pending authorization.";
      case "processing":
        return "Your payment is being processed. Please wait...";
      default:
        return "";
    }
  };

  // Main render
  return (
    <div className={`rounded-md p-4 border ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <StatusIcon />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {getStatusTitle()}
            
            {/* Help tooltip for error/pending states */}
            {showHelp && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 ml-1 text-muted-foreground hover:text-foreground"
                      aria-label="Payment help"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <span className="sr-only">Show payment help</span>
                      <span className="h-4 w-4 rounded-full bg-muted-foreground/20 inline-flex items-center justify-center text-xs">?</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {status === "error" 
                      ? "Don't worry! Your card has not been charged. You can try again or contact support."
                      : "Your payment is being processed by the bank. We'll notify you when it completes."}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h3>
          
          {/* Status message with expand/collapse for long messages */}
          <div className="mt-1 text-sm text-muted-foreground">
            {getStatusMessage().length > 120 && !expandedInfo
              ? `${getStatusMessage().substring(0, 115)}... `
              : getStatusMessage()}
            
            {getStatusMessage().length > 120 && (
              <button
                className="text-xs underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setExpandedInfo(!expandedInfo)}
              >
                {expandedInfo ? "Show less" : "Read more"}
              </button>
            )}
          </div>
          
          {/* Retry button for error state */}
          {status === "error" && retryHandler && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  retryHandler();
                }}
                className="text-xs"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {/* Loading animation for processing state */}
          {status === "processing" && (
            <div className="mt-2 h-1.5 w-full bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "5%" }}
                animate={
                  shouldReduceMotion
                    ? { width: "50%" }
                    : { width: ["5%", "30%", "50%", "70%", "90%"] }
                }
                transition={{
                  duration: 3,
                  times: [0, 0.1, 0.3, 0.6, 0.9],
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
