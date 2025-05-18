# Machine-Parsable Test Pattern Libraries

## Overview

This document defines a collection of machine-parsable test pattern libraries for the BuildAppsWith platform. These patterns are designed to be easily consumed by large language models (LLMs) and used for automated test generation.

**Date**: May 8, 2025  
**Branch**: feature/testing-enhancement  
**Status**: Approved

## Pattern Library Structure

The test pattern libraries are organized into domain-specific collections, each containing structured pattern definitions with explicit metadata:

```typescript
// __tests__/patterns/authentication/signin-patterns.ts
import { TestPattern } from '../pattern-types';

/**
 * Collection of authentication sign-in test patterns
 * @llm-category authentication
 * @llm-domain auth
 */
export const signInPatterns: TestPattern[] = [
  {
    id: 'auth-signin-basic',
    name: 'Basic Authentication Sign In',
    description: 'Tests basic sign-in functionality with valid credentials',
    complexity: 'basic',
    implementation: `
      test('signs in with valid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('test@example.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await expect(page).toHaveURL(/.*\/dashboard/);
        await expect(page.getByTestId('user-menu')).toBeVisible();
      });
    `,
    useCases: [
      'Verify users can sign in with valid credentials',
      'Verify successful redirect after authentication'
    ],
    dependencies: [
      '__tests__/utils/auth-utils.ts'
    ],
    testData: {
      user: {
        email: 'test@example.com',
        password: 'Password123!'
      }
    },
    selectors: {
      emailField: 'page.getByLabel(/email/i)',
      passwordField: 'page.getByLabel(/password/i)',
      submitButton: 'page.getByRole(\'button\', { name: /sign in|log in/i })',
      userMenu: 'page.getByTestId(\'user-menu\')'
    }
  },
  
  {
    id: 'auth-signin-invalid',
    name: 'Invalid Credentials Sign In',
    description: 'Tests sign-in validation with invalid credentials',
    complexity: 'basic',
    implementation: `
      test('shows error with invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('invalid@example.com');
        await page.getByLabel(/password/i).fill('WrongPassword123!');
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await expect(page.getByText(/invalid email or password/i)).toBeVisible();
        await expect(page).toHaveURL(/.*\/login/);
      });
    `,
    useCases: [
      'Verify error messages for invalid credentials',
      'Ensure user remains on login page after failed authentication'
    ],
    dependencies: [
      '__tests__/utils/auth-utils.ts'
    ],
    testData: {
      user: {
        email: 'invalid@example.com',
        password: 'WrongPassword123!'
      }
    },
    selectors: {
      emailField: 'page.getByLabel(/email/i)',
      passwordField: 'page.getByLabel(/password/i)',
      submitButton: 'page.getByRole(\'button\', { name: /sign in|log in/i })',
      errorMessage: 'page.getByText(/invalid email or password/i)'
    }
  },
  
  {
    id: 'auth-signin-validation',
    name: 'Form Validation Sign In',
    description: 'Tests input validation for the sign-in form',
    complexity: 'basic',
    implementation: `
      test('validates form inputs', async ({ page }) => {
        await page.goto('/login');
        
        // Try submitting empty form
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await expect(page.getByText(/email is required/i)).toBeVisible();
        await expect(page.getByText(/password is required/i)).toBeVisible();
        
        // Try invalid email format
        await page.getByLabel(/email/i).fill('not-an-email');
        await page.getByRole('button', { name: /sign in|log in/i }).click();
        await expect(page.getByText(/invalid email format/i)).toBeVisible();
      });
    `,
    useCases: [
      'Verify form validation for empty fields',
      'Verify email format validation'
    ],
    dependencies: [
      '__tests__/utils/auth-utils.ts'
    ],
    testData: {
      invalidEmail: 'not-an-email'
    },
    selectors: {
      emailField: 'page.getByLabel(/email/i)',
      submitButton: 'page.getByRole(\'button\', { name: /sign in|log in/i })',
      emailRequiredError: 'page.getByText(/email is required/i)',
      passwordRequiredError: 'page.getByText(/password is required/i)',
      invalidEmailError: 'page.getByText(/invalid email format/i)'
    }
  },
  
  {
    id: 'auth-signin-role-redirect',
    name: 'Role-Based Redirect Sign In',
    description: 'Tests role-specific redirects after successful authentication',
    complexity: 'intermediate',
    implementation: `
      test('redirects based on user role', async ({ page }) => {
        // Test each role type
        const testCases = [
          { role: 'client', expectedPath: /dashboard/ },
          { role: 'builder', expectedPath: /builder/ },
          { role: 'admin', expectedPath: /admin/ }
        ];
        
        for (const { role, expectedPath } of testCases) {
          await page.goto('/login');
          
          // Login with role-specific credentials
          const userData = getUserDataByRole(role);
          await page.getByLabel(/email/i).fill(userData.email);
          await page.getByLabel(/password/i).fill(userData.password);
          await page.getByRole('button', { name: /sign in|log in/i }).click();
          
          // Verify correct redirect path
          await expect(page).toHaveURL(expectedPath);
          
          // Logout for next test
          await page.getByTestId('user-menu').click();
          await page.getByRole('menuitem', { name: /logout|sign out/i }).click();
        }
      });
    `,
    useCases: [
      'Verify different roles redirect to appropriate destinations',
      'Verify session state for different user types'
    ],
    dependencies: [
      '__tests__/utils/auth-utils.ts',
      '__tests__/utils/role-utils.ts'
    ],
    testData: {
      roles: ['client', 'builder', 'admin'],
      redirectPaths: {
        client: '/dashboard',
        builder: '/builder',
        admin: '/admin'
      }
    },
    selectors: {
      emailField: 'page.getByLabel(/email/i)',
      passwordField: 'page.getByLabel(/password/i)',
      submitButton: 'page.getByRole(\'button\', { name: /sign in|log in/i })',
      userMenu: 'page.getByTestId(\'user-menu\')',
      logoutMenuItem: 'page.getByRole(\'menuitem\', { name: /logout|sign out/i })'
    },
    helperFunctions: [
      {
        name: 'getUserDataByRole',
        description: 'Returns test user data for a specific role',
        code: `
          function getUserDataByRole(role: string) {
            const users = {
              client: { email: 'test-client@example.com', password: 'ClientPassword123!' },
              builder: { email: 'test-builder@example.com', password: 'BuilderPassword123!' },
              admin: { email: 'test-admin@example.com', password: 'AdminPassword123!' }
            };
            return users[role] || users.client;
          }
        `
      }
    ]
  }
];
```

