# Environment Variables Reference

*Version: 1.0.0*  
*Last Updated: May 5, 2025*

This document provides a comprehensive reference for all environment variables used in the Buildappswith platform, including detailed descriptions, default values, and environment-specific requirements.

## Variable Categories

### 1. Application Configuration

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `NODE_ENV` | Yes | - | Node.js environment mode | All |
| `NEXT_PUBLIC_API_URL` | Yes | - | API endpoint URL for client-side requests | All |
| `NEXT_PUBLIC_SITE_URL` | No | - | Base URL for the application | All |
| `NEXT_PUBLIC_APP_ENV` | No | - | Application environment identifier | Production |

### 2. Authentication (Clerk)

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | - | Clerk public API key for client-side auth | All |
| `CLERK_SECRET_KEY` | Yes | - | Clerk secret key for server-side operations | All |
| `CLERK_WEBHOOK_SECRET` | Yes | - | Secret for validating Clerk webhook requests | All |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` | URL path for sign-in page | All |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` | URL path for sign-up page | All |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | `/dashboard` | Redirect URL after successful sign-in | All |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | `/onboarding` | Redirect URL after successful sign-up | All |

### 3. Payment Processing (Stripe)

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `STRIPE_SECRET_KEY` | Yes | - | Stripe secret API key for backend operations | All |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | - | Stripe public key for frontend integration | All |
| `STRIPE_WEBHOOK_SECRET` | Yes | - | Secret for validating Stripe webhook signatures | All |

### 4. Database Configuration

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (pooled) | All |
| `DATABASE_URL_UNPOOLED` | No | - | PostgreSQL connection string (direct, for migrations) | Development |
| `PRODUCTION_DATABASE_URL` | No | - | Explicit production database connection | Production |

### 5. Feature Flags

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `NEXT_PUBLIC_ENABLE_BUILDER_PROFILES` | No | `false` | Enable public builder profiles feature | All |
| `NEXT_PUBLIC_ENABLE_SKILL_TREE` | No | `false` | Enable skill tree visualization | All |
| `NEXT_PUBLIC_ENABLE_TIMELINE` | No | `false` | Enable timeline feature | All |
| `FEATURE_BUILDER_PROFILES` | No | `false` | Server-side feature flag for builder profiles | All |
| `FEATURE_PORTFOLIO_SHOWCASE` | No | `false` | Server-side feature flag for portfolio showcase | All |

### 6. Content Management (Sanity)

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | No | - | Sanity project ID for CMS integration | All |
| `NEXT_PUBLIC_SANITY_DATASET` | No | - | Sanity dataset name | All |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | `2025-05-04` | Sanity API version | All |

### 7. Monitoring & Analytics

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `DATADOG_API_KEY` | No | - | Datadog API key for monitoring | All |
| `DATADOG_APP_KEY` | No | - | Datadog application key | All |

### 8. Legacy/Migration Variables

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `NEXTAUTH_URL` | No | - | Legacy NextAuth base URL (deprecated) | Pre-Production |

### 9. Middleware Configuration

| Variable | Required | Default | Description | Environment |
|----------|----------|---------|-------------|-------------|
| `RATE_LIMIT_ENABLED` | No | `true` | Enable rate limiting middleware | All |
| `RATE_LIMIT_DEFAULT` | No | `60` | Default rate limit per window | All |
| `RATE_LIMIT_WINDOW_SIZE` | No | `60` | Rate limit window size in seconds | All |
| `ENABLE_PERFORMANCE_HEADERS` | No | `false` | Enable performance monitoring headers | All |
| `LOG_MIDDLEWARE_REQUESTS` | No | `false` | Log incoming middleware requests | All |
| `LOG_MIDDLEWARE_RESPONSES` | No | `false` | Log outgoing middleware responses | All |

## Environment-Specific Configurations

### Development (local)
- Uses unpooled database connections for testing
- NEXT_PUBLIC_API_URL points to localhost:3000/api
- Feature flags can be freely toggled for testing

### Preview (Vercel branch deployments)
- Each preview deployment gets unique database instances
- Preview URLs are dynamically generated
- Most variables mirror production but with preview-specific overrides

### Production
- All security features enabled
- Rate limiting strictly enforced
- Monitoring and logging at production levels

## Security Notes

1. **Sensitive Variables**: Never commit sensitive variables like API keys, secrets, or database credentials to the repository.

2. **Client-Side Variables**: Only use `NEXT_PUBLIC_` prefix for variables that are safe to expose to the client.

3. **Environment Isolation**: Use different keys and secrets for development, staging, and production environments.

4. **Webhook Secrets**: Generate strong, unique secrets for all webhook integrations.

5. **Database Access**: Use pooled connections in production, direct connections only for migrations.

## Related Documentation

- [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md) - Vercel configuration guide
- [.env.template](.env.template) - Environment variable template
- [Clerk Authentication Guide](../engineering/CLERK_DOCUMENTATION_UPDATES_SUMMARY.md) - Clerk setup details
- [Stripe Integration Guide](../engineering/STRIPE_FUTURE_RECOMMENDATIONS.md) - Stripe configuration
