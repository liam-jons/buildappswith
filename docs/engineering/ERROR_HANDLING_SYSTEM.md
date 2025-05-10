# ERROR HANDLING SYSTEM DOCUMENTATION

## `metadata:schema-version:1.0`
## `metadata:compatibility:buildappswith@1.0.0+`
## `metadata:categories:error-handling,sentry,monitoring,logging`

---

## Core Error Handling Patterns

### Pattern: Standard Error Handling with Classification

```typescript
/**
 * @pattern standard-error-handling
 * @description Capture errors with classification metadata
 * @context server-component | client-component | api-route
 */
import { handleError, ErrorSeverity, ErrorCategory } from '@/lib/sentry';

try {
  // Operation that might fail
  await performRiskyOperation();
} catch (error) {
  // Capture with rich classification
  handleError(error as Error, "Failed to perform operation", {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.BUSINESS,
    component: 'payment',
    userImpact: 'blocking',
    affectedFeature: 'checkout',
    isRecoverable: true,
    retryable: true,
  });
  
  // Respond appropriately
  return createErrorResponse(error);
}
```

#### Function Signature
```typescript
function handleError(
  error: Error,
  message?: string,
  metadata?: Partial<ErrorMetadata>
): string;

interface ErrorMetadata {
  severity: ErrorSeverity;
  category: ErrorCategory;
  source: ErrorSource;
  component: string;
  userImpact: UserImpactLevel;
  affectedFeature: string;
  isRecoverable: boolean;
  retryable: boolean;
}

enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

enum ErrorCategory {
  SYSTEM = 'system',
  BUSINESS = 'business',
  USER = 'user',
  INTEGRATION = 'integration',
}

type ErrorSource = 'client' | 'server' | 'edge' | 'external';

type UserImpactLevel = 'blocking' | 'degraded' | 'minimal' | 'none';
```

---

### Pattern: Domain-Specific Error Handling

```typescript
/**
 * @pattern domain-error-handling
 * @description Create and use domain-specific error handlers
 * @context domain-specific-module
 */
import { createDomainErrorHandler } from '@/lib/sentry';

// Create domain-specific error handler
const paymentErrorHandler = createDomainErrorHandler('payment', {
  // Default metadata for all payment errors
  category: ErrorCategory.BUSINESS,
  affectedFeature: 'checkout',
  isRecoverable: true,
});

// In your business logic
export async function processPayment(paymentDetails) {
  try {
    // Payment processing logic
    return await stripeClient.processPayment(paymentDetails);
  } catch (error) {
    if (error.type === 'StripeCardError') {
      // Handle card errors with domain handler
      paymentErrorHandler.handleError(error, "Card payment failed", {
        severity: ErrorSeverity.HIGH,
        userImpact: 'blocking',
        retryable: true,
      });
      
      return { success: false, error: 'card_declined' };
    } else {
      // Handle other errors with domain handler
      paymentErrorHandler.handleError(error, "Payment processing failed", {
        severity: ErrorSeverity.CRITICAL,
        userImpact: 'blocking',
        retryable: false,
      });
      
      return { success: false, error: 'processing_error' };
    }
  }
}
```

#### Function Signature
```typescript
function createDomainErrorHandler(
  component: string,
  defaultMetadata: Partial<ErrorMetadata> = {}
): {
  handleError: (error: Error, message?: string, metadata?: Partial<ErrorMetadata>) => string;
  reportError: (message: string, metadata?: Partial<ErrorMetadata>) => string;
};
```

---

### Pattern: Error Factory for Common Scenarios

