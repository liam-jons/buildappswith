# GitHub Actions CI Workflow for Testing

## Overview

This document describes the GitHub Actions CI workflow for E2E and visual regression tests in the BuildAppsWith platform. It provides automated testing infrastructure for pull requests and scheduled runs.

**Date**: May 8, 2025  
**Branch**: feature/testing-enhancement  
**Status**: Approved

## CI/CD Pipeline Structure

The testing CI/CD pipeline is structured around these core components:

1. **Database Setup**: Creates and configures isolated test databases
2. **E2E Testing**: Runs E2E tests with parallelization by domain
3. **Visual Testing**: Performs visual regression testing
4. **Report Generation**: Consolidates and visualizes test results

## Main Workflow File

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  # Run on pull requests to main branch
  pull_request:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - 'docs/**'
  
  # Run on pushes to main branch
  push:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - 'docs/**'
  
  # Scheduled runs for regression testing
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  
  # Manual trigger
  workflow_dispatch:
    inputs:
      debug:
        description: 'Enable debug mode'
        required: false
        default: false
        type: boolean
      test-suite:
        description: 'Test suite to run (leave empty for all)'
        required: false
        type: string

# Allow cancellation of workflow runs when new commits are pushed to the same PR
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  # Playwright settings
  PLAYWRIGHT_BROWSERS: "chromium,firefox,webkit"
  PLAYWRIGHT_HTML_REPORT: playwright-report
  
  # Test database URL
  TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/buildappswith_test
  
  # Test seed configuration
  SEED_PROFILE_DATA: "true"
  SEED_BOOKING_FLOW: "true"
  SEED_MARKETPLACE: "true"
  SEED_PAYMENT_TESTING: "true"
  
  # Node / PNPM settings
  NODE_OPTIONS: "--max-old-space-size=4096"
  PNPM_VERSION: 8.x
  NODE_VERSION: 18.x

