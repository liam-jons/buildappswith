# Stripe Documentation Guide

*Version: 1.0.133*

This guide explains the organization, purpose, and relationships between all Stripe-related documentation in the Buildappswith platform.

## Documentation Overview

The Stripe integration documentation is organized into several related documents that cover different aspects of the implementation. This modular approach allows for more focused and maintainable documentation.

## Current Documentation

### Core Implementation Documents

These documents describe the current implementation and should be the primary reference:

| Document | Location | Purpose | Status |
|----------|----------|---------|--------|
| [STRIPE_SERVER_IMPLEMENTATION.md](./STRIPE_SERVER_IMPLEMENTATION.md) | `/docs/engineering/` | Details the current server-side Stripe implementation | **Current (v1.0.133)** |
| [STRIPE_CLIENT_INTEGRATION_UPDATES.md](./STRIPE_CLIENT_INTEGRATION_UPDATES.md) | `/docs/engineering/` | Details the current client-side Stripe implementation | **Current (v1.0.133)** |

### Background and Architecture Documents

These documents provide context, history, and architectural decisions:

| Document | Location | Purpose | Status |
|----------|----------|---------|--------|
| [STRIPE_SERVER_MODERNIZATION.md](./STRIPE_SERVER_MODERNIZATION.md) | `/docs/engineering/` | Explains the modernization effort for server-side Stripe code | **Reference (v1.0.124)** |
| [STRIPE_CLEANUP_SUMMARY.md](../STRIPE_CLEANUP_SUMMARY.md) | `/docs/` | Summarizes the cleanup of Stripe API routes | **Reference (v1.0.110)** |
| [0023-stripe-api-routes-architecture.md](../architecture/decisions/0023-stripe-api-routes-architecture.md) | `/docs/architecture/decisions/` | Architecture decision record for Stripe API routes | **Current** |

### Related System Documents

These documents cover related systems that integrate with Stripe:

| Document | Location | Purpose | Status |
|----------|----------|---------|--------|
| [BOOKING_SYSTEM.md](./BOOKING_SYSTEM.md) | `/docs/engineering/` | Describes the booking system that uses Stripe for payments | **Current** |
| [PAYMENT_PROCESSING.md](./PAYMENT_PROCESSING.md) | `/docs/engineering/` | Overviews the entire payment processing flow | **Current** |

### Legacy Documents

These documents are retained for historical reference but don't reflect the current implementation:

| Document | Location | Purpose | Status |
|----------|----------|---------|--------|
| [STRIPE_INTEGRATION.md](../STRIPE_INTEGRATION.md) | `/docs/` | Original Stripe integration documentation | **Legacy** |

## Documentation Organization

### Current Structure

The Stripe documentation is currently divided between two main locations:

1. **`/docs/engineering/`**: Contains detailed implementation guides and system documentation
2. **`/docs/`**: Contains high-level summaries and legacy documentation
3. **`/docs/architecture/decisions/`**: Contains architectural decision records

### Recommended Structure

Going forward, all Stripe-related documentation should be consolidated in the `/docs/engineering/` directory, with the exception of architectural decision records which should remain in `/docs/architecture/decisions/`.

The legacy documents in the root `/docs/` directory should be gradually migrated to the engineering directory as they are updated.

## Reading Guide

For a comprehensive understanding of the Stripe integration, we recommend reading the documents in this order:

1. **Start with [PAYMENT_PROCESSING.md](./PAYMENT_PROCESSING.md)** for a high-level overview of the entire payment flow
2. **Read the current implementation documents**:
   - [STRIPE_SERVER_IMPLEMENTATION.md](./STRIPE_SERVER_IMPLEMENTATION.md) for server-side details
   - [STRIPE_CLIENT_INTEGRATION_UPDATES.md](./STRIPE_CLIENT_INTEGRATION_UPDATES.md) for client-side details
3. **Understand the integration with [BOOKING_SYSTEM.md](./BOOKING_SYSTEM.md)**
4. **Review the architectural decisions** in [0023-stripe-api-routes-architecture.md](../architecture/decisions/0023-stripe-api-routes-architecture.md)

## Maintenance Guidelines

When making changes to the Stripe implementation, follow these documentation guidelines:

1. **Update the current implementation documents** to reflect the changes
2. **Create new documents for major refactorings** rather than overwriting existing ones
3. **Increment the version number** in the document header
4. **Add entries to the CHANGELOG.md** for significant changes
5. **Update this guide** if documentation structure or relationships change

## Directory Organization

```
/docs
├── engineering/
│   ├── STRIPE_SERVER_IMPLEMENTATION.md      # Current server implementation
│   ├── STRIPE_CLIENT_INTEGRATION_UPDATES.md # Current client implementation
│   ├── STRIPE_SERVER_MODERNIZATION.md       # Historical server modernization
│   ├── BOOKING_SYSTEM.md                    # Related booking system
│   ├── PAYMENT_PROCESSING.md                # Overall payment processing flow
│   └── STRIPE_DOCUMENTATION_GUIDE.md        # This guide
├── architecture/
│   └── decisions/
│       └── 0023-stripe-api-routes-architecture.md # Architecture decision
├── STRIPE_CLEANUP_SUMMARY.md                # Historical cleanup summary
└── STRIPE_INTEGRATION.md                    # Legacy documentation
```

## Conclusion

This guide should help navigate and maintain the Stripe documentation ecosystem. As the implementation evolves, this guide should be updated to reflect changes in documentation structure and relationships.
