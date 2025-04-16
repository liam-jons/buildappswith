# Auth0 Integration Guide for Buildappswith

This document outlines how to set up, configure, and use Auth0 authentication in the Buildappswith platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Process](#setup-process)
3. [Environment Variables](#environment-variables)
4. [Testing Authentication](#testing-authentication)
5. [Auth0 Dashboard Configuration](#auth0-dashboard-configuration)
6. [User Roles and Permissions](#user-roles-and-permissions)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- An Auth0 account (free tier is sufficient for development)
- A Buildappswith development environment set up
- Node.js and npm/pnpm installed

## Setup Process

### 1. Create Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications > Applications**
3. Click **Create Application**
4. Enter "Buildappswith" as the name
5. Select "Regular Web Applications"
6. Click **Create**

### 2. Configure Auth0 Application Settings

In your new Auth0 application settings:

1. Under **Application Properties**, note your Client ID and Client Secret
2. Under **Application URIs**, set:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback` (for development)
   - Allowed Logout URLs: `http://localhost:3000` (for development)
   - Allowed Web Origins: `http://localhost:3000` (for development)

### 3. Set Up Environment Variables

Run our helper script to create a template `.env.local` file:

```bash
pnpm auth0:setup
```

Then fill in the values in `.env.local` with your Auth0 application details:

```
# Auth0 Configuration
AUTH0_SECRET=a_long_random_string_for_cookie_encryption
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://{YOUR_AUTH0_DOMAIN}.auth0.com
AUTH0_CLIENT_ID={YOUR_CLIENT_ID}
AUTH0_CLIENT_SECRET={YOUR_CLIENT_SECRET}
```

### 4. Verify Configuration

Run the validation script to check your Auth0 configuration:

```bash
pnpm auth0:validate
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| AUTH0_SECRET | Yes | A long, random string used to encrypt cookies |
| AUTH0_BASE_URL | Yes | The base URL of your application |
| AUTH0_ISSUER_BASE_URL | Yes | Your Auth0 domain URL |
| AUTH0_CLIENT_ID | Yes | Your Auth0 application client ID |
| AUTH0_CLIENT_SECRET | Yes | Your Auth0 application client secret |
| AUTH0_SCOPE | No | The scopes to request (default: "openid profile email") |
| AUTH0_AUDIENCE | No | The audience for your API |
| AUTH0_ORGANIZATION_ID | No | The ID of your Auth0 organization (if using) |

## Testing Authentication

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to any platform page that requires authentication

3. You should be redirected to the Auth0 login page

4. After successful login, you'll be redirected back to your application

## Auth0 Dashboard Configuration

### User Management

In the Auth0 Dashboard:

1. Navigate to **User Management > Users** to view registered users
2. You can manually create test users
3. Review user details and login history

### Rules and Actions

You can set up custom rules or actions in Auth0 to:

- Add custom claims to tokens
- Implement custom login flows
- Enforce multi-factor authentication
- Integrate with external services

## User Roles and Permissions

Buildappswith uses three main roles:

1. **Client**: Users looking to commission apps
2. **Builder**: Verified developers who can build apps
3. **Learner**: Users learning AI and app development skills

### Assigning Roles

1. In Auth0 Dashboard, go to **User Management > Roles**
2. Create roles for "client", "builder", and "learner"
3. Assign roles to users through **User Management > Users**

### Using Roles in the Application

You can check for user roles using the `hasRole` utility:

```typescript
import { hasRole } from '@/lib/auth-utils';

// In a server component
const user = await checkAuthServer();
if (hasRole(user, 'builder')) {
  // Show builder-specific content
}

// In a client component
const { user } = useUser();
if (user && hasRole(user, 'client')) {
  // Show client-specific UI
}
```

## Troubleshooting

### Common Issues

1. **Invalid client_id error**: 
   - Verify your AUTH0_CLIENT_ID matches what's in the Auth0 dashboard

2. **Invalid redirect_uri error**:
   - Check that your callback URLs in Auth0 dashboard match your application's URL

3. **Token validation errors**:
   - Ensure AUTH0_ISSUER_BASE_URL is correct and includes the https:// prefix

### Checking Configuration

Run the configuration checker to verify your setup:

```bash
pnpm auth0:check
```

### Debug Mode

To enable more detailed debugging, add this to your `.env.local`:

```
AUTH0_DEBUG=true
```

### Support Resources

- [Auth0 Next.js SDK Documentation](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Auth0 Community Forums](https://community.auth0.com/)
- Buildappswith internal documentation in the `/docs` directory

## Production Deployment

For production environments:

1. Update your Auth0 application URIs with production URLs
2. Set up proper environment variables in your hosting provider
3. Consider using Auth0's custom domains for a seamless login experience
4. Implement appropriate security headers and cookie policies

---

For questions or issues with this integration, please contact the Buildappswith team.