## Pattern Type Definitions

The patterns follow a strict type structure to ensure consistency and machine-parsability:

```typescript
// __tests__/patterns/pattern-types.ts

/**
 * Complexity levels for test patterns
 */
export type PatternComplexity = 'basic' | 'intermediate' | 'advanced';

/**
 * Test domains in the application
 */
export type TestDomain = 
  | 'auth' 
  | 'profile' 
  | 'marketplace' 
  | 'booking' 
  | 'payment'
  | 'admin';

/**
 * Helper function definition
 */
export interface HelperFunction {
  /** Name of the helper function */
  name: string;
  /** Description of what the function does */
  description: string;
  /** Implementation code */
  code: string;
  /** Optional parameter definitions */
  parameters?: {
    name: string;
    type: string;
    description: string;
  }[];
  /** Optional return type and description */
  returns?: {
    type: string;
    description: string;
  };
}

/**
 * Core test pattern definition
 */
export interface TestPattern {
  /** Unique identifier for the pattern */
  id: string;
  /** Descriptive name */
  name: string;
  /** Detailed description of what the pattern tests */
  description: string;
  /** Complexity level */
  complexity: PatternComplexity;
  /** Actual test implementation code */
  implementation: string;
  /** List of use cases this pattern addresses */
  useCases: string[];
  /** Required dependencies (import paths) */
  dependencies: string[];
  /** Test data used in the pattern */
  testData?: Record<string, any>;
  /** UI element selectors used in the test */
  selectors?: Record<string, string>;
  /** Optional helper functions for the pattern */
  helperFunctions?: HelperFunction[];
  /** Metadata for categorization */
  tags?: string[];
  /** Related patterns by ID */
  relatedPatterns?: string[];
}

/**
 * Interface for library exports
 */
export interface PatternLibrary {
  domain: TestDomain;
  category: string;
  patterns: TestPattern[];
}
```

