# Testing Framework Documentation

## Overview

This directory contains comprehensive documentation for the BuildAppsWith testing framework, including test strategies, patterns, and best practices.

## Master Documentation

The [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md) serves as the central entry point for all testing documentation.

## Documentation Structure

### Test Planning & Strategy

- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md) - Master testing document
- [Test Coverage Matrix](./TEST_COVERAGE_MATRIX.md) - Feature coverage map by role and test type
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - Testing implementation plan

### User Role Testing

- [Test User Matrix](./TEST_USER_MATRIX.md) - Standard test users for different roles
- [Authentication Patterns](./AUTHENTICATION_PATTERNS.md) - Authentication testing guidelines

### Test Environment & Setup

- [Test Environment Setup](./TEST_ENVIRONMENT_SETUP.md) - Environment configuration
- [Database Reset Isolation](./DATABASE_RESET_ISOLATION.md) - Database isolation strategies
- [Test Data Seeding Strategy](./TEST_DATA_SEEDING_STRATEGY.md) - Data seeding approach
- [Clerk Database Sync](./CLERK_DATABASE_SYNC.md) - Clerk authentication integration

### Test Categories & Patterns

- [API Testing Patterns](./API_TESTING_PATTERNS.md) - API testing approach
- [Accessibility Testing Guidelines](./ACCESSIBILITY_TESTING_GUIDELINES.md) - A11y testing approach
- [Error Testing Patterns](./ERROR_TESTING_PATTERNS.md) - Error handling testing
- [Visual Regression Testing](./VISUAL_REGRESSION_TESTING.md) - Visual testing approach
- [E2E Testing Implementation](./E2E_TESTING_IMPLEMENTATION.md) - End-to-end testing details

### Test Tools & Integration

- [Testing Tools Reference](./TESTING_TOOLS_REFERENCE.md) - Testing utilities overview
- [GitHub Actions CI Workflow](./GITHUB_ACTIONS_CI_WORKFLOW.md) - CI integration
- [Test Pattern Libraries](./TEST_PATTERN_LIBRARIES.md) - Reusable test patterns
- [LLM Optimized Documentation](./LLM_OPTIMIZED_DOCUMENTATION.md) - AI-assisted testing

### Specialized Testing Areas

- [Calendly Test Coverage Analysis](./CALENDLY_TEST_COVERAGE_ANALYSIS.md) - Calendly integration testing
- [Calendly Critical Path Test](./CALENDLY_CRITICAL_PATH_TEST.md) - Calendly critical flows
- [Calendly Manual Testing Plan](./CALENDLY_MANUAL_TESTING_PLAN.md) - Calendly manual testing
- [Sentry Test Plan](./SENTRY_TEST_PLAN.md) - Sentry integration testing

### Maintenance & Improvement

- [Test Failure Solutions](./TEST_FAILURE_SOLUTIONS.md) - Addressing common test failures
- [Test Infrastructure Fixes](./TEST_INFRASTRUCTURE_FIXES.md) - Infrastructure improvements
- [Future Investigation Areas](./FUTURE_INVESTIGATION_AREAS.md) - Future testing improvements

## Getting Started

For new team members, start with these resources:

1. [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md) - Overview of the testing approach
2. [Test Environment Setup](./TEST_ENVIRONMENT_SETUP.md) - Setting up your environment
3. [Test Coverage Matrix](./TEST_COVERAGE_MATRIX.md) - Understanding test coverage
4. [Specific domain documentation](#test-categories--patterns) - Based on your area of focus

## Running Tests

### E2E Tests

```bash
# Install Playwright browsers
pnpm exec playwright install

# Run all E2E tests
pnpm exec playwright test

# Run specific test domains
pnpm exec playwright test auth/
pnpm exec playwright test booking/
pnpm exec playwright test marketplace/

# Run with specific browser
pnpm exec playwright test --project=chromium

# Update visual baselines
pnpm exec playwright test --config=playwright.visual.config.ts --update-snapshots
```

### Unit and Component Tests

```bash
# Run all Vitest tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in a specific file
pnpm test path/to/test.test.tsx

# Run tests matching a pattern
pnpm test -t "pattern"
```

## Test Directory Structure

```
buildappswith/
├── __tests__/
│   ├── api/                   # API endpoint tests
│   ├── components/            # Component tests
│   ├── e2e/                   # End-to-end tests with Playwright
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── marketplace/
│   │   ├── visual/
│   │   └── global-setup.ts
│   ├── integration/           # Integration tests
│   ├── middleware/            # Middleware tests
│   ├── mocks/                 # Mock data and functions
│   ├── unit/                  # Unit tests
│   └── utils/                 # Test utilities
├── test-results/              # Test execution results
│   ├── coverage/
│   ├── e2e/
│   ├── reports/
│   └── visual/
└── docs/
    └── testing/               # Testing documentation (this directory)
```

## Contributing to Tests

When contributing new tests, please follow these guidelines:

1. Place tests in the appropriate directory based on type (unit, component, e2e, etc.)
2. Follow the established test patterns for consistency
3. Ensure tests are isolated and deterministic
4. Include thorough assertions covering success and error cases
5. Document any new test utilities or patterns
6. Run the full test suite locally before submitting a PR

## Testing Best Practices

1. **Test Isolation**: Tests should not depend on or affect each other
2. **Realistic Data**: Use realistic test data that mirrors production scenarios
3. **Error Handling**: Test both happy path and error scenarios
4. **Performance**: Optimize tests for speed to keep the feedback loop fast
5. **Readability**: Write clear, understandable tests that serve as documentation
6. **Coverage**: Aim for comprehensive coverage but prioritize critical paths
7. **Maintainability**: Structure tests to be maintainable as the application evolves

## Archived Documentation

Superseded testing documentation has been archived and can be found in:
- [Archived Testing Documentation](/docs/archive/testing)

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [React Testing Best Practices](https://reactjs.org/docs/testing.html)