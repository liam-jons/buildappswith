# Authentication and Booking Integration

This document outlines the implementation of the standardized authentication routes and their integration with the booking flow system.

## Auth Route Structure

The authentication system has been standardized to use consistent routes:

- `/(auth)/sign-in/[[...sign-in]]` - Primary sign-in route
- `/(auth)/sign-up/[[...sign-up]]` - Primary sign-up route

Old routes (`/sign-in` and `/sign-up`) are redirected to the new ones via middleware.

Duplicated routes in the `(auth)` directory have been removed to provide a single source of truth for authentication flows.

## Middleware Configuration

The middleware has been updated to correctly handle public and protected routes:

```typescript
// Public routes configuration
const publicRoutes = [
  "/",
  // Both old and new paths need to be public
  "/sign-in",
  "/sign-in/(.*)",
  "/sign-up",
  "/sign-up/(.*)",
  "/(auth)/sign-in",
  "/(auth)/sign-in/(.*)",
  "/(auth)/sign-up",
  "/(auth)/sign-up/(.*)",
  "/sso-callback",
  "/verify",
  // API routes
  "/api/auth/(.+)",
  "/api/webhook/(.+)",
  "/api/marketplace/builders",
  "/api/marketplace/featured",
  "/api/marketplace/filters",
  "/api/timeline/(.+)",
  // Marketing and content pages
  "/toolkit",
  "/how-it-works",
  "/weekly-sessions",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  // Marketplace routes
  "/marketplace",
  "/marketplace/(.*)",
  "/marketplace/builders",
  "/marketplace/builders/(.*)",
  // Other public routes
  "/builder-profile/(.+)",
  "/auth-test",
];
```

The middleware is configured to:
1. Make marketplace routes publicly accessible
2. Protect booking and user-specific actions
3. Use standard Clerk auth configuration for optimal security

## Integrated Booking Component

The new `IntegratedBooking` component provides a unified booking experience:

```tsx
<IntegratedBooking
  builderId={profile.id}
  sessionTypes={profile.sessionTypes || []}
  className="gap-1.5"
>
  <CalendarIcon className="h-4 w-4" />
  Schedule
</IntegratedBooking>
```

This component:
1. Checks authentication status before proceeding
2. Redirects unauthenticated users to sign-in with a return URL
3. Opens a booking dialog for authenticated users
4. Maintains proper state during the booking process

## Authentication Flow

The booking flow integrates with authentication in the following ways:

1. **Public Browsing**: Users can browse marketplace and builder profiles without authentication
2. **Protected Booking**: When a user clicks "Book a Session", authentication is required
3. **Return URL**: The sign-in page captures the return URL and redirects back after authentication
4. **Seamless Continuation**: After authentication, users continue exactly where they left off

### Implementation Details

The booking flow checks authentication status using the Clerk auth hook:

```tsx
const { isSignedIn, isLoaded } = useAuth();

// Handle booking button click
const handleBookingClick = () => {
  if (!isLoaded) return;

  if (!isSignedIn) {
    // Redirect to sign-in with return URL
    const returnUrl = `/marketplace/builders/${builderId}`;
    // Use standard path - middleware will handle redirection to /(auth)/sign-in
    window.location.href = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
    return;
  }

  // Open booking dialog if authenticated
  setIsOpen(true);
};
```

The middleware handles redirection from old auth routes to new ones:

```typescript
// In middleware.ts
afterAuth(auth, req, evt) {
  // Standard auth handling
  if (!auth.userId && !auth.isPublicRoute) {
    const signInUrl = new URL('/(auth)/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    evt.redirectTo(signInUrl);
    return;
  }

  // Special case for old auth routes
  const url = new URL(req.url);
  const path = url.pathname;

  // Redirect old auth routes to new ones under /(auth)
  if (path === '/sign-in') {
    const params = new URLSearchParams(url.search);
    const newUrl = new URL('/(auth)/sign-in', req.url);

    // Copy all query parameters
    params.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });

    evt.redirectTo(newUrl);
  }
}
```

## Dashboard Visibility

The dashboard component has been enhanced with:

1. **Improved Error Handling**: Comprehensive error catching and feedback
2. **Role Detection**: Better handling of user roles and primary role determination
3. **Helpful Default State**: Clear guidance for users without roles
4. **Debug Information**: Additional information in development mode for troubleshooting

The `getUserRoles` function has also been enhanced to:

1. Automatically fix users with empty role arrays
2. Provide detailed diagnostic information for debugging
3. Ensure proper role prioritization for users with multiple roles

## Testing

The integration between auth and booking can be tested with the integration tests in:
- `__tests__/integration/auth-marketplace/booking-integration.test.tsx`

This tests:
1. Proper redirects for unauthenticated users
2. Booking flow display for authenticated users
3. Return URL handling after authentication

## Best Practices

1. **Always Check Authentication**: Use `isSignedIn` before initiating protected actions
2. **Preserve Context**: Use return URLs to maintain user context through authentication
3. **Handle Edge Cases**: Ensure proper error handling for authentication failures
4. **Role-Based Content**: Show appropriate content based on user roles
5. **Clean Routes**: Maintain a single source of truth for authentication routes

## Future Improvements

1. Enhance return URL handling with state management
2. Improve user onboarding by capturing booking intent during sign-up
3. Add role-specific onboarding flows after authentication
4. Implement JWT session recovery for interrupted booking flows