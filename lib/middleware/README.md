# Middleware Configuration Module

This module implements a configuration-driven middleware approach for the Buildappswith platform. It provides a flexible, maintainable, and testable way to handle authentication, API protection, security headers, and legacy route handling.

## Key Features

- **Configuration-Driven**: All middleware behavior is controlled by configuration, making it easy to adjust without changing implementation
- **Environment-Specific Settings**: Different configurations for development, production, and test environments
- **Modular Design**: Separated into focused components with clear responsibilities
- **Comprehensive Testing**: Complete test coverage for all components and configurations
- **Type Safety**: Full TypeScript type definitions for configuration and components
- **Enhanced Security**: RBAC, CSRF protection, rate limiting, and comprehensive security headers
- **Performance Monitoring**: Request timing and performance metrics via response headers
- **Structured Logging**: Detailed logging with appropriate levels and context
- **Error Handling**: Standardized error management with telemetry integration

## Module Structure

- **config.ts**: Defines configuration types and provides environment-specific configurations
- **api-protection.ts**: Implements CSRF protection, rate limiting, and security headers
- **legacy-routes.ts**: Handles redirects and responses for deprecated routes
- **factory.ts**: Creates the composed middleware based on configuration
- **error-handling.ts**: Provides standardized error handling and telemetry
- **logging.ts**: Implements structured logging for middleware components
- **rbac.ts**: Role-Based Access Control with policy enforcement
- **performance.ts**: Tracks and reports middleware performance metrics
- **validation.ts**: Validates middleware configuration
- **index.ts**: Exports all module components

## Usage

### Basic Usage

```typescript
import { createMiddleware, getMiddlewareConfig } from './lib/middleware';

// Get configuration with environment-specific overrides
const config = getMiddlewareConfig();

// Create middleware with configuration
const middleware = createMiddleware(config);

// Export the configured middleware
export default middleware;

// Export the matcher configuration
export const config = {
  matcher: getMiddlewareConfig().matcher,
};
```

### Configuration Customization

To customize the middleware configuration:

```typescript
import { createMiddleware, defaultMiddlewareConfig } from './lib/middleware';

// Create custom configuration
const customConfig = {
  ...defaultMiddlewareConfig,
  auth: {
    ...defaultMiddlewareConfig.auth,
    publicRoutes: [
      ...defaultMiddlewareConfig.auth.publicRoutes,
      '/custom-public-route',
    ],
  },
};

// Create middleware with custom configuration
const middleware = createMiddleware(customConfig);

export default middleware;
```

### Advanced Environment Overrides

To add a new environment-specific configuration:

```typescript
// In config.ts
export const environmentConfigs: Record<string, Partial<MiddlewareConfig>> = {
  // Existing configurations...
  
  staging: {
    api: {
      rateLimit: {
        // Higher limits for staging
        typeConfig: {
          api: 100,
          auth: 20,
          // ...
        },
      },
    },
  },
};
```

## Configuration Options

### Auth Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `publicRoutes` | Routes that don't require authentication | Homepage, login, signup, etc. |
| `ignoredRoutes` | Routes ignored by middleware | Static files, _next, etc. |
| `unauthorizedStatusCode` | Status code for unauthorized API access | 401 |
| `unauthorizedResponse` | Response body for unauthorized access | `{ error: 'Unauthorized' }` |
| `redirectOnSignOut` | Redirect target after sign out | `/` |

### API Protection Configuration

#### CSRF Protection

| Option | Description | Default |
|--------|-------------|---------|
| `enabled` | Whether CSRF protection is active | `true` |
| `excludePatterns` | URL patterns to exclude from CSRF | Auth and webhook routes |
| `cookieName` | Name of the CSRF cookie | `buildappswith_csrf` |
| `headerName` | Name of the CSRF header | `X-CSRF-Token` |
| `tokenByteSize` | Size of the token in bytes | 32 |
| `tokenExpiry` | Token expiration in seconds | 7200 (2 hours) |