```typescript
/**
 * @pattern error-factory
 * @description Use error metadata factory for common error scenarios
 * @context repeated-error-patterns
 */
import { handleError, errorMetadataFactory } from '@/lib/sentry';

// Authentication error handling
try {
  await authenticateUser(credentials);
} catch (error) {
  // Using pre-defined error metadata for login failures
  handleError(error as Error, "Login authentication failed", 
    errorMetadataFactory.auth.loginFailure()
  );
  return { success: false, message: "Authentication failed" };
}

// Payment error handling
try {
  await processPayment(paymentDetails);
} catch (error) {
  if (error.code === 'card_declined') {
    // Using pre-defined error metadata for card processing
    handleError(error as Error, "Payment card declined", 
      errorMetadataFactory.payment.processingFailure()
    );
    return { success: false, message: "Card declined" };
  } else if (error.code === 'stripe_error') {
    // Using pre-defined error metadata for Stripe integration errors
    handleError(error as Error, "Stripe integration error", 
      errorMetadataFactory.payment.stripeError()
    );
    return { success: false, message: "Payment service unavailable" };
  }
}
```

---

## Error Boundary Components

### Pattern: Global Error Boundary

```tsx
/**
 * @pattern global-error-boundary
 * @description Application-wide error capture with fallback UI
 * @context app-root | layout-component
 */
import { GlobalErrorBoundary } from '@/components/error-boundaries';

function AppRoot() {
  return (
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  );
}

// With custom fallback
function AppRoot() {
  return (
    <GlobalErrorBoundary
      fallback={
        <div className="error-container">
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      }
    >
      <App />
    </GlobalErrorBoundary>
  );
}
```

#### Type Definition
```typescript
interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

---

### Pattern: Feature Error Boundary

```tsx
/**
 * @pattern feature-error-boundary
 * @description Component-level error isolation for features
 * @context feature-component
 */
import { FeatureErrorBoundary } from '@/components/error-boundaries';

function CheckoutPage() {
  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      {/* Payment section with error boundary */}
      <FeatureErrorBoundary 
        name="Payment" 
        showReset={true}
        onError={(error, errorInfo) => {
          // Custom error handling logic
          notifyTeam("Payment component crashed", { error, errorInfo });
        }}
      >
        <PaymentForm />
      </FeatureErrorBoundary>
      
      {/* Shipping section with error boundary */}
      <FeatureErrorBoundary name="Shipping">
        <ShippingForm />
      </FeatureErrorBoundary>
    </div>
  );
}
```

#### Type Definition
```typescript
interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  name: string;
  fallback?: React.ReactNode;
  showReset?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

---

### Pattern: API Error Boundary

```tsx
/**
 * @pattern api-error-boundary
 * @description Data fetching error handling with retry capabilities
 * @context data-fetching-component
 */
import { ApiErrorBoundary } from '@/components/error-boundaries';

function UserProfile({ userId }) {
  return (
    <ApiErrorBoundary 
      apiName="UserProfileData"
      fallback={({ error, reset, eventId }) => (
        <div className="error-state">
          <p>Unable to load profile data.</p>
          <p className="error-message">{error.message}</p>
          <button onClick={reset}>Retry</button>
          <small>Reference: {eventId}</small>
        </div>
      )}
    >
      {({ isLoading, isError, error, setLoading, setError }) => {
        // Custom data fetching logic
        const { data, loading, error: fetchError } = useFetchUser(userId);
        
        // Update error boundary state
        useEffect(() => {
          setLoading(loading);
          if (fetchError) setError(fetchError);
        }, [loading, fetchError, setLoading, setError]);
        
        if (loading) return <Spinner />;
        
        return <UserProfileCard data={data} />;
      }}
    </ApiErrorBoundary>
  );
}
```

#### Type Definition
```typescript
interface ApiErrorBoundaryProps {
  children: (props: ApiErrorBoundaryAPI) => React.ReactNode;
  fallback?: (props: ApiErrorFallbackProps) => React.ReactNode;
  apiName: string;
}

interface ApiErrorBoundaryAPI {
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  reset: () => void;
  setError: (error: Error) => void;
  setLoading: (isLoading: boolean) => void;
}

interface ApiErrorFallbackProps {
  error: Error;
  reset: () => void;
  eventId: string | null;
}
```

---

## Performance Monitoring Patterns

### Pattern: Transaction Monitoring