jobs:
  # Database setup job
  setup-test-db:
    name: Setup Test Database
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    outputs:
      database-ready: true
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          run_install: false
      
      - name: Create test database
        run: |
          PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE buildappswith_test;"
          echo "Created test database: buildappswith_test"
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Apply database migrations
        run: |
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
      
      - name: Verify database setup
        run: |
          PGPASSWORD=postgres psql -h localhost -U postgres -d buildappswith_test -c "\dt"
          echo "Database schema created successfully"

  # E2E test job
  e2e-tests:
    name: E2E Tests
    needs: setup-test-db
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: buildappswith_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    strategy:
      # Continue testing other test suites even if one fails
      fail-fast: false
      matrix:
        # Split tests by domain for parallelization
        test-suite: [auth, booking, marketplace]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          run_install: false
      
      - name: Get PNPM store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT
      
      - name: Setup PNPM cache
        uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Set up Playwright
        run: pnpm exec playwright install --with-deps ${{ env.PLAYWRIGHT_BROWSERS }}
      
      - name: Verify database connection
        run: |
          PGPASSWORD=postgres psql -h localhost -U postgres -d buildappswith_test -c "SELECT 'Database connection successful';"
      
      - name: Apply database migrations
        run: |
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
      
      - name: Start development server
        run: |
          pnpm dev & 
          echo $! > server.pid
          sleep 15  # Wait for server to start
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
      
      - name: Run E2E tests
        run: |
          # If specific test suite is requested via manual trigger
          if [ "${{ github.event.inputs.test-suite }}" != "" ]; then
            pnpm exec playwright test ${{ github.event.inputs.test-suite }}
          else
            # Run based on matrix
            pnpm exec playwright test ${{ matrix.test-suite }}
          fi
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
          DEBUG: ${{ github.event.inputs.debug == 'true' && 'pw:api' || '' }}
      
      - name: Stop development server
        if: always()
        run: |
          if [ -f server.pid ]; then
            kill $(cat server.pid) || true
            rm server.pid
          fi
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.test-suite }}
          path: playwright-report/
          retention-days: 30
      
      - name: Upload test traces
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-traces-${{ matrix.test-suite }}
          path: test-results/
          retention-days: 7

  # Visual regression tests job
  visual-tests:
    name: Visual Regression Tests
    needs: setup-test-db
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: buildappswith_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          run_install: false
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Set up Playwright 
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Apply database migrations
        run: |
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
      
      - name: Start development server
        run: |
          pnpm dev &
          echo $! > server.pid
          sleep 15  # Wait for server to start
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
      
      - name: Get previous visual baselines
        id: cached-snapshots
        uses: actions/cache@v3
        with:
          path: __tests__/e2e/visual/**/*-snapshots
          key: visual-snapshots-${{ hashFiles('__tests__/e2e/visual/**/*.test.ts') }}
          restore-keys: |
            visual-snapshots-
      
      - name: Run visual regression tests
        run: pnpm exec playwright test --config=playwright.visual.config.ts
        env:
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
      
      - name: Stop development server
        if: always()
        run: |
          if [ -f server.pid ]; then
            kill $(cat server.pid) || true
            rm server.pid
          fi
      
      - name: Upload visual test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: visual-test-report
          path: |
            playwright-report/
            test-results/visual/
          retention-days: 30
      
      - name: Update visual baselines if on main branch
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          # Only update baselines on pushes to main
          pnpm exec playwright test --config=playwright.visual.config.ts --update-snapshots
          
          # Configure git if we need to commit changes
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          
          # Check if snapshots have changed
          if [[ -n $(git status -s | grep snapshots) ]]; then
            git add __tests__/e2e/visual/**/*-snapshots
            git commit -m "Update visual test baselines [skip ci]"
            git push
          fi

  # Report generation job
  generate-report:
    name: Generate Test Report
    needs: [e2e-tests, visual-tests]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          run_install: false
      
      - name: Install reporting tools
        run: pnpm install -g playwright-merge-html-reports
      
      - name: Download all test results
        uses: actions/download-artifact@v3
        with:
          path: all-results
      
      - name: Merge HTML reports
        run: |
          playwright-merge-html-reports --reports-dir=all-results/playwright-report-*/,all-results/visual-test-report/ --output-dir=merged-report
      
      - name: Upload merged report
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-report
          path: merged-report/
          retention-days: 30
      
      - name: Send report to Datadog
        if: github.ref == 'refs/heads/main' || github.event_name == 'schedule'
        run: |
          # Install Datadog reporter
          pnpm install
          
          # Process test results and send to Datadog
          node scripts/datadog/coverage-processor.js
        env:
          DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
          DATADOG_APP_KEY: ${{ secrets.DATADOG_APP_KEY }}
```

## Pull Request Checks Workflow

For faster checks on pull requests, a lightweight workflow is available:

```yaml
# .github/workflows/pr-checks.yml
name: Pull Request Checks

on:
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: 18.x
  PNPM_VERSION: 8.x
  TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/buildappswith_test

jobs:
  e2e-critical-paths:
    name: Critical Path Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: buildappswith_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          run_install: false
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Set up Playwright
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Apply database migrations
        run: |
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
      
      - name: Start development server
        run: |
          pnpm dev &
          echo $! > server.pid
          sleep 15
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
      
      - name: Run critical path tests
        run: |
          # Only run critical path tests for PR checks
          pnpm exec playwright test --project=chromium auth/signin.test.ts auth/signup.test.ts booking/booking-flow.test.ts marketplace/browse-experience.test.ts
        env:
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
      
      - name: Stop development server
        if: always()
        run: |
          if [ -f server.pid ]; then
            kill $(cat server.pid) || true
            rm server.pid
          fi
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: critical-path-test-report
          path: playwright-report/
          retention-days: 7
```

## Test Reporting and Visualization Integration

For comprehensive test reporting, the workflow includes Datadog integration:

```javascript
// scripts/datadog/test-reporter.js
const { Client } = require('@datadog/datadog-api-client');
const fs = require('fs');
const path = require('path');

// Initialize Datadog client
const datadog = new Client({
  authMethods: {
    apiKeyAuth: process.env.DATADOG_API_KEY,
    appKeyAuth: process.env.DATADOG_APP_KEY
  }
});

