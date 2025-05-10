"use client";

import * as Sentry from "@sentry/nextjs";
import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/core/button";
import { Card } from "@/components/ui/core/card";
import { logger } from "@/lib/logger";
import { ErrorSeverity, ErrorCategory } from "@/lib/sentry";

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name: string;
  showReset?: boolean;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Feature-level error boundary for isolating errors to specific components
 * Designed to prevent entire application crashes when a feature fails
 * 
 * @example
 * <FeatureErrorBoundary name="UserProfile">
 *   <UserProfileComponent />
 * </FeatureErrorBoundary>
 */
export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capture error details
    this.setState({
      errorInfo,
    });

    // Log to console and Sentry
    logger.error(`Error in ${this.props.name} component:`, {
      error,
      errorInfo,
      component: this.props.name,
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.SYSTEM,
      affectedFeature: this.props.name,
    }, error);

    // Report to Sentry with component context
    const eventId = Sentry.withScope((scope) => {
      scope.setTag("feature", this.props.name);
      scope.setExtra("componentStack", errorInfo.componentStack);
      return Sentry.captureException(error);
    });

    this.setState({ eventId });

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });

    // Call onReset if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, eventId } = this.state;
    const { children, fallback, name, showReset = true } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <Card className="p-4 bg-muted/50 rounded-md border shadow-sm">
          <div className="space-y-2">
            <h3 className="text-base font-medium">
              Problem loading {name}
            </h3>
            <p className="text-sm text-muted-foreground">
              This feature encountered an error. Our team has been notified.
            </p>
            {error && process.env.NODE_ENV !== 'production' && (
              <div className="text-xs p-2 mt-2 bg-muted rounded overflow-auto max-h-[200px]">
                <p className="font-mono">{error.toString()}</p>
              </div>
            )}
            <div className="flex flex-col xs:flex-row gap-2 mt-4">
              {showReset && (
                <Button
                  size="sm"
                  onClick={this.resetError}
                  variant="default"
                >
                  Retry
                </Button>
              )}
              {eventId && (
                <Button
                  size="sm"
                  onClick={() => Sentry.showReportDialog({ eventId })}
                  variant="outline"
                >
                  Report Feedback
                </Button>
              )}
            </div>
          </div>
        </Card>
      );
    }

    return children;
  }
}

export default FeatureErrorBoundary;