```typescript
/**
 * @pattern transaction-monitoring
 * @description Monitor performance of critical user flows
 * @context performance-critical-operations
 */
import { createTransaction } from '@/lib/sentry/performance';

export async function checkoutFlow(cart, paymentDetails) {
  // Create a transaction for the entire checkout flow
  const transaction = createTransaction({
    name: 'checkout.process',
    op: 'checkout',
    description: 'Process checkout from cart to confirmation',
    tags: {
      cartSize: String(cart.items.length),
      paymentMethod: paymentDetails.method,
    },
  });
  
  try {
    // Step 1: Validate cart
    const cartSpan = transaction.startChild({
      op: 'validation',
      description: 'Validate cart contents',
    });
    
    await validateCart(cart);
    cartSpan.finish();
    
    // Step 2: Process payment
    const paymentSpan = transaction.startChild({
      op: 'payment',
      description: 'Process payment',
    });
    
    const paymentResult = await processPayment(paymentDetails);
    paymentSpan.finish();
    
    // Step 3: Create order
    const orderSpan = transaction.startChild({
      op: 'order_creation',
      description: 'Create order record',
    });
    
    const order = await createOrder(cart, paymentResult.transactionId);
    orderSpan.finish();
    
    // Mark transaction as successful
    transaction.setStatus('ok');
    transaction.finish();
    
    return { success: true, orderId: order.id };
  } catch (error) {
    // Mark transaction as failed
    transaction.setStatus('internal_error');
    transaction.setTag('error', 'true');
    transaction.setData('error.message', error.message);
    transaction.finish();
    
    // Re-throw or handle error
    throw error;
  }
}
```

#### Function Signature
```typescript
interface TransactionOptions {
  name: string;
  op?: string;
  description?: string;
  tags?: Record<string, string>;
  data?: Record<string, any>;
  sampled?: boolean;
}

function createTransaction(options: TransactionOptions): Transaction;

interface Transaction {
  startChild(options: {
    op?: string;
    description?: string;
    data?: Record<string, any>;
  }): Span;
  setTag(key: string, value: string): this;
  setData(key: string, value: any): this;
  setStatus(status: 'ok' | 'cancelled' | 'unknown' | 'invalid' | 'internal_error'): this;
  finish(endTimestamp?: number): void;
}

interface Span {
  setTag(key: string, value: string): this;
  setData(key: string, value: any): this;
  setStatus(status: 'ok' | 'cancelled' | 'unknown' | 'invalid' | 'internal_error'): this;
  finish(endTimestamp?: number): void;
}
```

---

### Pattern: Monitor Async Operation Performance

```typescript
/**
 * @pattern monitor-async-performance
 * @description Simplified performance monitoring for async operations
 * @context async-functions
 */
import { monitorPerformance } from '@/lib/sentry/performance';

// Using monitorPerformance with API call
export async function fetchUsers(filters) {
  return await monitorPerformance(
    'api.users.list',
    async () => {
      // Fetch users from database
      const users = await db.users.findMany(filters);
      return users;
    },
    { 
      op: 'db.query',
      tags: { 
        filters: JSON.stringify(filters),
      }
    }
  );
}

// Using monitorPerformance with server-side operations
export async function GET(request: Request) {
  return await monitorServerOperation(
    'api.products.list',
    async () => {
      const products = await fetchProductsFromDatabase();
      
      // Add server timing headers
      const response = NextResponse.json(products);
      return addServerTimingHeaders(response, {
        'db-query': queryTime,
        'total': performance.now() - startTime
      });
    },
    {
      tags: {
        route: '/api/products'
      }
    }
  );
}
```

#### Function Signature
```typescript
function monitorPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  options?: Omit<TransactionOptions, 'name'>
): Promise<T>;

function monitorServerOperation<T>(
  name: string,
  operation: () => Promise<T>,
  options?: Omit<TransactionOptions, 'name'>
): Promise<T>;

function addServerTimingHeaders(
  response: Response,
  metrics: Record<string, number>
): Response;
```

---