## Domain-Specific Pattern Libraries

### Booking Test Patterns

```typescript
// __tests__/patterns/booking/booking-flow-patterns.ts
import { TestPattern } from '../pattern-types';

/**
 * Collection of booking flow test patterns
 * @llm-category booking
 * @llm-domain booking
 */
export const bookingFlowPatterns: TestPattern[] = [
  {
    id: 'booking-session-selection',
    name: 'Session Type Selection',
    description: 'Tests the selection of session types in the booking flow',
    complexity: 'basic',
    implementation: `
      test('selects a session type', async ({ page }) => {
        // Navigate to booking page
        await page.goto('/book/established-builder');
        
        // Verify session types are displayed
        await expect(page.getByTestId('session-type-card')).toBeVisible();
        
        // Select the first session type
        await page.getByTestId('session-type-card').first().click();
        
        // Verify selection is reflected in the UI
        await expect(page.getByTestId('selected-session-badge')).toBeVisible();
        
        // Continue to next step
        await page.getByRole('button', { name: /continue|next/i }).click();
        
        // Verify navigation to calendar view
        await expect(page.getByTestId('booking-calendar')).toBeVisible();
      });
    `,
    useCases: [
      'Verify user can view available session types',
      'Verify session type selection is reflected in UI',
      'Verify user can proceed to next step after selection'
    ],
    dependencies: [
      '__tests__/utils/booking-utils.ts'
    ],
    selectors: {
      sessionTypeCard: 'page.getByTestId(\'session-type-card\')',
      selectedSessionBadge: 'page.getByTestId(\'selected-session-badge\')',
      continueButton: 'page.getByRole(\'button\', { name: /continue|next/i })',
      bookingCalendar: 'page.getByTestId(\'booking-calendar\')'
    }
  },
  
  {
    id: 'booking-calendar-selection',
    name: 'Calendar Date and Time Selection',
    description: 'Tests the selection of date and time in the booking calendar',
    complexity: 'intermediate',
    implementation: `
      test('selects date and time slot', async ({ page }) => {
        // Navigate to booking page and select session type
        await page.goto('/book/established-builder');
        await page.getByTestId('session-type-card').first().click();
        await page.getByRole('button', { name: /continue|next/i }).click();
        
        // Verify calendar is displayed
        await expect(page.getByTestId('booking-calendar')).toBeVisible();
        
        // Select first available date
        const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
        await availableDay.click();
        
        // Wait for time slots to load
        await page.waitForSelector('[data-testid="time-slot"]');
        
        // Select first available time slot
        await page.getByTestId('time-slot').first().click();
        
        // Verify time slot selection is reflected
        await expect(page.getByTestId('selected-time-slot')).toBeVisible();
        
        // Continue to next step
        await page.getByRole('button', { name: /continue|next/i }).click();
        
        // Verify navigation to details form
        await expect(page.getByTestId('booking-details-form')).toBeVisible();
      });
    `,
    useCases: [
      'Verify user can select an available date',
      'Verify time slots load for selected date',
      'Verify time slot selection is reflected in UI',
      'Verify user can proceed to details form'
    ],
    dependencies: [
      '__tests__/utils/booking-utils.ts',
      '__tests__/utils/calendar-utils.ts'
    ],
    selectors: {
      sessionTypeCard: 'page.getByTestId(\'session-type-card\')',
      continueButton: 'page.getByRole(\'button\', { name: /continue|next/i })',
      bookingCalendar: 'page.getByTestId(\'booking-calendar\')',
      availableDay: 'page.locator(\'.calendar-day:not(.calendar-day-disabled)\').first()',
      timeSlot: 'page.getByTestId(\'time-slot\')',
      selectedTimeSlot: 'page.getByTestId(\'selected-time-slot\')',
      bookingDetailsForm: 'page.getByTestId(\'booking-details-form\')'
    }
  },
  
  {
    id: 'booking-form-submission',
    name: 'Booking Details Form Submission',
    description: 'Tests the submission of booking details form',
    complexity: 'intermediate',
    implementation: `
      test('completes booking details form', async ({ page }) => {
        // Navigate through booking flow to form
        await page.goto('/book/established-builder');
        await page.getByTestId('session-type-card').first().click();
        await page.getByRole('button', { name: /continue|next/i }).click();
        
        const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
        await availableDay.click();
        await page.getByTestId('time-slot').first().click();
        await page.getByRole('button', { name: /continue|next/i }).click();
        
        // Verify form is displayed
        await expect(page.getByTestId('booking-details-form')).toBeVisible();
        
        // Fill out form fields
        await page.getByLabel(/project description|tell us about your project/i)
          .fill('This is a test booking for an E2E test. We need assistance with developing an application.');
        
        // If name field is visible, fill it
        if (await page.getByLabel(/name/i).isVisible()) {
          await page.getByLabel(/name/i).fill('Test Client');
        }
        
        // Continue to payment
        await page.getByRole('button', { name: /continue|next|payment/i }).click();
        
        // Verify redirect to payment
        await expect(page).toHaveURL(/.*checkout\.stripe\.com.*|.*\/payment.*/);
      });
    `,
    useCases: [
      'Verify booking details form is displayed',
      'Verify form validation',
      'Verify successful form submission redirects to payment'
    ],
    dependencies: [
      '__tests__/utils/booking-utils.ts',
      '__tests__/utils/form-utils.ts'
    ],
    testData: {
      projectDescription: 'This is a test booking for an E2E test. We need assistance with developing an application.',
      clientName: 'Test Client'
    },
    selectors: {
      bookingDetailsForm: 'page.getByTestId(\'booking-details-form\')',
      projectDescriptionField: 'page.getByLabel(/project description|tell us about your project/i)',
      nameField: 'page.getByLabel(/name/i)',
      continueButton: 'page.getByRole(\'button\', { name: /continue|next|payment/i })'
    }
  },
  
  {
    id: 'booking-payment-processing',
    name: 'Booking Payment Processing',
    description: 'Tests the payment processing flow for bookings',
    complexity: 'advanced',
    implementation: `
      test('processes payment for booking', async ({ page }) => {
        // Complete booking flow up to payment
        await page.goto('/book/established-builder');
        await page.getByTestId('session-type-card').first().click();
        await page.getByRole('button', { name: /continue|next/i }).click();
        
        const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
        await availableDay.click();
        await page.getByTestId('time-slot').first().click();
        await page.getByRole('button', { name: /continue|next/i }).click();
        
        await page.getByLabel(/project description|tell us about your project/i)
          .fill('Test booking with payment processing.');
        await page.getByRole('button', { name: /continue|next|payment/i }).click();
        
        // Verify redirect to Stripe checkout
        await expect(page).toHaveURL(/.*checkout\.stripe\.com.*/);
        
        // Fill Stripe test card details in iframe
        const cardFrame = page.frameLocator('iframe[name*="card"]').first();
        await cardFrame.locator('[placeholder*="Card number"]').fill('4242424242424242');
        await cardFrame.locator('[placeholder*="MM / YY"]').fill('12/30');
        await cardFrame.locator('[placeholder*="CVC"]').fill('123');
        await cardFrame.locator('[placeholder*="ZIP"]').fill('12345');
        
        // Submit payment
        await page.getByRole('button', { name: /pay|submit|confirm/i }).click();
        
        // Wait for redirect back to confirmation page
        await page.waitForURL(/.*\/booking\/confirmation.*/);
        
        // Verify confirmation page
        await expect(page.getByText(/booking confirmed|thank you/i)).toBeVisible();
        await expect(page.getByText(/confirmation number|reference/i)).toBeVisible();
      });
    `,
    useCases: [
      'Verify redirect to Stripe checkout',
      'Test payment processing with test card',
      'Verify redirect to confirmation page after payment',
      'Verify booking confirmation details'
    ],
    dependencies: [
      '__tests__/utils/booking-utils.ts',
      '__tests__/utils/payment-utils.ts'
    ],
    testData: {
      projectDescription: 'Test booking with payment processing.',
      testCard: {
        number: '4242424242424242',
        expiry: '12/30',
        cvc: '123',
        zip: '12345'
      }
    },
    selectors: {
      cardNumberField: 'cardFrame.locator(\'[placeholder*="Card number"]\')',
      cardExpiryField: 'cardFrame.locator(\'[placeholder*="MM / YY"]\')',
      cardCvcField: 'cardFrame.locator(\'[placeholder*="CVC"]\')',
      cardZipField: 'cardFrame.locator(\'[placeholder*="ZIP"]\')',
      payButton: 'page.getByRole(\'button\', { name: /pay|submit|confirm/i })',
      confirmationMessage: 'page.getByText(/booking confirmed|thank you/i)',
      referenceNumber: 'page.getByText(/confirmation number|reference/i)'
    }
  }
];
```