async function processTestResults() {
  const timestamp = Math.floor(Date.now() / 1000);
  const branchName = process.env.GITHUB_REF_NAME || 'unknown';
  const commitSha = process.env.GITHUB_SHA || 'unknown';
  
  // Read Playwright results
  const playwrightResultsPath = path.resolve(__dirname, '../../test-results/e2e/playwright-results.json');
  const playwrightResults = JSON.parse(fs.readFileSync(playwrightResultsPath, 'utf8'));
  
  // Process results for Datadog metrics
  const metrics = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let totalDuration = 0;
  
  // Process test suites
  playwrightResults.suites.forEach(suite => {
    processSuite(suite);
  });
  
  function processSuite(suite) {
    if (suite.suites) {
      suite.suites.forEach(childSuite => {
        processSuite(childSuite);
      });
    }
    
    if (suite.specs) {
      suite.specs.forEach(spec => {
        totalTests++;
        totalDuration += spec.tests.reduce((sum, test) => sum + test.duration, 0);
        
        if (spec.tests.some(test => test.status === 'failed')) {
          failedTests++;
        } else if (spec.tests.some(test => test.status === 'skipped')) {
          skippedTests++;
        } else {
          passedTests++;
        }
        
        // Add test-specific metrics
        metrics.push({
          metric: 'e2e.test.duration',
          points: [
            {
              timestamp: timestamp,
              value: spec.tests.reduce((sum, test) => sum + test.duration, 0) / 1000
            }
          ],
          tags: [
            `test_name:${spec.title}`,
            `suite:${suite.title}`,
            `status:${spec.tests[0].status}`,
            `branch:${branchName}`,
            `commit:${commitSha}`
          ]
        });
      });
    }
  }
  
  // Add summary metrics
  metrics.push(
    {
      metric: 'e2e.tests.total',
      points: [{ timestamp, value: totalTests }],
      tags: [`branch:${branchName}`, `commit:${commitSha}`]
    },
    {
      metric: 'e2e.tests.passed',
      points: [{ timestamp, value: passedTests }],
      tags: [`branch:${branchName}`, `commit:${commitSha}`]
    },
    {
      metric: 'e2e.tests.failed',
      points: [{ timestamp, value: failedTests }],
      tags: [`branch:${branchName}`, `commit:${commitSha}`]
    },
    {
      metric: 'e2e.tests.skipped',
      points: [{ timestamp, value: skippedTests }],
      tags: [`branch:${branchName}`, `commit:${commitSha}`]
    },
    {
      metric: 'e2e.tests.duration',
      points: [{ timestamp, value: totalDuration / 1000 }],
      tags: [`branch:${branchName}`, `commit:${commitSha}`]
    },
    {
      metric: 'e2e.tests.pass_rate',
      points: [{ timestamp, value: totalTests > 0 ? passedTests / totalTests * 100 : 0 }],
      tags: [`branch:${branchName}`, `commit:${commitSha}`]
    }
  );
  
  // Submit metrics to Datadog
  try {
    await datadog.v2.metricsApi.submitMetrics({ body: { series: metrics } });
    console.log('Successfully submitted test metrics to Datadog');
  } catch (error) {
    console.error('Error submitting metrics to Datadog:', error);
    process.exit(1);
  }
}

