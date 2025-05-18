  1. CI/CD Configuration File

  # .github/workflows/stagehand-e2e.yml
  name: Stagehand E2E Tests

  on:
    # Run on pull requests targeting main branch
    pull_request:
      branches:
        - main
      paths-ignore:
        - '**/*.md'
        - 'docs/**'

    # Run on push to main branch
    push:
      branches:
        - main
      paths-ignore:
        - '**/*.md'
        - 'docs/**'

    # Allow manual trigger
    workflow_dispatch:
      inputs:
        environment:
          description: 'Environment to run tests against'
          required: true
          default: 'staging'
          type: choice
          options:
            - development
            - staging
            - production
        test_suite:
          description: 'Test suite to run'
          required: false
          default: 'critical-paths'
          type: choice
          options:
            - all
            - critical-paths
            - authentication
            - marketplace
            - booking
            - payment

  # Set concurrency to cancel in-progress jobs when new ones are triggered
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true

  jobs:
    prepare-test-environment:
      name: Prepare Test Environment
      runs-on: ubuntu-latest
      outputs:
        test_id: ${{ steps.test-setup.outputs.test_id }}

      steps:
        - name: Checkout code
          uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'pnpm'

        - name: Install dependencies
          run: |
            pnpm install

        - name: Set up environment variables
          run: |
            if [[ "${{ github.event.inputs.environment }}" == "production" ]]; then
              echo "BASE_URL=${{ secrets.PRODUCTION_URL }}" >> $GITHUB_ENV
              echo "TEST_MODE=shadow" >> $GITHUB_ENV
            elif [[ "${{ github.event.inputs.environment }}" == "staging" ]]; then
              echo "BASE_URL=${{ secrets.STAGING_URL }}" >> $GITHUB_ENV
              echo "TEST_MODE=live" >> $GITHUB_ENV
            else
              echo "BASE_URL=http://localhost:3000" >> $GITHUB_ENV
              echo "TEST_MODE=live" >> $GITHUB_ENV
            fi

        - name: Start application (local only)
          if: ${{ env.BASE_URL == 'http://localhost:3000' }}
          run: |
            pnpm dev &
            echo "Waiting for app to start..."
            npx wait-on http://localhost:3000 -t 60000

        - name: Set up test data
          id: test-setup
          run: |
            # Generate unique test ID for this run
            TEST_ID="e2e_test_$(date +%s)_${{ github.run_id }}"
            echo "test_id=${TEST_ID}" >> $GITHUB_OUTPUT

            # Create test data via API
            if [[ "${{ env.TEST_MODE }}" == "live" ]]; then
              node scripts/ci-setup-test-data.js \
                --environment ${{ github.event.inputs.environment || 'development' }} \
                --test-id ${TEST_ID}
            fi

    run-stagehand-tests:
      name: Run Stagehand E2E Tests
      needs: prepare-test-environment
      runs-on: ubuntu-latest
      strategy:
        fail-fast: false
        matrix:
          shard: [1, 2, 3, 4]

      steps:
        - name: Checkout code
          uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'pnpm'

        - name: Install dependencies
          run: |
            pnpm install
            npx playwright install --with-deps

        - name: Start application (local only)
          if: ${{ env.BASE_URL == 'http://localhost:3000' }}
          run: |
            pnpm dev &
            echo "Waiting for app to start..."
            npx wait-on http://localhost:3000 -t 60000

        - name: Determine test suite
          id: test-suite
          run: |
            TEST_SUITE=${{ github.event.inputs.test_suite || 'critical-paths' }}
            if [[ "$TEST_SUITE" == "all" ]]; then
              TEST_PATTERN="stagehand-tests/**/*.test.ts"
            elif [[ "$TEST_SUITE" == "critical-paths" ]]; then
              TEST_PATTERN="stagehand-tests/**/signup-to-payment.test.ts stagehand-tests/**/marketplace-browse.test.ts"
            elif [[ "$TEST_SUITE" == "authentication" ]]; then
              TEST_PATTERN="stagehand-tests/**/auth*.test.ts"
            elif [[ "$TEST_SUITE" == "marketplace" ]]; then
              TEST_PATTERN="stagehand-tests/**/marketplace*.test.ts"
            elif [[ "$TEST_SUITE" == "booking" ]]; then
              TEST_PATTERN="stagehand-tests/**/booking*.test.ts"
            elif [[ "$TEST_SUITE" == "payment" ]]; then
              TEST_PATTERN="stagehand-tests/**/payment*.test.ts"
            else
              TEST_PATTERN="stagehand-tests/**/critical-paths.test.ts"
            fi
            echo "test_pattern=${TEST_PATTERN}" >> $GITHUB_OUTPUT

        - name: Run Stagehand tests
          env:
            TEST_ID: ${{ needs.prepare-test-environment.outputs.test_id }}
            BASE_URL: ${{ env.BASE_URL }}
            STAGEHAND_API_KEY: ${{ secrets.STAGEHAND_API_KEY }}
            CALENDLY_API_KEY: ${{ secrets.CALENDLY_API_KEY }}
            STRIPE_API_KEY: ${{ secrets.STRIPE_API_KEY }}
            DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
            WEBHOOK_SECRET_CALENDLY: ${{ secrets.WEBHOOK_SECRET_CALENDLY }}
            WEBHOOK_SECRET_STRIPE: ${{ secrets.WEBHOOK_SECRET_STRIPE }}
          run: |
            npx playwright test ${{ steps.test-suite.outputs.test_pattern }} \
              --shard=${{ matrix.shard }}/4 \
              --reporter=line,github,html \
              --config=stagehand-tests/playwright.config.ts
              
        - name: Upload test results
          if: always()
          uses: actions/upload-artifact@v3
          with:
            name: stagehand-test-results-${{ matrix.shard }}
            path: |
              stagehand-tests/test-results
              playwright-report

    cleanup-test-data:
      name: Clean up Test Data
      needs: [prepare-test-environment, run-stagehand-tests]
      runs-on: ubuntu-latest
      if: always()
      steps:
        - name: Checkout code
          uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'pnpm'

        - name: Install dependencies
          run: |
            pnpm install

        - name: Clean up test data
          run: |
            # Only run cleanup in live test mode
            if [[ "${{ env.TEST_MODE }}" == "live" ]]; then
              node scripts/ci-cleanup-test-data.js \
                --environment ${{ github.event.inputs.environment || 'development' }} \
                --test-id ${{ needs.prepare-test-environment.outputs.test_id }}
            fi

    report-results:
      name: Report Test Results
      needs: [run-stagehand-tests, cleanup-test-data]
      runs-on: ubuntu-latest
      if: always()
      steps:
        - name: Download all artifacts
          uses: actions/download-artifact@v3
          with:
            path: artifacts

        - name: Merge test reports
          run: |
            mkdir -p merged-report
            npx playwright merge-reports --reporter html ./artifacts/stagehand-test-results*

        - name: Upload merged report
          uses: actions/upload-artifact@v3
          with:
            name: merged-stagehand-report
            path: merged-report

        - name: Send notification
          if: always()
          uses: slackapi/slack-github-action@v1.23.0
          with:
            channel-id: 'e2e-test-results'
            slack-message: |
              *Stagehand E2E Test Results*
              Workflow: ${{ github.workflow }}
              Repository: ${{ github.repository }}
              Branch: ${{ github.ref_name }}
              Status: ${{ job.status }}
              Environment: ${{ github.event.inputs.environment || 'development' }}
              Test Suite: ${{ github.event.inputs.test_suite || 'critical-paths' }}
              Test Run ID: ${{ needs.prepare-test-environment.outputs.test_id }}
              See details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
          env:
            SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

  2. CI/CD Test Data Management Scripts

  // scripts/ci-setup-test-data.js
  const fs = require('fs');
  const path = require('path');
  const fetch = require('node-fetch');
  const { program } = require('commander');

  // Parse command line arguments
  program
    .option('--environment <env>', 'Environment to run tests against', 'development')
    .option('--test-id <id>', 'Unique test ID for this run')
    .parse(process.argv);

  const options = program.opts();

  // Base URL for the environment
  const baseUrls = {
    development: 'http://localhost:3000',
    staging: process.env.STAGING_URL,
    production: process.env.PRODUCTION_URL
  };

  const baseUrl = baseUrls[options.environment] || baseUrls.development;
  const testId = options.test_id || `ci_test_${Date.now()}`;

  console.log(`Setting up test data for ${options.environment} environment with ID ${testId}`);

  // Setup test data
  async function setupTestData() {
    try {
      // Create API endpoint URL
      const setupUrl = `${baseUrl}/api/test/setup-ci-data`;

      // Send setup request
      const response = await fetch(setupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-CI': 'true'
        },
        body: JSON.stringify({
          testId,
          environment: options.environment,
          testData: {
            builders: 5,  // Number of test builders to create
            clients: 3,   // Number of test clients to create
            sessionTypes: true,  // Create session types for builders
            bookings: 2   // Number of test bookings to create
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to setup test data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Test data setup complete. Created: ${JSON.stringify(result.created)}`);

      // Save test data reference to a file for use by tests
      const testDataPath = path.join(process.cwd(), 'stagehand-tests', 'test-data', 'ci-test-data.json');

      // Ensure directory exists
      const testDataDir = path.dirname(testDataPath);
      if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir, { recursive: true });
      }

      // Write data file
      fs.writeFileSync(
        testDataPath,
        JSON.stringify({
          testId,
          environment: options.environment,
          baseUrl,
          created: result.created,
          entities: result.entities || {},
          timestamp: new Date().toISOString()
        }, null, 2)
      );

      console.log(`Test data reference saved to ${testDataPath}`);

      // Success
      process.exit(0);
    } catch (error) {
      console.error('Error setting up test data:', error);
      process.exit(1);
    }
  }

  // Run setup
  setupTestData();

  // scripts/ci-cleanup-test-data.js
  const fs = require('fs');
  const path = require('path');
  const fetch = require('node-fetch');
  const { program } = require('commander');

  // Parse command line arguments
  program
    .option('--environment <env>', 'Environment to run tests against', 'development')
    .option('--test-id <id>', 'Unique test ID for this run')
    .parse(process.argv);

  const options = program.opts();

  // Base URL for the environment
  const baseUrls = {
    development: 'http://localhost:3000',
    staging: process.env.STAGING_URL,
    production: process.env.PRODUCTION_URL
  };

  const baseUrl = baseUrls[options.environment] || baseUrls.development;
  const testId = options.test_id;

  if (!testId) {
    console.error('Test ID is required');
    process.exit(1);
  }

  console.log(`Cleaning up test data for ${options.environment} environment with ID ${testId}`);

  // Clean up test data
  async function cleanupTestData() {
    try {
      // Create API endpoint URL
      const cleanupUrl = `${baseUrl}/api/test/cleanup-ci-data`;

      // Send cleanup request
      const response = await fetch(cleanupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-CI': 'true'
        },
        body: JSON.stringify({
          testId,
          environment: options.environment
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to cleanup test data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Test data cleanup complete. Removed: ${JSON.stringify(result.removed)}`);

      // Optionally delete the test data reference file
      const testDataPath = path.join(process.cwd(), 'stagehand-tests', 'test-data', 'ci-test-data.json');
      if (fs.existsSync(testDataPath)) {
        fs.unlinkSync(testDataPath);
        console.log(`Deleted test data reference file ${testDataPath}`);
      }

      // Success
      process.exit(0);
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      process.exit(1);
    }
  }

  // Run cleanup
  cleanupTestData();

  3. Stagehand CI/CD Integration Configuration

  // stagehand-tests/config/ci-integration.ts
  import { WebhookTester, WebhookSource } from '../framework/webhook/webhook-tester';
  import { VisualVerifier } from '../framework/visual/visual-verifier';
  import { ProductionTestDataManager } from '../framework/production-test-data';

  /**
   * CI environment configuration
   */
  export interface CIEnvironmentConfig {
    baseUrl: string;
    testMode: 'live' | 'shadow' | 'mock';
    testDataScope: 'ephemeral' | 'persistent_session' | 'persistent_environment';
    maxTestDuration: number; // in milliseconds
    takeScreenshots: boolean;
    webhookTimeouts: number; // in milliseconds
    useBuiltInTestUsers: boolean;
    visualCheckStrictness: 'strict' | 'normal' | 'relaxed';
  }

  /**
   * Parse CI environment variables to get configuration
   */
  export function getCIConfig(): CIEnvironmentConfig {
    // Get environment variables
    const {
      TEST_ID = '',
      BASE_URL = 'http://localhost:3000',
      TEST_ENV = 'development',
      TEST_MODE = 'live',
      TEST_DATA_SCOPE = 'ephemeral',
      MAX_TEST_DURATION = '300000', // 5 minutes
      TAKE_SCREENSHOTS = 'true',
      WEBHOOK_TIMEOUT = '10000', // 10 seconds
      USE_BUILT_IN_TEST_USERS = 'true',
      VISUAL_CHECK_STRICTNESS = 'normal'
    } = process.env;

    // Return configuration
    return {
      baseUrl: BASE_URL,
      testMode: (TEST_MODE as 'live' | 'shadow' | 'mock') || 'live',
      testDataScope: (TEST_DATA_SCOPE as 'ephemeral' | 'persistent_session' | 'persistent_environment') || 'ephemeral',
      maxTestDuration: parseInt(MAX_TEST_DURATION, 10) || 300000,
      takeScreenshots: TAKE_SCREENSHOTS !== 'false',
      webhookTimeouts: parseInt(WEBHOOK_TIMEOUT, 10) || 10000,
      useBuiltInTestUsers: USE_BUILT_IN_TEST_USERS !== 'false',
      visualCheckStrictness: (VISUAL_CHECK_STRICTNESS as 'strict' | 'normal' | 'relaxed') || 'normal'
    };
  }

  /**
   * Get test data manager configured for CI
   */
  export function getTestDataManager(
    baseUrl: string = getCIConfig().baseUrl,
    testId: string = process.env.TEST_ID || ''
  ): ProductionTestDataManager {
    const config = getCIConfig();

    return new ProductionTestDataManager(baseUrl, {
      scope: config.testDataScope,
      maxAgeMinutes: config.maxTestDuration / (60 * 1000), // convert to minutes
      testUserEmail: `ci-${testId}@example.com`
    });
  }

  /**
   * Get webhook tester configured for CI
   */
  export function getWebhookTester(
    page: Page,
    stagehand: Stagehand,
    baseUrl: string = getCIConfig().baseUrl
  ): WebhookTester {
    return new WebhookTester(page, stagehand, {
      baseUrl,
      endpoints: {
        [WebhookSource.CALENDLY]: '/api/webhooks/calendly',
        [WebhookSource.STRIPE]: '/api/webhooks/stripe'
      },
      secrets: {
        [WebhookSource.CALENDLY]: process.env.WEBHOOK_SECRET_CALENDLY || 'test-secret',
        [WebhookSource.STRIPE]: process.env.WEBHOOK_SECRET_STRIPE || 'whsec_test'
      },
      verificationEndpoint: '/api/test/verify-webhook'
    });
  }

  /**
   * Get visual verifier configured for CI
   */
  export function getVisualVerifier(
    page: Page,
    stagehand: Stagehand
  ): VisualVerifier {
    const config = getCIConfig();

    return new VisualVerifier(page, stagehand, {
      screenshotDir: './visual-test-results',
      takeScreenshots: config.takeScreenshots,
      detailedLogs: true
    });
  }

  /**
   * Load CI test data
   */
  export async function loadCITestData(): Promise<any> {
    try {
      // Try to load data from file
      const testDataPath = './test-data/ci-test-data.json';
      const data = await import(testDataPath);
      return data;
    } catch (error) {
      console.warn('Could not load CI test data:', error);
      return null;
    }
  }

  4. Stagehand Playwright CI Configuration

  // stagehand-tests/playwright.config.ts
  import { PlaywrightTestConfig, devices } from '@playwright/test';
  import { getCIConfig } from './config/ci-integration';

  // Get CI configuration
  const ciConfig = getCIConfig();

  // Default Playwright config
  const config: PlaywrightTestConfig = {
    // Use staging directory for test results
    testDir: '.',
    outputDir: 'test-results',

    // Timeout settings
    timeout: ciConfig.maxTestDuration,
    expect: {
      timeout: 10000,
    },

    // Run 1 test at a time on CI to reduce flakiness
    fullyParallel: process.env.CI ? false : true,

    // Pass environment variables
    use: {
      // Base URL for tests
      baseURL: ciConfig.baseUrl,

      // Launch headless in CI, with headed browser in development
      headless: process.env.CI ? true : false,

      // Record traces in CI for debugging
      trace: process.env.CI ? 'retain-on-failure' : 'off',

      // Record videos for failures in CI
      video: process.env.CI ? 'retain-on-failure' : 'off',

      // Pass test ID to tests
      testIdAttribute: 'data-testid',

      // Custom user agent to identify test requests
      userAgent: `StagehandE2ETest/${process.env.TEST_ID || 'local'}`,

      // Default viewport size (desktop)
      viewport: { width: 1280, height: 720 },

      // Ignore HTTPS errors when hitting test environments
      ignoreHTTPSErrors: true,

      // Custom environment variables
      launchOptions: {
        env: {
          // Pass through test configuration
          TEST_ID: process.env.TEST_ID || '',
          TEST_ENV: process.env.TEST_ENV || 'development',
          TEST_MODE: ciConfig.testMode,
          STAGEHAND_API_KEY: process.env.STAGEHAND_API_KEY || '',
          CALENDLY_API_KEY: process.env.CALENDLY_API_KEY || '',
          STRIPE_API_KEY: process.env.STRIPE_API_KEY || '',
          WEBHOOK_SECRET_CALENDLY: process.env.WEBHOOK_SECRET_CALENDLY || 'test-secret',
          WEBHOOK_SECRET_STRIPE: process.env.WEBHOOK_SECRET_STRIPE || 'whsec_test'
        }
      }
    },

    // Configure test projects for different devices/scenarios
    projects: [
      // Main desktop project
      {
        name: 'chromium',
        use: {
          ...devices['Desktop Chrome']
        }
      },

      // Mobile project (separate from main runs)
      {
        name: 'mobile',
        use: {
          ...devices['iPhone 13']
        },
        grep: /@mobile/,
        testIgnore: /.*\.desktop\.test\.ts/
      },

      // Visual verification project
      {
        name: 'visual',
        use: {
          ...devices['Desktop Chrome'],
        },
        grep: /@visual/
      }
    ],

    // Report configuration
    reporter: [
      ['list'],
      ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ['json', { outputFile: 'test-results/stagehand-results.json' }]
    ],

    // Web server (for local development)
    webServer: process.env.CI ? undefined : {
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000, // 2 minutes
    }
  };

  export default config;