#### Rate Limiting

| Option | Description | Default |
|--------|-------------|---------|
| `enabled` | Whether rate limiting is active | `true` |
| `defaultLimit` | Default requests per minute | 60 |
| `windowSize` | Time window in seconds | 60 |
| `typeConfig` | Rate limits by route type | Varies by type |

#### Security Headers

| Option | Description | Default |
|--------|-------------|---------|
| `contentSecurityPolicy` | CSP directives | See defaultCspDirectives |
| `xFrameOptions` | X-Frame-Options header | `DENY` |
| `xContentTypeOptions` | X-Content-Type-Options header | `nosniff` |
| `referrerPolicy` | Referrer-Policy header | `strict-origin-when-cross-origin` |
| `strictTransportSecurity` | HSTS header | `max-age=31536000; includeSubDomains` |
| `permissionsPolicy` | Permissions-Policy header | Limited permissions |

### Legacy Routes Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `enabled` | Whether legacy route handling is active | `true` |
| `routes` | Array of legacy route definitions | NextAuth.js routes |

### RBAC Configuration

The Role-Based Access Control system uses policies defined in the `rbac.ts` file:

| Component | Description |
|-----------|-------------|
| `UserRole` | Enum of possible user roles (`CLIENT`, `BUILDER`, `ADMIN`) |
| `ResourceAction` | Actions that can be performed on resources |
| `Permission` | Combination of resource and allowed action |
| `AccessPolicy` | Maps roles to permissions for resources |
| `defaultAccessPolicies` | Default policies for different resources |
| `routeAccessPolicies` | Maps URL paths to policy names |

## New Features

### Error Handling

The enhanced error handling system provides:

- Standardized error formatting for consistent responses
- Integration with telemetry systems
- Contextual error information for easier debugging
- Appropriate error responses based on request type
- Protection of sensitive information in error responses

### Structured Logging

The logging system implements:

- Context-aware log entries with request information
- Environment-appropriate logging (verbose in dev, structured in prod)
- Performance-minded selective logging
- Integration with monitoring systems
- Duration tracking for performance analysis

### Role-Based Access Control

The RBAC system provides:

- Fine-grained permission control based on user roles
- Resource and action-based permissions
- Path-based policy enforcement
- Detailed access logging for security auditing
- Policy-driven access decisions

### Performance Monitoring

Performance tracking includes:

- Timing of individual middleware components
- Header-based metrics exposure for client analysis
- Component-by-component performance breakdown
- Integration with monitoring systems
- Adaptive performance based on environment

## Testing

The middleware module includes comprehensive tests:

```bash
# Run all middleware tests
npm run test:middleware

# Run specific test files
npm run test -- --dir __tests__/middleware/config.test.ts
```

## Extending

### Adding a New Middleware Component

1. Create a new file in the middleware directory
2. Implement the component with configuration parameters
3. Update the factory.ts to use the new component
4. Add appropriate configuration in config.ts
5. Export the component in index.ts
6. Write tests for the new component

### Modifying Existing Components

When modifying existing components:

1. Update the appropriate configuration interface in config.ts
2. Add default values to defaultMiddlewareConfig
3. Implement the functionality in the component file
4. Update tests to cover the new functionality
5. Document the changes in this README

## Best Practices

- **Configuration First**: Always prefer configuration changes over implementation changes
- **Test Coverage**: Maintain 100% test coverage for all middleware components
- **Type Safety**: Use proper TypeScript types for all configuration and components
- **Documentation**: Update this README when adding or changing configuration options
- **Backward Compatibility**: Ensure changes don't break existing functionality
- **Error Handling**: Always wrap middleware components with error handling
- **Logging**: Use structured logging with appropriate context
- **Performance**: Monitor and optimize middleware performance
- **Security**: Follow security best practices in all middleware components
