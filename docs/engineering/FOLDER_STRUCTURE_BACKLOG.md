# Folder Structure Standardization Backlog

This document outlines the remaining tasks for implementing the standardized folder structure across the Buildappswith platform.

## Priority 1: UI Components Restructuring

- [ ] Move core UI components to /components/ui/core/
  - [ ] accordion.tsx
  - [ ] alert.tsx
  - [ ] avatar.tsx
  - [ ] badge.tsx
  - [ ] button.tsx
  - [ ] card.tsx
  - [ ] checkbox.tsx
  - [ ] dialog.tsx
  - [ ] dropdown-menu.tsx
  - [ ] form.tsx
  - [ ] input.tsx
  - [ ] label.tsx
  - [ ] loading-spinner.tsx
  - [ ] popover.tsx
  - [ ] radio-group.tsx
  - [ ] select.tsx
  - [ ] separator.tsx
  - [ ] sonner.tsx
  - [ ] switch.tsx
  - [ ] table.tsx
  - [ ] tabs.tsx
  - [ ] textarea.tsx
  - [ ] tooltip.tsx
- [ ] Update imports across the codebase
- [ ] Test to ensure functionality is preserved
- [ ] Identify composite components for potential extraction

## Priority 2: Domain-Specific Components

- [ ] Review and reorganize marketplace components
  - [ ] Move domain-specific UI to /components/marketplace/ui
  - [ ] Update imports and exports
- [ ] Review and reorganize auth components
  - [ ] Move components from Clerk migration
  - [ ] Remove legacy NextAuth components
  - [ ] Update imports and exports
- [ ] Review and reorganize admin components
  - [ ] Move domain-specific UI to /components/admin/ui
  - [ ] Update imports and exports
- [ ] Review and reorganize remaining domains

## Priority 3: Hooks Reorganization

- [ ] Create domain-specific hooks directories
- [ ] Move hooks to appropriate locations
- [ ] Create barrel exports
- [ ] Update imports

## Priority 4: Library Standardization

- [ ] Review utility functions and organize by domain
- [ ] Consolidate similar utilities
- [ ] Create consistent patterns for services
- [ ] Update imports

## Priority 5: API Routes Standardization

- [ ] Ensure consistent organization patterns
- [ ] Document API structure
- [ ] Standardize error handling and response formats

## Priority 6: Documentation and Validation

- [ ] Create a script to validate adherence to structure
- [ ] Update README files for all domains
- [ ] Consider Storybook integration for component documentation
- [ ] Create developer guide for the new structure

## Completed Tasks

- [x] Created folder structure plan
- [x] Established directory scaffolding
- [x] Created barrel exports
- [x] Moved ValidationTierBadge to proper location
- [x] Created comprehensive folder structure guide
- [x] Added component README documentation
- [x] Documented architecture decision