### Pattern: Component Performance Measurement

```tsx
/**
 * @pattern component-performance
 * @description Measure React component rendering performance
 * @context react-components
 */
import { useMeasureComponent, measureComponentPerformance } from '@/lib/sentry/performance';

// Using the performance measurement hook
function ExpensiveComponent({ data }) {
  // Automatically measure component rendering
  useMeasureComponent('ExpensiveComponent');
  
  // Component implementation
  return (
    <div className="expensive-component">
      {/* Component content */}
    </div>
  );
}

// Using performance measurement for data loading
function DataLoadingComponent({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Measure data loading performance
    measureComponentPerformance(
      'DataLoadingComponent.fetchData',
      async () => {
        const result = await fetchDataById(id);
        setData(result);
      },
      { component: 'DataLoadingComponent' }
    );
  }, [id]);
  
  // Component implementation
  return data ? (
    <div className="data-component">
      {/* Render data */}
    </div>
  ) : <Spinner />;
}
```

#### Function Signature
```typescript
function useMeasureComponent(
  componentName: string,
  shouldMeasure?: boolean
): void;

function measureComponentPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T>;
```

---

## Enhanced Logging Patterns

### Pattern: Structured Logging with Sentry Integration

```typescript
/**
 * @pattern enhanced-logging
 * @description Structured logging with automatic Sentry integration
 * @context application-wide
 */
import { enhancedLogger, createDomainLogger } from '@/lib/enhanced-logger';

// Using the global logger
function userService(userId) {
  // Debug level (not sent to Sentry)
  enhancedLogger.debug("Fetching user profile", { userId });
  
  try {
    // Info level (not sent to Sentry)
    enhancedLogger.info("User profile retrieved", { 
      userId,
      timestamp: new Date().toISOString() 
    });
    
    return userProfile;
  } catch (error) {
    // Error level (automatically sent to Sentry)
    enhancedLogger.error("Failed to retrieve user profile", {
      userId,
      errorCode: "USER_NOT_FOUND"
    }, error);
    
    throw error;
  }
}

// Using domain-specific logger
const paymentLogger = createDomainLogger('payment', {
  service: 'stripe-integration'
});

function processPayment(paymentDetails) {
  paymentLogger.info("Processing payment", { 
    amount: paymentDetails.amount,
    currency: paymentDetails.currency
  });
  
  try {
    // Process payment logic
    
    paymentLogger.info("Payment processed successfully", {
      transactionId: result.id
    });
    
    return result;
  } catch (error) {
    // Automatically includes domain context
    paymentLogger.error("Payment processing failed", {
      errorCode: error.code
    }, error);
    
    throw error;
  }
}
```

#### Function Signature
```typescript
interface LogMetadata {
  [key: string]: any;
}

interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

class EnhancedLogger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
  logError(code: string, message: string, metadata?: LogMetadata, error?: Error): void;
  exception(error: Error, message?: string, metadata?: LogMetadata): void;
  child(context: LogMetadata): EnhancedLogger;
}

function createDomainLogger(domain: string, defaultMetadata?: LogMetadata): EnhancedLogger;
```

---

### Pattern: Error Types and Coding

```typescript
/**
 * @pattern error-coding
 * @description Error type categorization with error codes
 * @context error-handling
 */
import { enhancedLogger } from '@/lib/enhanced-logger';

// Define error codes
const ERROR_CODES = {
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    SESSION_EXPIRED: 'AUTH_002',
    INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  },
  PAYMENT: {
    CARD_DECLINED: 'PAYMENT_001',
    INSUFFICIENT_FUNDS: 'PAYMENT_002',
    INVALID_CARD: 'PAYMENT_003',
  }
};

// Use specific error codes
try {
  const result = await authenticateUser(credentials);
  if (!result.success) {
    switch (result.reason) {
      case 'invalid_credentials':
        enhancedLogger.logError(
          ERROR_CODES.AUTH.INVALID_CREDENTIALS,
          "Invalid credentials provided",
          { username: credentials.username },
          new Error("Authentication failed: Invalid credentials")
        );
        break;
      case 'session_expired':
        enhancedLogger.logError(
          ERROR_CODES.AUTH.SESSION_EXPIRED,
          "User session has expired",
          { sessionId: credentials.sessionId },
          new Error("Authentication failed: Session expired")
        );
        break;
      default:
        enhancedLogger.logError(
          'AUTH_999',
          "Unknown authentication error",
          { reason: result.reason },
          new Error("Authentication failed: Unknown reason")
        );
    }
    
    throw new AuthenticationError(result.reason);
  }
} catch (error) {
  // Re-throw or handle appropriately
  throw error;
}
```

