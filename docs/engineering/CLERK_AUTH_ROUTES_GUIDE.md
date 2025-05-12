# Clerk Authentication Routes Guide

## Overview

This guide explains the standardized authentication routes implementation using Clerk in the BuildAppsWith platform.

## Standardized Routes

The platform now uses the following standardized authentication routes:

- `/sign-in` - For user login (replacing `/login` and `/signin`)
- `/sign-up` - For new user registration (replacing `/signup` and references to `/register`)

These routes conform to Clerk's recommended conventions and provide a more consistent user experience.

## Implementation Details

### 1. Route Structure

The routes are implemented using Next.js catch-all routes for proper handling by Clerk:

```
/app/sign-in/[[...sign-in]]/page.tsx
/app/sign-up/[[...sign-up]]/page.tsx
```

### 2. Environment Variables

Update your `.env.local` file with the following settings:

```
# Clerk Auth URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### 3. Middleware Configuration

The middleware configuration has been updated to include the new routes in the public routes array:

```typescript
export const publicRoutes = [
  // ...other routes
  "/sign-in",
  "/sign-in/(.*)",
  "/sign-up",
  "/sign-up/(.*)",
  // ...other routes
];
```

### 4. Redirects

The Next.js configuration includes redirects to maintain backward compatibility:

```javascript
async redirects() {
  return [
    // ...other redirects
    {
      source: '/login',
      destination: '/sign-in',
      permanent: true,
    },
    {
      source: '/signin',
      destination: '/sign-in',
      permanent: true,
    },
    {
      source: '/signup',
      destination: '/sign-up',
      permanent: true,
    },
    {
      source: '/register',
      destination: '/sign-up',
      permanent: true,
    },
    // ...other redirects
  ];
}
```

## Components

The authentication pages use Clerk's built-in components with our theme:

```tsx
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: 
        "bg-primary hover:bg-primary/90 text-primary-foreground",
      card: "bg-background border border-border shadow-sm",
      // ...other styling
    },
  }}
  routing="path"
  path="/sign-in"
  signUpUrl="/sign-up"
/>
```

## Testing the Implementation

When testing the authentication flow:

1. First clear any browser storage related to previous authentication
2. Access `/sign-in` or `/sign-up` directly
3. Verify that login and registration work as expected
4. Confirm that redirects from old URLs work correctly (e.g., `/login` → `/sign-in`)

## Troubleshooting

If components don't render:

1. Check that the clerk middleware is properly configured
2. Verify that the environment variables are set correctly
3. Ensure that the public routes in middleware include the catch-all patterns
4. Clear browser caches and restart the development server

For more information, consult the [Clerk documentation](https://clerk.com/docs).