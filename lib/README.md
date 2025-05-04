# Library Directory

This directory contains the non-React code for the Buildappswith platform, including domain-specific business logic, utilities, and API client functions.

## Directory Structure

```
/lib
├── [domain]/                # Domain business logic
│   ├── actions.ts           # Server actions
│   ├── api.ts               # API client functions
│   ├── schemas.ts           # Zod schemas
│   ├── types.ts             # TypeScript types
│   ├── utils.ts             # Domain utilities
│   └── index.ts             # Barrel exports
├── utils/                   # Shared utilities
│   ├── [utility].ts         # Individual utilities
│   └── index.ts             # Barrel exports
├── constants/               # Global constants
│   ├── [constant].ts        # Individual constants
│   └── index.ts             # Barrel exports
└── types/                   # Shared types
    ├── [type].ts            # Type definitions
    └── index.ts             # Barrel exports
```

## Core Domains

The library is organized into these primary domains:

1. **auth** - Authentication and authorization (Clerk)
2. **marketplace** - Builder discovery and profiles
3. **scheduling** - Booking and availability management
4. **payment** - Payment processing (Stripe)
5. **profile** - User profile management
6. **admin** - Administration functionality
7. **trust** - Trust architecture components
8. **community** - Community and knowledge sharing
9. **learning** - Educational components

## Standard Domain Files

Each domain follows a consistent file structure:

- **actions.ts**: Server-side actions using Next.js server actions feature
- **api.ts**: Client-side API functions for interacting with backend services
- **schemas.ts**: Zod validation schemas for data validation
- **types.ts**: TypeScript type definitions for domain entities
- **utils.ts**: Utility functions specific to the domain
- **index.ts**: Barrel exports for simplified imports

## Usage Guidelines

### Importing Domain Logic

Always import domain functionality using barrel exports:

```typescript
// Good - Use barrel exports
import { createCheckoutSession, formatCurrency } from "@/lib/payment";
import type { PaymentStatus } from "@/lib/payment/types";

// Avoid - Don't import directly from domain files
import { createCheckoutSession } from "@/lib/payment/actions";
import { formatCurrency } from "@/lib/payment/utils";
import type { PaymentStatus } from "@/lib/payment/types";
```

### Organizing Domain Logic

When creating new domain functionality:

1. **Place in the correct domain directory**
   - Domain-specific logic goes in the appropriate `/[domain]/` directory
   - Shared utilities go in `/utils/`
   - Global constants go in `/constants/`

2. **Use appropriate file organization**
   - Server actions go in `actions.ts`
   - Client API functions go in `api.ts`
   - Validation schemas go in `schemas.ts`
   - Type definitions go in `types.ts`
   - Utility functions go in `utils.ts`

3. **Include appropriate documentation**
   - JSDoc comments for functions, types, and constants
   - Implementation notes where appropriate
   - Usage examples for complex functionality

4. **Add to barrel exports**
   - Export from the domain's index.ts file
   - Use named exports for clarity

## Server Actions

Server actions (in `actions.ts` files) are server-side functions that can be called directly from client components. They:

- Are marked with the `"use server"` directive
- Can access backend resources securely
- Handle authentication and authorization
- Implement data validation and error handling
- Return structured responses with appropriate error handling

## API Client Functions

API client functions (in `api.ts` files) are client-side functions that interact with API endpoints. They:

- Run in the browser environment
- Handle request formatting and response parsing
- Implement error handling and retry logic
- Return structured responses with consistent formats
- Include loading and error states

## Validation Schemas

Validation schemas (in `schemas.ts` files) use Zod to define data validation rules. They:

- Define the structure and constraints for data entities
- Provide detailed error messages for validation failures
- Support type inference for TypeScript
- Can be shared between client and server code

## Type Definitions

Type definitions (in `types.ts` files) define the TypeScript types for domain entities. They:

- Describe the structure of domain objects
- Define enums for domain-specific values
- Create interface hierarchies for complex objects
- Support generic types where appropriate

## Utility Functions

Utility functions (in `utils.ts` files) provide helper functionality for domain operations. They:

- Implement formatting and parsing logic
- Handle common domain calculations
- Provide helper functions for domain operations
- Focus on pure functions with minimal side effects