---

## Edge Cases and Advanced Patterns

### Pattern: Handling Nested Errors

```typescript
/**
 * @pattern nested-errors
 * @description Handle errors from nested operations with context preservation
 * @context complex-operations
 */
import { handleError, ErrorSeverity, ErrorCategory } from '@/lib/sentry';

async function processUserData(userId) {
  try {
    // Attempt to retrieve user data
    const user = await fetchUserProfile(userId);
    
    // Process data in transaction
    return await processUserTransaction(user);
  } catch (error) {
    // Check if this is already a handled error from nested call
    if (error.sentryEventId) {
      // Error was already reported to Sentry, just add additional context
      Sentry.configureScope(scope => {
        scope.setContext('parent_operation', {
          function: 'processUserData',
          userId
        });
      });
      
      // No need to report again
      throw error;
    }
    
    // New error that needs reporting
    const eventId = handleError(error, "Failed to process user data", {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.BUSINESS,
      component: 'user-management',
      userImpact: 'blocking',
    });
    
    // Attach Sentry event ID to aid in debugging
    error.sentryEventId = eventId;
    throw error;
  }
}

async function processUserTransaction(user) {
  try {
    // Process transaction logic
    return await db.transaction(async () => {
      // Complex operations
    });
  } catch (error) {
    // Report with more specific context
    const eventId = handleError(error, "Transaction processing failed", {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.SYSTEM,
      component: 'database',
      userImpact: 'blocking',
      affectedFeature: 'user-transactions',
    });
    
    // Attach Sentry event ID
    error.sentryEventId = eventId;
    throw error;
  }
}
```

---

### Pattern: Rate Limiting Error Reports

```typescript
/**
 * @pattern rate-limit-errors
 * @description Prevent flooding Sentry with duplicate errors
 * @context high-volume-operations
 */
import { handleError, ErrorSeverity, ErrorCategory } from '@/lib/sentry';

// Simple in-memory error cache
const errorCache = new Map();
const ERROR_CACHE_TTL = 60 * 1000; // 1 minute TTL
const ERROR_THRESHOLD = 5; // Max reports per minute

function reportRateLimitedError(error, message, metadata) {
  // Create a cache key based on error message and type
  const cacheKey = `${error.name}:${error.message}`;
  
  // Check if we've seen this error recently
  const now = Date.now();
  const cachedError = errorCache.get(cacheKey);
  
  if (cachedError) {
    // Update count and check threshold
    cachedError.count++;
    cachedError.lastSeen = now;
    
    // Only report if under threshold
    if (cachedError.count <= ERROR_THRESHOLD) {
      return handleError(error, message, {
        ...metadata,
        occurences: cachedError.count,
      });
    } else if (cachedError.count === ERROR_THRESHOLD + 1) {
      // Report one last time with rate limit notice
      return handleError(error, `${message} (rate limited)`, {
        ...metadata,
        occurences: cachedError.count,
        rateLimited: true,
      });
    }
    
    // Over threshold, don't report to Sentry
    return null;
  } else {
    // First time seeing this error
    errorCache.set(cacheKey, {
      count: 1,
      firstSeen: now,
      lastSeen: now,
    });
    
    // Clean up old entries
    cleanErrorCache();
    
    // Report to Sentry
    return handleError(error, message, metadata);
  }
}

function cleanErrorCache() {
  const now = Date.now();
  
  // Remove expired entries
  for (const [key, value] of errorCache.entries()) {
    if (now - value.lastSeen > ERROR_CACHE_TTL) {
      errorCache.delete(key);
    }
  }
}
```