### Marketplace Test Patterns

```typescript
// __tests__/patterns/marketplace/search-patterns.ts
import { TestPattern } from '../pattern-types';

/**
 * Collection of marketplace search test patterns
 * @llm-category marketplace
 * @llm-domain marketplace
 */
export const marketplaceSearchPatterns: TestPattern[] = [
  {
    id: 'marketplace-search-basic',
    name: 'Basic Marketplace Search',
    description: 'Tests basic search functionality in the marketplace',
    complexity: 'basic',
    implementation: `
      test('searches marketplace with keywords', async ({ page }) => {
        // Navigate to marketplace
        await page.goto('/marketplace');
        
        // Verify search input is available
        await expect(page.getByPlaceholder(/search|find builders/i)).toBeVisible();
        
        // Perform search
        await page.getByPlaceholder(/search|find builders/i).fill('React');
        await page.getByRole('button', { name: /search/i }).click();
        
        // Wait for search results
        await page.waitForSelector('[data-testid="search-results"]');
        
        // Verify search results contain the keyword
        const resultCount = await page.getByTestId('builder-card').count();
        expect(resultCount).toBeGreaterThan(0);
        
        // Verify first result contains the search term
        const firstResult = page.getByTestId('builder-card').first();
        await expect(firstResult.getByText(/react/i)).toBeVisible();
      });
    `,
    useCases: [
      'Verify search input is visible in marketplace',
      'Verify search returns relevant results',
      'Verify search results contain search term'
    ],
    dependencies: [
      '__tests__/utils/marketplace-utils.ts'
    ],
    testData: {
      searchTerm: 'React'
    },
    selectors: {
      searchInput: 'page.getByPlaceholder(/search|find builders/i)',
      searchButton: 'page.getByRole(\'button\', { name: /search/i })',
      searchResults: 'page.getByTestId(\'search-results\')',
      builderCard: 'page.getByTestId(\'builder-card\')'
    }
  },
  
  {
    id: 'marketplace-filter-application',
    name: 'Marketplace Filter Application',
    description: 'Tests filtering functionality in the marketplace',
    complexity: 'intermediate',
    implementation: `
      test('filters marketplace results', async ({ page }) => {
        // Navigate to marketplace
        await page.goto('/marketplace');
        
        // Open filter panel if not already visible
        if (await page.getByRole('button', { name: /filters/i }).isVisible()) {
          await page.getByRole('button', { name: /filters/i }).click();
        }
        
        // Verify filter options are available
        await expect(page.getByTestId('filter-panel')).toBeVisible();
        
        // Apply domain filter
        await page.getByText(/domains|expertise/i).click();
        await page.getByLabel(/web development/i).check();
        
        // Apply hourly rate filter
        await page.getByText(/hourly rate/i).click();
        await page.getByLabel(/\$50-\$100/i).check();
        
        // Apply filter
        await page.getByRole('button', { name: /apply filters/i }).click();
        
        // Wait for filtered results
        await page.waitForSelector('[data-testid="search-results"]');
        
        // Verify filter indicators are shown
        await expect(page.getByTestId('active-filters')).toBeVisible();
        await expect(page.getByText(/web development/i)).toBeVisible();
        await expect(page.getByText(/\$50-\$100/i)).toBeVisible();
        
        // Verify results match filters
        const resultCount = await page.getByTestId('builder-card').count();
        expect(resultCount).toBeGreaterThan(0);
      });
    `,
    useCases: [
      'Verify filter panel is accessible',
      'Verify filters can be applied',
      'Verify active filters are displayed',
      'Verify filtered results match criteria'
    ],
    dependencies: [
      '__tests__/utils/marketplace-utils.ts'
    ],
    selectors: {
      filterButton: 'page.getByRole(\'button\', { name: /filters/i })',
      filterPanel: 'page.getByTestId(\'filter-panel\')',
      domainFilter: 'page.getByText(/domains|expertise/i)',
      webDevCheckbox: 'page.getByLabel(/web development/i)',
      hourlyRateFilter: 'page.getByText(/hourly rate/i)',
      rateRangeCheckbox: 'page.getByLabel(/\\$50-\\$100/i)',
      applyFiltersButton: 'page.getByRole(\'button\', { name: /apply filters/i })',
      activeFilters: 'page.getByTestId(\'active-filters\')',
      searchResults: 'page.getByTestId(\'search-results\')',
      builderCard: 'page.getByTestId(\'builder-card\')'
    }
  },
  
  {
    id: 'marketplace-empty-results',
    name: 'Marketplace Empty Results Handling',
    description: 'Tests the handling of empty search results in the marketplace',
    complexity: 'basic',
    implementation: `
      test('handles empty search results gracefully', async ({ page }) => {
        // Navigate to marketplace
        await page.goto('/marketplace');
        
        // Search for a term unlikely to match anything
        await page.getByPlaceholder(/search|find builders/i).fill('xyznonexistentskill123');
        await page.getByRole('button', { name: /search/i }).click();
        
        // Wait for search completion
        await page.waitForSelector('[data-testid="search-results"]');
        
        // Verify empty state messaging
        await expect(page.getByTestId('empty-results')).toBeVisible();
        await expect(page.getByText(/no results found/i)).toBeVisible();
        await expect(page.getByText(/try different keywords/i)).toBeVisible();
        
        // Verify clear search option
        await expect(page.getByRole('button', { name: /clear|reset/i })).toBeVisible();
        
        // Test clearing the search
        await page.getByRole('button', { name: /clear|reset/i }).click();
        
        // Verify return to default results
        await expect(page.getByTestId('builder-card')).toBeVisible();
      });
    `,
    useCases: [
      'Verify empty results state is handled properly',
      'Verify helpful messaging is displayed for no results',
      'Verify search can be cleared to return to default results'
    ],
    dependencies: [
      '__tests__/utils/marketplace-utils.ts'
    ],
    testData: {
      nonExistentSearchTerm: 'xyznonexistentskill123'
    },
    selectors: {
      searchInput: 'page.getByPlaceholder(/search|find builders/i)',
      searchButton: 'page.getByRole(\'button\', { name: /search/i })',
      searchResults: 'page.getByTestId(\'search-results\')',
      emptyResults: 'page.getByTestId(\'empty-results\')',
      noResultsMessage: 'page.getByText(/no results found/i)',
      suggestionsMessage: 'page.getByText(/try different keywords/i)',
      clearButton: 'page.getByRole(\'button\', { name: /clear|reset/i })',
      builderCard: 'page.getByTestId(\'builder-card\')'
    }
  }
];
```

