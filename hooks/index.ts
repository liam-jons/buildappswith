/**
 * Hooks barrel export file
 * Version: 1.0.0
 */

// Re-export hooks from domains (only those with actual exports)
// Note: auth directory doesn't exist
// export * from './auth';

// Check if these domains have actual hook exports:
export * from './scheduling';
export * from './learning';

// Note: Other domain index files exist but don't export anything yet
// They can be uncommented when hooks are added:
// export * from './marketplace';
// export * from './payment';
// export * from './profile';
// export * from './admin';
// export * from './trust';
// export * from './community';

// Re-export standalone hooks
export * from './use-on-click-outside';
