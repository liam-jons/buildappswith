# Import Standardization Guide

This guide outlines the approach to standardizing imports across the BuildAppsWith codebase, focusing on barrel files and consistent import patterns.

## Table of Contents

1. [Introduction](#introduction)
2. [Barrel File Pattern](#barrel-file-pattern)
3. [Import Standards](#import-standards)
4. [Standardization Tools](#standardization-tools)
5. [Common Issues and Fixes](#common-issues-and-fixes)
6. [Pre-commit Hook Setup](#pre-commit-hook-setup)

## Introduction

Consistent import patterns improve code maintainability, readability, and reduce build issues. This document defines our approach to standardizing imports using barrel files and provides tools to enforce these standards.

## Barrel File Pattern

A "barrel" is an index file that re-exports the exports from other files. The pattern allows for cleaner imports by presenting a unified API surface for a directory.

### Example Barrel File Structure

```
components/
  ├── ui/
  │   ├── index.ts   <- Barrel file
  │   ├── button.tsx
  │   ├── card.tsx
  │   └── input.tsx
  └── index.ts      <- Root barrel file
```

### Example Barrel File Content (`components/ui/index.ts`)

```typescript
/**
 * ui components barrel export file
 * Version: 1.0.0
 */

export { Button } from './button';
export { Card, CardHeader, CardContent, CardFooter } from './card';
export { Input } from './input';
```

## Import Standards

### Preferred Import Patterns

1. **Domain-first organization**: Imports should follow the domain-first structure.

2. **Use barrel exports**: Always import from barrel files, not directly from component files.

   ```typescript
   // ✅ CORRECT
   import { Button, Card } from "@/components/ui";
   
   // ❌ INCORRECT
   import { Button } from "@/components/ui/button";
   import { Card } from "@/components/ui/card";
   ```

3. **Import Order**:
   - External libraries
   - Internal utilities
   - Internal components
   - Types

### Special Cases

1. **UI Components**: Always import from `@/components/ui` or `@/components/ui/core`.

2. **Domain-specific Components**: Import from domain barrels like `@/components/profile`.

3. **ValidationTierBadge**: This component moved from profile to trust and should be imported from `@/components/trust/ui/validation-tier-badge`.

## Standardization Tools

We've created several tools to help standardize imports:

### 1. Import Analyzer and Fixer

The `standardize-imports.js` script analyzes and fixes non-standard imports.

```bash
# Analyze imports without making changes
node scripts/standardize-imports.js --analyze

# Preview changes that would be made
node scripts/standardize-imports.js --preview

# Fix import issues
node scripts/standardize-imports.js --fix

# Process a specific directory
node scripts/standardize-imports.js --dir=app/dashboard
```

### 2. Barrel Export Analyzer

The `analyze-barrel-exports.js` script checks if all components in a directory are properly exported in its barrel file.

```bash
# Analyze barrel exports
node scripts/analyze-barrel-exports.js

# Show detailed analysis
node scripts/analyze-barrel-exports.js --detailed

# Fix missing exports
node scripts/analyze-barrel-exports.js --fix
```

### 3. Barrel Export Generator

The `generate-barrel-exports.js` script creates or updates barrel files for component directories.

```bash
# Generate barrel exports for all component directories
node scripts/generate-barrel-exports.js

# Generate for a specific directory
node scripts/generate-barrel-exports.js --dir=components/profile

# Preview changes without writing files
node scripts/generate-barrel-exports.js --dry-run
```

### 4. Barrel Export Name Fixer

The `fix-barrel-export-names.js` script converts kebab-case component names to PascalCase in barrel exports.

```bash
# Fix kebab-case exports
node scripts/fix-barrel-export-names.js
```

### 5. UI Import Fixer

The `fix-ui-imports.js` script specifically targets UI component imports to use barrel files.

```bash
# Fix UI component imports
node scripts/fix-ui-imports.js
```

## Common Issues and Fixes

### 1. Direct Component Imports

**Issue:**
```typescript
import { Button } from "@/components/ui/core/button";
```

**Fix:**
```typescript
import { Button } from "@/components/ui/core";
```

### 2. Mixed Import Patterns

**Issue:**
```typescript
import { Card } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core";
```

**Fix:**
```typescript
import { Button, Card } from "@/components/ui/core";
```

### 3. ValidationTierBadge Import

**Issue:**
```typescript
import { ValidationTierBadge } from "@/components/profile/validation-tier-badge";
```

**Fix:**
```typescript
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
```

## Pre-commit Hook Setup

To enforce import standards, add the following pre-commit hook:

1. Install husky and lint-staged:

```bash
npm install --save-dev husky lint-staged
```

2. Add to package.json:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "node scripts/standardize-imports.js --fix",
      "git add"
    ]
  }
}
```

This will automatically fix import issues before each commit.

## Best Practices

1. **Use the standardize-imports.js script regularly** to maintain consistency.
2. **Never bypass the pre-commit hook** without fixing import issues.
3. **Update barrel files** when adding new components.
4. **Follow the domain-first organization** for all components.
5. **Use the import order convention** consistently.

By following these standards and using the provided tools, we can maintain a clean, consistent codebase with fewer build issues.