## Pattern Registry

The patterns are aggregated in a central registry for easier discovery:

```typescript
// __tests__/patterns/registry.ts
import { PatternLibrary } from './pattern-types';
import { signInPatterns } from './authentication/signin-patterns';
import { signUpPatterns } from './authentication/signup-patterns';
import { bookingFlowPatterns } from './booking/booking-flow-patterns';
import { marketplaceSearchPatterns } from './marketplace/search-patterns';
import { profileEditPatterns } from './profile/profile-edit-patterns';

/**
 * Central registry of all test patterns
 * @llm-metadata test-patterns
 */
export const patternRegistry: PatternLibrary[] = [
  {
    domain: 'auth',
    category: 'authentication',
    patterns: [...signInPatterns, ...signUpPatterns]
  },
  {
    domain: 'booking',
    category: 'booking-flow',
    patterns: bookingFlowPatterns
  },
  {
    domain: 'marketplace',
    category: 'search',
    patterns: marketplaceSearchPatterns
  },
  {
    domain: 'profile',
    category: 'profile-management',
    patterns: profileEditPatterns
  }
];

/**
 * Utility function to find a pattern by ID
 */
export function findPatternById(id: string): TestPattern | undefined {
  for (const library of patternRegistry) {
    const pattern = library.patterns.find(p => p.id === id);
    if (pattern) return pattern;
  }
  return undefined;
}

/**
 * Utility function to find patterns by domain
 */
export function findPatternsByDomain(domain: TestDomain): TestPattern[] {
  const libraries = patternRegistry.filter(lib => lib.domain === domain);
  return libraries.flatMap(lib => lib.patterns);
}

/**
 * Utility function to find patterns by complexity
 */
export function findPatternsByComplexity(complexity: PatternComplexity): TestPattern[] {
  return patternRegistry.flatMap(lib => 
    lib.patterns.filter(p => p.complexity === complexity)
  );
}

/**
 * Utility function to find patterns by tags
 */
export function findPatternsByTags(tags: string[]): TestPattern[] {
  return patternRegistry.flatMap(lib =>
    lib.patterns.filter(p => p.tags && tags.some(tag => p.tags!.includes(tag)))
  );
}
```