---

### Pattern: User Context in React Components

```tsx
/**
 * @pattern react-user-context
 * @description Configure Sentry with user context in React apps
 * @context react-components
 */
import { useSentryUser } from '@/lib/sentry/user-context';
import { useAuth } from '@/lib/auth';

// Create a component to configure Sentry at app root
function SentryUserProvider({ children }) {
  const { isSignedIn, user, session } = useAuth();
  
  // Set up Sentry user context whenever auth state changes
  useSentryUser({ isSignedIn, user, session });
  
  return <>{children}</>;
}

// Usage in app
function App() {
  return (
    <AuthProvider>
      <SentryUserProvider>
        <AppContent />
      </SentryUserProvider>
    </AuthProvider>
  );
}
```

---

## Integration Examples

### Pattern: Integrate with Forms

```tsx
/**
 * @pattern form-error-integration
 * @description Integrate error handling with form submissions
 * @context form-components
 */
import { handleError, errorMetadataFactory } from '@/lib/sentry';
import { useForm } from 'react-hook-form';

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    try {
      // Submit form data
      const result = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!result.ok) {
        // Parse error response
        const errorData = await result.json();
        
        // Create appropriate error
        const error = new Error(errorData.message || 'Form submission failed');
        error.status = result.status;
        error.code = errorData.code;
        
        // Report to Sentry with form context (excluding sensitive data)
        handleError(error, "Contact form submission failed", {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.USER,
          component: 'contact-form',
          userImpact: 'minimal',
          affectedFeature: 'contact',
          source: 'client',
          // Include safe form context
          formData: {
            subject: data.subject,
            formLength: data.message?.length || 0,
          },
        });
        
        throw error;
      }
      
      // Success handling
      return await result.json();
    } catch (error) {
      // Re-throw for component handling
      throw error;
    }
  };
  
  return (
    <ApiErrorBoundary apiName="ContactForm">
      {({ setError }) => (
        <form onSubmit={handleSubmit(data => {
          onSubmit(data).catch(error => setError(error));
        })}>
          {/* Form fields */}
        </form>
      )}
    </ApiErrorBoundary>
  );
}
```

---

### Pattern: Backend API Error Handling

```typescript
/**
 * @pattern api-error-handling
 * @description Standardized API error handling with Sentry
 * @context api-routes
 */
import { handleError, ErrorSeverity, ErrorCategory } from '@/lib/sentry';
import { configureSentryUserContextFromRequest } from '@/lib/sentry/user-context';

export async function GET(request: Request) {
  // Configure user context from request
  configureSentryUserContextFromRequest(request);
  
  try {
    // Fetch data
    const data = await fetchData();
    
    // Return successful response
    return Response.json({ success: true, data });
  } catch (error) {
    // Determine HTTP status and error code
    let status = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    
    if (error.name === 'NotFoundError') {
      status = 404;
      code = 'NOT_FOUND';
    } else if (error.name === 'ValidationError') {
      status = 400;
      code = 'VALIDATION_ERROR';
    }
    
    // Report to Sentry
    handleError(error, `API Error: ${code}`, {
      severity: status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      category: status >= 500 ? ErrorCategory.SYSTEM : ErrorCategory.USER,
      component: 'api',
      userImpact: status >= 500 ? 'blocking' : 'minimal',
      source: 'server',
      // Include request context
      request: {
        method: request.method,
        url: request.url,
        headers: {
          'content-type': request.headers.get('content-type'),
          'user-agent': request.headers.get('user-agent'),
        },
      },
    });
    
    // Return error response
    return Response.json({
      success: false,
      error: {
        code,
        message: status >= 500 
          ? 'An unexpected error occurred'
          : error.message
      }
    }, { status });
  }
}
```