processTestResults().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
```

## Datadog Dashboard Template

Visualization is provided through a Datadog dashboard:

```json
// datadog-dashboard-template.json
{
  "title": "E2E Test Dashboard",
  "description": "End-to-end test results for the BuildAppsWith platform",
  "widgets": [
    {
      "definition": {
        "type": "timeseries",
        "requests": [
          {
            "q": "sum:e2e.tests.pass_rate{$branch}",
            "display_type": "area"
          }
        ],
        "title": "Pass Rate (%) by Branch",
        "show_legend": true
      }
    },
    {
      "definition": {
        "type": "group",
        "widgets": [
          {
            "definition": {
              "type": "query_value",
              "requests": [
                {
                  "q": "sum:e2e.tests.total{$branch,$commit}.as_count()",
                  "aggregator": "last"
                }
              ],
              "title": "Total Tests"
            }
          },
          {
            "definition": {
              "type": "query_value",
              "requests": [
                {
                  "q": "sum:e2e.tests.passed{$branch,$commit}.as_count()",
                  "aggregator": "last"
                }
              ],
              "title": "Passed Tests"
            }
          },
          {
            "definition": {
              "type": "query_value",
              "requests": [
                {
                  "q": "sum:e2e.tests.failed{$branch,$commit}.as_count()",
                  "aggregator": "last"
                }
              ],
              "title": "Failed Tests"
            }
          }
        ]
      }
    },
    {
      "definition": {
        "type": "timeseries",
        "requests": [
          {
            "q": "avg:e2e.test.duration{$branch} by {test_name}.rollup(avg)",
            "display_type": "line"
          }
        ],
        "title": "Test Duration by Test Name (s)",
        "show_legend": true
      }
    },
    {
      "definition": {
        "type": "toplist",
        "requests": [
          {
            "q": "top(avg:e2e.test.duration{$branch} by {test_name}.rollup(avg), 10, 'mean', 'desc')"
          }
        ],
        "title": "Top 10 Slowest Tests (s)"
      }
    },
    {
      "definition": {
        "type": "toplist",
        "requests": [
          {
            "q": "top(sum:e2e.tests.failed{$branch} by {test_name}.as_count(), 10, 'sum', 'desc')"
          }
        ],
        "title": "Top 10 Most Failing Tests"
      }
    }
  ],
  "template_variables": [
    {
      "name": "branch",
      "default": "main",
      "prefix": "branch"
    },
    {
      "name": "commit",
      "prefix": "commit"
    }
  ],
  "layout_type": "ordered"
}
```

## Implementation Considerations

### Environment Variables

The workflow uses these key environment variables:

- `TEST_DATABASE_URL`: Connection string for test database
- `PLAYWRIGHT_BROWSERS`: Browsers to install and test with
- `PLAYWRIGHT_TEST_BASE_URL`: Base URL for E2E tests
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication key
- `CLERK_SECRET_KEY`: Clerk secret key for authentication
- `DATADOG_API_KEY` and `DATADOG_APP_KEY`: Datadog credentials

### Test Data Isolation

For CI environments, the workflow:

1. Creates job-specific test database instances
2. Applies database migrations to each instance
3. Seeds test data for each test suite
4. Resets data between test runs

### Performance Optimization

The workflow optimizes performance with:

1. Test parallelization by domain (auth, booking, marketplace)
2. Custom PR-specific workflow for faster checks
3. Browser-specific test runs
4. Artifact management to reduce storage costs

### Reliability Features

To ensure reliable test execution:

1. Health checks for database services
2. Explicit wait times for service startup
3. Proper cleanup in 'always' blocks
4. Retries for potentially flaky tests

## Usage Guide

### Running Locally

To simulate the CI workflow locally:

```bash
# Create test database
createdb buildappswith_test

# Apply migrations
DATABASE_URL=postgresql://localhost:5432/buildappswith_test pnpm prisma migrate deploy

# Run specific test domains
pnpm exec playwright test auth/
pnpm exec playwright test booking/
pnpm exec playwright test marketplace/

# Run visual tests
pnpm exec playwright test --config=playwright.visual.config.ts

# Update visual baselines
pnpm exec playwright test --config=playwright.visual.config.ts --update-snapshots
```

### Triggering Manual Runs

The workflow can be triggered manually with options:

1. In GitHub UI: Actions → E2E Tests → Run workflow
2. Debug mode: Enables detailed logging for troubleshooting
3. Test suite: Run specific test suites only

### Viewing Results

Test results are available in several formats:

1. GitHub Actions Summary tab
2. Artifacts containing HTML reports
3. Datadog dashboard for historical trends
4. Failure traces for failed tests

## Benefits

1. **Reliability**: Ensures code changes don't break existing functionality
2. **Visibility**: Provides clear visualization of test results and trends
3. **Speed**: Optimizes pipeline for faster feedback with parallelization
4. **Isolation**: Ensures tests run in clean, isolated environments
5. **Coverage**: Tests across multiple browsers and devices

## Implementation Timeline

1. **Phase 1**: Basic workflow setup with test database (Completed)
2. **Phase 2**: Test parallelization by domain (Completed)
3. **Phase 3**: Visual testing integration (Completed)
4. **Phase 4**: Reporting and Datadog integration (Completed)
5. **Phase 5**: Performance optimizations (Planned)