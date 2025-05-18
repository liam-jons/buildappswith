# Clerk Authentication Best Practices

This document outlines the best practices for implementing Clerk authentication in Next.js applications, particularly with the App Router.

## Catch-All Route Pattern

Clerk recommends using catch-all routes for authentication pages to support all authentication flows:

```
/app/(auth)/sign-in/[[...sign-in]]/page.tsx
/app/(auth)/sign-up/[[...sign-up]]/page.tsx
```

This pattern allows Clerk to handle various authentication scenarios:
- Email and password authentication
- Social login providers
- Passwordless authentication
- Multi-factor authentication
- Email verification flows
- Password reset flows

## Implementation Details

### 1. Create Catch-All Route Pages

For sign-in:
```tsx
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
'use client';

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('returnUrl') || undefined;

  // Clerk appearance customization
  const appearance = {
    baseTheme: theme === "dark" ? dark : undefined,
    elements: {
      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
      card: "bg-background border border-border shadow-sm",
      // Additional theme elements...
    },
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn
        appearance={appearance}
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl={redirectUrl}
      />
    </div>
  );
}
```

For sign-up:
```tsx
// app/(auth)/sign-up/[[...sign-up]]/page.tsx
'use client';

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('returnUrl') || undefined;

  // Clerk appearance customization
  const appearance = {
    baseTheme: theme === "dark" ? dark : undefined,
    elements: {
      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
      card: "bg-background border border-border shadow-sm",
      // Additional theme elements...
    },
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp
        appearance={appearance}
        path="/sign-up"
        signInUrl="/sign-in"
        redirectUrl={redirectUrl}
      />
    </div>
  );
}
```

### 2. Configure Middleware

Properly configure middleware to handle authentication and public routes:

```typescript
import { authMiddleware } from "@clerk/nextjs";

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  // Auth routes with route groups (using Clerk's catch-all pattern)
  "/\\(auth\\)/sign-in",
  "/\\(auth\\)/sign-in/(.*)",
  "/\\(auth\\)/sign-up",
  "/\\(auth\\)/sign-up/(.*)",
  // Other auth-related paths
  "/sso-callback",
  "/verify",
  "/api/auth/(.+)",
  "/api/webhook/(.+)",
  // Public API endpoints
  "/api/marketplace/builders",
  "/api/timeline/(.+)",
  // Public pages
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  // Marketplace pages should be public
  "/marketplace",
  "/marketplace/(.*)",
];

// Routes where Clerk authentication doesn't run at all
const ignoredRoutes = [
  // Standard Clerk paths (we use route groups instead)
  "/sign-in(.*)",
  "/sign-up(.*)",
];

export default authMiddleware({
  publicRoutes,
  ignoredRoutes,
  // Use Clerk's default behavior with no customizations
  // This follows best practices for Clerk integration
});

// Recommended matcher configuration from Clerk documentation
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 3. Handle Return URLs

When redirecting unauthenticated users to sign in, include a return URL:

```typescript
// In components that require authentication
if (!isSignedIn) {
  try {
    // Create a return URL for after successful authentication
    const returnUrl = `/current/page/path`;

    // Use Clerk's catch-all route within the (auth) route group
    const signInPath = '/(auth)/sign-in';

    // Construct the URL with the returnUrl parameter
    const signInUrl = `${signInPath}?returnUrl=${encodeURIComponent(returnUrl)}`;

    // Redirect to the sign-in page
    window.location.href = signInUrl;
    return;
  } catch (error) {
    console.error('Error during auth redirect:', error);
    // Fallback to the base sign-in page
    window.location.href = '/(auth)/sign-in';
    return;
  }
}
```

### 4. Configure ClerkProvider

In addition to configuring middleware, you should also configure your ClerkProvider to handle route groups correctly:

```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function EnhancedClerkProvider({ children }) {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        // Other appearance settings...
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      // Configure routing paths to use route groups
      signInUrl="/(auth)/sign-in"
      signUpUrl="/(auth)/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
```

## Benefits of the Catch-All Route Pattern

- **Full Authentication Flow Support**: Handles all Clerk authentication scenarios
- **Better User Experience**: Seamless flow between different authentication steps
- **Reduced Code Duplication**: Leverages Clerk's pre-built components
- **Easier Maintenance**: Follows Clerk's recommended patterns
- **Better Error Handling**: Clerk manages authentication errors internally

## Common Pitfalls to Avoid

1. **Don't Use Custom Auth Pages**: Avoid creating custom pages that don't use the catch-all pattern (`[[...sign-in]]`)
2. **Don't Use Redirects in next.config.mjs**: Let Clerk handle redirects rather than implementing your own
3. **Don't Mix Auth Patterns**: Choose one approach (catch-all routes) and use it consistently
4. **Don't Customize Cookie Settings**: Use Clerk's default cookie behavior
5. **Don't Use Standard Paths in Components**: Use `/sign-in` in your Clerk components, not `/(auth)/sign-in`
6. **Don't Forget ignoredRoutes**: Add standard auth paths (`/sign-in`, `/sign-up`) to ignoredRoutes to prevent warnings

## Testing Authentication Flows

To test the authentication implementation:

1. Test sign-in with email/password
2. Test sign-up flow including verification
3. Test social authentication providers
4. Test redirects after authentication
5. Test protected route access
6. Test sign-out flow
7. Test booking authentication flow specifically:
   ```
   - Log out completely
   - Visit a builder profile and click "Schedule" to trigger a booking
   - Verify redirection to the sign-in page
   - Sign in with valid credentials
   - Verify redirection back to the builder profile
   - Verify booking dialog opens automatically
   ```

## Troubleshooting Common Issues

### 1. Redirect Loop Warning
If you see a warning like:
```
INFO: Clerk: The request to /sign-in is being redirected because there is no signed-in user, and the path is not included in `ignoredRoutes` or `publicRoutes`.
```

This means Clerk is trying to process a request to `/sign-in` when it should be ignored. Fix by adding `/sign-in(.*)` to your `ignoredRoutes` array in middleware.

### 2. Pages Hanging
If your auth pages hang and never load, check:
- The Clerk component's `path` prop should be set to `/sign-in` and `/sign-up`, not `/(auth)/sign-in`
- The ClerkProvider should have `signInUrl="/(auth)/sign-in"` and `signUpUrl="/(auth)/sign-up"`
- Make sure no redirects are configured in `next.config.mjs` that conflict with your auth routes

### 3. Auth Component Not Rendering
If the Clerk Sign-In/Sign-Up component doesn't render, check:
- Your NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set correctly in .env
- Your ClerkProvider is correctly wrapping your app
- The component is receiving the correct props (path, signInUrl/signUpUrl)

## References

- [Clerk Next.js App Router Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Middleware Reference](https://clerk.com/docs/references/nextjs/clerk-middleware)
- [Clerk Authentication Best Practices](https://clerk.com/docs/security/overview)
- [Next.js Route Groups Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)