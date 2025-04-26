# Buildappswith Testing Framework Documentation

Version: 1.0.0  
Last Updated: April 25, 2025

## Overview

The Buildappswith platform employs a comprehensive testing strategy using Vitest as the primary test runner, integrated with Datadog for visualizing test results and monitoring test performance. This document outlines the testing approach, tools, and best practices for the platform.

## Table of Contents

1. [Testing Structure](#testing-structure)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Datadog Integration](#datadog-integration)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)

## Testing Structure

The testing framework follows a structured approach with dedicated directories for different types of tests:

```
__tests__/
├── api/                 # API endpoint tests
├── components/          # Component tests
│   ├── admin/           # Admin component tests
│   ├── auth/            # Authentication component tests
│   ├── marketplace/     # Marketplace component tests
│   └── ...
├── integration/         # Integration tests between components
├── middleware/          # Middleware tests
├── mocks/               # Mock data and functions
├── types/               # Type definitions for tests
├── unit/                # Unit tests for utilities and isolated functions
└── utils/               # Test utilities and helpers

test-results/            # Test execution results
├── coverage/            # Code coverage reports
├── reports/             # Test execution reports
├── snapshots/           # Component snapshots
└── performance/         # Performance test results
```

## Test Types

### Unit Tests

Unit tests focus on testing individual functions, hooks, and utilities in isolation. They should have minimal dependencies and use mocks for external services.

**Location**: `__tests__/unit/`  
**Naming Convention**: `*.test.ts` or `*.test.tsx`

### Component Tests

Component tests verify that UI components render correctly and respond appropriately to user interactions. They use React Testing Library to simulate user behavior.

**Location**: `__tests__/components/{domain}`  
**Naming Convention**: `ComponentName.test.tsx`

### API Tests

API tests validate the behavior of API endpoints, ensuring they handle requests correctly and return expected responses.

**Location**: `__tests__/api/`  
**Naming Convention**: `endpoint-name.test.ts`

### Integration Tests

Integration tests check that multiple components or services work together correctly.

**Location**: `__tests__/integration/`  
**Naming Convention**: `feature-name.test.ts`

### Middleware Tests

Middleware tests validate the behavior of Next.js middleware functions.

**Location**: `__tests__/middleware/`  
**Naming Convention**: `middleware-function.test.ts`

## Running Tests

The project includes various npm scripts for running tests:

### Standard Test Commands

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:middleware
```

### Datadog-Integrated Test Commands

```bash
# Run all tests and report to Datadog
npm run test:datadog

# Run tests with coverage and report to Datadog
npm run test:datadog:coverage

# Run specific test suites with Datadog reporting
npm run test:datadog:marketplace
npm run test:datadog:auth
npm run test:datadog:integration
```

## Writing Tests

### Component Test Example

```tsx
// __tests__/components/marketplace/builder-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BuilderCard from '@/components/marketplace/BuilderCard';

describe('BuilderCard', () => {
  const mockBuilder = {
    id: '1',
    name: 'Test Builder',
    expertise: ['React', 'Next.js'],
    rating: 4.8,
  };

  it('renders builder information correctly', () => {
    render(<BuilderCard builder={mockBuilder} />);
    
    expect(screen.getByText('Test Builder')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('navigates to builder profile when clicked', async () => {
    const mockNavigate = jest.fn();
    render(<BuilderCard builder={mockBuilder} onSelect={mockNavigate} />);
    
    await userEvent.click(screen.getByRole('button', { name: /view profile/i }));
    expect(mockNavigate).toHaveBeenCalledWith('1');
  });
});
```

### Utility Test Example

```tsx
// __tests__/unit/form-utils.test.ts
import { validateEmail, formatPhoneNumber } from '@/lib/form-utils';

describe('Form Utilities', () => {
  describe('validateEmail', () => {
    it('returns true for valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@example')).toBe(false);
      expect(validateEmail('userexample.com')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats phone numbers correctly', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    });

    it('returns original input for invalid phone numbers', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('abc')).toBe('abc');
    });
  });
});
```

## Datadog Integration

The platform integrates with Datadog for visualizing test results and monitoring test performance. This provides valuable insights into test trends and helps identify potential issues early.

### Key Features

1. **Test Results Visualization**: All test runs are reported to Datadog, providing dashboards for visualizing test results over time.
2. **Component-Level Metrics**: Test performance is tracked at the component level, helping identify problematic areas.
3. **Coverage Tracking**: Code coverage metrics are reported to Datadog for monitoring coverage trends.
4. **Test Performance Monitoring**: Test execution time is tracked to identify slow tests and performance regressions.

### Environment Variable Setup

The Datadog integration requires two environment variables to be set:

1. `DATADOG_API_KEY`: Your Datadog API key
2. `DATADOG_APP_KEY`: Your Datadog application key

You can set these variables in your `.env.local` file:

```
# Datadog API credentials for test visualization
DATADOG_API_KEY=your_api_key_here
DATADOG_APP_KEY=your_app_key_here
```

To obtain these keys:

1. Log in to your Datadog account at [app.datadoghq.com](https://app.datadoghq.com/)
2. Go to **Organization Settings** > **API Keys** to create or copy your API key
3. Go to **Organization Settings** > **Application Keys** to create or copy an application key

### Setup and Configuration

The Datadog integration is set up using the `setup-datadog-test-visualization.js` script, which configures the necessary directories, scripts, and Datadog agent.

```bash
# Set up Datadog integration
node scripts/setup-datadog-test-visualization.js
```

This script will:
1. Check if the Datadog agent is installed and running
2. Create the necessary directory structure for test results
3. Update package.json with Datadog-specific test scripts
4. Set up Datadog dashboard configuration

### Verifying Integration

To verify that the Datadog integration is working correctly, run the verification script:

```bash
# Verify Datadog integration
node scripts/verify-datadog-metrics.js
```

This script will:
1. Run a small test to generate metrics
2. Check that test result files are generated correctly
3. Query the Datadog API to verify that metrics are being received

### Dashboard

The Datadog dashboard for test visualization includes:

1. **Test Execution Overview**: Pass rate, test results breakdown, and execution time.
2. **Component Test Performance**: Component-level test metrics showing pass rates and test counts.
3. **Code Coverage Metrics**: Line, statement, function, and branch coverage over time.

## CI/CD Integration

The testing framework is integrated with CI/CD pipelines to ensure tests are run automatically on code changes.

### GitHub Actions Integration

Tests are run as part of the GitHub Actions workflow with Datadog reporting. The integration includes multiple workflows:

#### Main CI Workflow

The main CI workflow runs tests and stores artifacts:

```yaml
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: validate
    id: main-tests
    
    steps:
      # ... other steps ...
      
      - name: Run tests
        run: pnpm test
        
      - name: Store test artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: main-test-results
          path: test-results/
          retention-days: 14
```

#### Datadog Test Visualization Workflow

A dedicated workflow for Datadog test reporting:

```yaml
name: Datadog Test Visualization

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'  # Daily run at midnight UTC

jobs:
  test-with-datadog:
    name: Test with Datadog Reporting
    runs-on: ubuntu-latest
    needs: [test]
    if: always()  # Run even if the test job fails
    
    steps:
      # ... setup steps ...
      
      - name: Setup Datadog Agent
        uses: datadog/agent-github-action@v1
        with:
          api_key: ${{ secrets.DATADOG_API_KEY }}
          site: datadoghq.com
          
      - name: Run tests with Datadog reporting
        run: pnpm run test:datadog
        env:
          DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
          DATADOG_APP_KEY: ${{ secrets.DATADOG_APP_KEY }}
          
      # ... other steps ...
```

### GitHub Secrets Setup

To enable Datadog reporting in GitHub Actions, you need to add the following secrets to your repository:

1. **DATADOG_API_KEY**: Your Datadog API key
2. **DATADOG_APP_KEY**: Your Datadog application key

To add these secrets:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click on "New repository secret"
4. Add each key with its corresponding value

These secrets will be securely used in the workflow to authenticate with Datadog.

## Best Practices

### General Testing Guidelines

1. **Test Isolation**: Tests should be independent and not rely on the state from other tests.
2. **Meaningful Assertions**: Tests should make meaningful assertions about behavior, not implementation details.
3. **Mock External Dependencies**: Use mocks for external services, APIs, and databases.
4. **Test Coverage**: Aim for high test coverage, especially for critical paths and business logic.
5. **Test Readability**: Tests should be readable and serve as documentation for the code.

### Component Testing Guidelines

1. **User-Centric Testing**: Test components from the user's perspective using React Testing Library.
2. **Accessibility Testing**: Include accessibility tests for all user-facing components.
3. **Snapshot Testing**: Use snapshots judiciously, only for stable UI components.
4. **Event Testing**: Test component behavior in response to user events.

### Performance Testing Guidelines

1. **Baseline Metrics**: Establish performance baselines for key components and operations.
2. **Regular Monitoring**: Monitor test execution time to identify performance regressions.
3. **Threshold Alerts**: Set up alerts for significant deviations from baseline performance.

---

## Appendix

### Useful Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Datadog Test Monitoring](https://docs.datadoghq.com/)
- [Testing Next.js Applications](https://nextjs.org/docs/testing)

### Changelog

- **2025-04-25**: Initial documentation with Datadog integration
