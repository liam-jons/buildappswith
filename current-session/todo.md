Session Context

  - Session Type: Authentication System Cleanup & Architecture Alignment
  - Component Focus: Post-Migration Cleanup and Domain Architecture Standardization
  - Current Branch: feature/auth-cleanup
  - Migration Status: Clerk Express SDK is implemented but legacy code remains
  - Related Documentation: lib/auth/README.md, docs/engineering/CLERK_EXPRESS_MIGRATION.md
  - Mintlify Documentation: buildappswith-docs/authentication/*
  - Project root directory: /Users/liamj/Documents/development/buildappswith

  Refactoring Objectives

  - Clean up legacy Clerk implementation artifacts post-Express SDK migration
  - Align auth domain with marketplace's golden standard architecture
  - Remove deprecated forwarding functions and consolidate to single implementation
  - Standardize import paths to use Express SDK implementation directly
  - Simplify role-checking patterns to eliminate redundancy
  - Remove migration artifacts and backup files
  - Update Mintlify documentation to reflect the cleaned Express SDK implementation

  Implementation Plan

  1. Post-Migration Cleanup

  - Remove deprecated files that forward to Express SDK
  - Delete migration artifacts (remove-nextauth-deps.js, verify-auth-migration.ts)
  - Remove backup files (adapter.ts.backup, adapter.ts.fixed)
  - Clean up legacy Clerk implementation files
  - Consolidate duplicate API files

  2. Domain Structure Alignment

  - Restructure lib/auth/ to match marketplace pattern
  - Move Express SDK implementation from express/ subdirectory to main auth directory
  - Establish standard domain files: actions.ts, api.ts, hooks.ts, utils.ts, types.ts, index.ts
  - Create adapters/clerk-express/ for implementation-specific code

  3. Import Path Consolidation

  - Update all imports to use @/lib/auth directly (not @/lib/auth/express)
  - Remove forwarding hooks from @/hooks/auth
  - Update component imports to use the new standardized paths
  - Create comprehensive barrel export in @/lib/auth/index.ts

  4. Role Management Simplification

  - Remove redundant role-checking hooks
  - Standardize on single pattern for role/permission checks
  - Update components using deprecated role hooks
  - Implement consistent naming (use isAuthenticated throughout)

  5. Documentation Update

  - Update Mintlify docs to reflect Express SDK as the single implementation
  - Document the cleaned architecture
  - Create migration guide for any remaining deprecated patterns
  - Update API documentation for the simplified structure

  Technical Specifications

  Target Directory Structure

  lib/auth/
  ├── index.ts              # Barrel export (public API)
  ├── actions.ts            # Server actions
  ├── api.ts                # API utilities
  ├── hooks.ts              # Client hooks (from express/client-auth.ts)
  ├── utils.ts              # Shared utilities
  ├── types.ts              # Type definitions
  ├── server.ts             # Server utilities (from express/server-auth.ts)
  ├── middleware.ts         # Middleware (from express/middleware.ts)
  ├── README.md             # Domain documentation
  ├── adapters/             # Implementation details
  │   └── clerk-express/    # Clerk Express SDK specific code
  │       ├── adapter.ts
  │       ├── errors.ts
  │       └── config.ts
  └── __tests__/            # Test files

  Migration Path

  // Before - using deprecated forwarding
  import { useAuth } from '@/hooks/auth';
  import { useAuth as useExpressAuth } from '@/lib/auth/express/client-auth';

  // After - direct import from auth domain
  import { useAuth } from '@/lib/auth';

  Public API Design

  // lib/auth/index.ts - Simplified public API
  export {
    // Client hooks
    useAuth,
    useUser,
    usePermissions,
    useAuthStatus,

    // Server utilities
    getServerAuth,
    requireAuth,
    requireRole,

    // API protection
    withAuth,
    withRole,
    withPermission,

    // Types
    type User,
    type AuthState,
    UserRole,

    // Middleware
    authMiddleware,
  } from './internal';

  Expected Outputs

  - Cleaned lib/auth/ directory with Express SDK as the single implementation
  - No deprecated forwarding functions or duplicate implementations
  - Standardized import paths across the entire codebase
  - Simplified role/permission system
  - Removed all migration artifacts and backup files
  - Updated Mintlify documentation reflecting the clean architecture
  - Clear separation between public API and implementation details
  - Comprehensive test coverage maintained

  Implementation Notes

  1. No Breaking Changes: Since we're removing deprecated forwarding functions, ensure all consumers are updated
  2. Express SDK Focus: The Express SDK is the implementation, not a secondary option
  3. Clean Architecture: Follow marketplace pattern strictly
  4. Documentation: Update all references to reflect single implementation
  5. Testing: Ensure all tests pass after restructuring

  The auth domain MUST emerge from this cleanup as a clean, single-implementation system using Clerk Express SDK, following the same architectural patterns as marketplace.