## Pattern Generator Utility

The system includes a utility to help generate test files from patterns:

```typescript
// scripts/generate-test.ts
import { findPatternById, patternRegistry } from '../__tests__/patterns/registry';
import { TestPattern } from '../__tests__/patterns/pattern-types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate a test file from one or more patterns
 */
async function generateTest(options: {
  patternIds: string[];
  outputPath: string;
  testDescription?: string;
}): Promise<void> {
  const { patternIds, outputPath, testDescription } = options;
  
  // Find all requested patterns
  const patterns = patternIds.map(id => {
    const pattern = findPatternById(id);
    if (!pattern) {
      throw new Error(`Pattern with ID "${id}" not found`);
    }
    return pattern;
  });
  
  // Generate imports
  const imports = new Set<string>();
  imports.add('import { test, expect } from \'@playwright/test\';');
  
  // Add dependencies from all patterns
  patterns.forEach(pattern => {
    pattern.dependencies.forEach(dep => {
      // Convert to relative path based on output location
      const relativePath = path.relative(
        path.dirname(outputPath),
        path.resolve(dep)
      );
      
      // Add import statement
      const importName = path.basename(dep, path.extname(dep)).replace(/-/g, '');
      imports.add(`import { ${importName} } from '${relativePath}';`);
    });
  });
  
  // Generate helper functions
  const helperFunctions = patterns
    .flatMap(p => p.helperFunctions || [])
    .map(fn => fn.code)
    .join('\n\n');
  
  // Generate test content
  const testContent = patterns
    .map(pattern => pattern.implementation)
    .join('\n\n');
  
  // Assemble the full test file
  const fileContent = `
${Array.from(imports).join('\n')}

${helperFunctions}

test.describe('${testDescription || 'Generated Test Suite'}', () => {
${testContent}
});
`;
  
  // Create directory if needed
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  // Write the file
  fs.writeFileSync(outputPath, fileContent.trim());
  console.log(`Generated test file at ${outputPath}`);
}
```

## Benefits of Machine-Parsable Patterns

1. **Consistency**: Ensures tests follow consistent patterns and best practices
2. **Automation**: Enables automated test generation via LLMs or scripts
3. **Discoverability**: Makes it easy to find relevant test patterns for new features
4. **Standardization**: Enforces a standard structure for all tests
5. **Knowledge Sharing**: Captures testing expertise in a structured, reusable format
6. **Maintainability**: Makes it easier to update tests when patterns change
7. **Onboarding**: Helps new team members understand test patterns quickly

## Integration with LLM Tools

The machine-parsable patterns can be integrated with LLM tools in several ways:

1. **Test Generation**: LLMs can use patterns to generate tests for new features
2. **Code Completion**: LLMs can suggest completions based on pattern libraries
3. **Documentation**: LLMs can generate documentation from patterns
4. **Test Analysis**: LLMs can analyze tests to identify missing patterns
5. **Quality Assurance**: LLMs can verify tests follow standard patterns

## Implementation Timeline

1. **Phase 1**: Define pattern library structure and type definitions (Completed)
2. **Phase 2**: Implement core authentication and booking patterns (Completed)
3. **Phase 3**: Implement marketplace and profile patterns (Completed)
4. **Phase 4**: Create pattern registry and utilities (Completed)
5. **Phase 5**: Integration with LLM tools (Planned)