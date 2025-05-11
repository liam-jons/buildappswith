#!/usr/bin/env node
/**
 * Advanced Debug script for MSW-related test issues
 *
 * Usage:
 *   node ./scripts/debug-msw.js [options]
 *
 * Options:
 *   --test <pattern>        Run specific tests matching pattern
 *   --verify-mock-setup     Only verify MSW setup, don't run tests
 *   --check-internals       Check internal MSW state
 *   --fix-common-issues     Attempt to fix common issues
 *   --help                  Show this help message
 *
 * Examples:
 *   node ./scripts/debug-msw.js --test "auth-flow"
 *   node ./scripts/debug-msw.js --verify-mock-setup
 *   node ./scripts/debug-msw.js --check-internals
 *   node ./scripts/debug-msw.js --fix-common-issues
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Make exec return a promise
const execAsync = promisify(exec);

// Console colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  testPattern: null,
  verifyMockSetup: false,
  checkInternals: false,
  fixCommonIssues: false,
  showHelp: false
};

// Check for options
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--test' && i + 1 < args.length) {
    options.testPattern = args[i + 1];
    i++;
  } else if (arg === '--verify-mock-setup') {
    options.verifyMockSetup = true;
  } else if (arg === '--check-internals') {
    options.checkInternals = true;
  } else if (arg === '--fix-common-issues') {
    options.fixCommonIssues = true;
  } else if (arg === '--help') {
    options.showHelp = true;
  }
}

// Show help message
if (options.showHelp) {
  console.log(`
${colors.bold}${colors.cyan}MSW Debug Tool${colors.reset}

${colors.bold}Usage:${colors.reset}
  node ./scripts/debug-msw.js [options]

${colors.bold}Options:${colors.reset}
  --test <pattern>        Run specific tests matching pattern
  --verify-mock-setup     Only verify MSW setup, don't run tests
  --check-internals       Check internal MSW state
  --fix-common-issues     Attempt to fix common issues
  --help                  Show this help message

${colors.bold}Examples:${colors.reset}
  node ./scripts/debug-msw.js --test "auth-flow"
  node ./scripts/debug-msw.js --verify-mock-setup
  node ./scripts/debug-msw.js --check-internals
  node ./scripts/debug-msw.js --fix-common-issues
  `);
  process.exit(0);
}

// Display header
console.log(`${colors.bold}${colors.cyan}MSW Debug Tool${colors.reset}`);
console.log(`${colors.cyan}=============================${colors.reset}\n`);

// Check package.json for dependencies
console.log(`${colors.bold}Checking dependencies...${colors.reset}`);
const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Check MSW version
const mswVersion = pkg.dependencies?.msw || pkg.devDependencies?.msw;
if (!mswVersion) {
  console.log(`${colors.red}❌ MSW is not installed! Run: pnpm add -D msw${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}✓ MSW installed: ${mswVersion}${colors.reset}`);

  // Check major version of MSW
  const majorVersion = parseInt(mswVersion.match(/^\^?(\d+)/)?.[1] || '0');
  if (majorVersion < 1) {
    console.log(`${colors.yellow}⚠️ You're using MSW v0.x. Consider upgrading to MSW v1.x${colors.reset}`);
  } else if (majorVersion >= 2) {
    console.log(`${colors.blue}ℹ️ You're using MSW v2.x, which has significant API changes from v1.x${colors.reset}`);
  }
}

// Check for common MSW-related dependencies
const dependencies = [
  'vitest',
  '@testing-library/react',
  '@testing-library/jest-dom',
  '@testing-library/user-event'
];

for (const dep of dependencies) {
  const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
  if (!version) {
    console.log(`${colors.yellow}⚠️ ${dep} is not installed!${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ ${dep} installed: ${version}${colors.reset}`);
  }
}

// Check for MSW-related files
console.log(`\n${colors.bold}Checking MSW setup files...${colors.reset}`);
const requiredFiles = [
  { path: '__tests__/mocks/server.ts', required: true, patterns: {
    'setupServer': { desc: 'setupServer import from msw/node', critical: true },
    'mockServer': { desc: 'mockServer export', critical: true },
    'singleton': { desc: 'singleton pattern implementation', critical: false, regex: /let\s+(\w+Instance|mockServerInstance|serverInstance)/i },
    'enableMockServerLogging': { desc: 'logging functionality', critical: false }
  }},
  { path: '__tests__/mocks/handlers.ts', required: true, patterns: {
    'http': { desc: 'http import from msw', critical: true },
    'export const handlers': { desc: 'handlers export', critical: true },
    'HttpResponse': { desc: 'HttpResponse usage for MSW v2+', critical: false }
  }},
  { path: '__tests__/mocks/initMocks.ts', required: true, patterns: {
    'mockServer': { desc: 'mockServer import', critical: true },
    'setupMockServer': { desc: 'setupMockServer function', critical: true },
    'resetMockServerHandlers': { desc: 'resetMockServerHandlers function', critical: false },
    'beforeAll': { desc: 'beforeAll hook', critical: true },
    'afterEach': { desc: 'afterEach hook', critical: true },
    'afterAll': { desc: 'afterAll hook', critical: true }
  }},
  { path: 'vitest.setup.ts', required: true, patterns: {
    'setupMockServer': { desc: 'setupMockServer usage', critical: true },
    'setupGlobalMocks': { desc: 'setupGlobalMocks usage', critical: false },
    'DEBUG_MSW': { desc: 'DEBUG_MSW environment variable support', critical: false }
  }},
  { path: '__tests__/utils/api-test-utils.ts', required: false, patterns: {
    'apiMock': { desc: 'apiMock helper', critical: false },
    'mockServer': { desc: 'mockServer import', critical: false },
    'get': { desc: 'get method', critical: false },
    'post': { desc: 'post method', critical: false },
    'reset': { desc: 'reset method', critical: false }
  }},
  { path: '__tests__/unit/msw-integration.test.ts', required: false, patterns: {
    'describe': { desc: 'test suite setup', critical: false },
    'mockServer': { desc: 'mockServer import', critical: false },
    'apiMock': { desc: 'apiMock usage', critical: false }
  }}
];

let criticalIssuesFound = false;

for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file.path);
  if (fs.existsSync(filePath)) {
    console.log(`${colors.green}✓ ${file.path} exists${colors.reset}`);

    // Check for pattern issues
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const patterns = file.patterns || {};

    for (const [pattern, details] of Object.entries(patterns)) {
      const found = details.regex
        ? details.regex.test(content)
        : content.includes(pattern);

      if (!found) {
        const issueText = `${details.critical ? '❌' : '⚠️'} Missing ${details.desc}`;
        issues.push(issueText);

        if (details.critical) {
          criticalIssuesFound = true;
        }
      }
    }

    if (issues.length > 0) {
      console.log(`  ${colors.yellow}Issues found in ${file.path}:${colors.reset}`);
      issues.forEach(issue => console.log(`  ${colors.yellow}${issue}${colors.reset}`));
    }
  } else if (file.required) {
    console.log(`${colors.red}❌ Required file ${file.path} does not exist!${colors.reset}`);
    criticalIssuesFound = true;
  } else {
    console.log(`${colors.yellow}⚠️ Optional file ${file.path} does not exist${colors.reset}`);
  }
}

// Attempt to fix common issues if requested
if (options.fixCommonIssues && criticalIssuesFound) {
  console.log(`\n${colors.bold}${colors.cyan}Attempting to fix common issues...${colors.reset}`);

  // Fix missing package dependencies
  if (!mswVersion) {
    console.log(`${colors.blue}Installing MSW...${colors.reset}`);
    execSync('pnpm add -D msw', { stdio: 'inherit' });
  }

  // Create missing files from templates if they don't exist
  for (const file of requiredFiles) {
    if (file.required && !fs.existsSync(path.join(process.cwd(), file.path))) {
      console.log(`${colors.blue}Creating template for ${file.path}...${colors.reset}`);

      // Create directory if it doesn't exist
      const dirname = path.dirname(path.join(process.cwd(), file.path));
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }

      // Create file with basic template
      if (file.path.includes('server.ts')) {
        fs.writeFileSync(path.join(process.cwd(), file.path),
`import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Singleton pattern state tracking
let mockServerInstance = null;
let isLoggingEnabled = false;

/**
 * Get the MSW server singleton - creates it only once
 * @returns The MSW server instance
 */
function getMockServer() {
  if (!mockServerInstance) {
    // Create the server with default handlers
    mockServerInstance = setupServer(...handlers);
  }

  return mockServerInstance;
}

// Export the singleton getter
export const mockServer = getMockServer();

/**
 * Enable detailed request/response logging for MSW
 */
export function enableMockServerLogging() {
  if (isLoggingEnabled) return;
  isLoggingEnabled = true;

  mockServer.events.on('request:start', ({ request }) => {
    console.log(\`[MSW] Request: \${request.method} \${request.url}\`);
  });

  mockServer.events.on('response:mocked', ({ request, response }) => {
    console.log(\`[MSW] Mocked: \${request.method} \${request.url} → \${response.status}\`);
  });

  mockServer.events.on('response:bypass', ({ request }) => {
    console.warn(\`[MSW] Bypassed: \${request.method} \${request.url}\`);
  });
}`);
      } else if (file.path.includes('handlers.ts')) {
        fs.writeFileSync(path.join(process.cwd(), file.path),
`import { http, HttpResponse } from 'msw';

// Export combined handlers
export const handlers = [
  // Default fallback handler for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(\`Unhandled request: \${request.method} \${request.url}\`);
    return new HttpResponse(null, { status: 404 });
  }),
  http.post('*', ({ request }) => {
    console.warn(\`Unhandled request: \${request.method} \${request.url}\`);
    return new HttpResponse(null, { status: 404 });
  }),

  // Example handlers
  http.get('/api/test', () => {
    return HttpResponse.json({ success: true });
  }),
];`);
      } else if (file.path.includes('initMocks.ts')) {
        fs.writeFileSync(path.join(process.cwd(), file.path),
`/**
 * Initialize mock server for tests
 */
import { mockServer, enableMockServerLogging } from './server';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { handlers } from './handlers';

// Server state tracked at module level
let serverStarted = false;
let activeTestRuns = 0;

/**
 * Set up mock server for running tests
 * @param debug Enable detailed debug logging
 */
export function setupMockServer(debug = false) {
  // Enable debug logging if requested
  if (debug) {
    enableMockServerLogging();
  }

  // Start the server before all tests
  beforeAll(() => {
    // Increment active test runs
    activeTestRuns++;

    if (!serverStarted) {
      serverStarted = true;
      mockServer.listen({
        onUnhandledRequest: debug ? 'warn' : 'bypass'
      });
      console.log('[MSW] Server started');
    } else {
      // Server already running, just reset handlers to default
      mockServer.resetHandlers();
      mockServer.use(...handlers);
      console.log('[MSW] Server already running, handlers reset to default');
    }
  });

  // Reset handlers after each test
  afterEach(() => {
    mockServer.resetHandlers();
    // Re-apply default handlers after reset
    mockServer.use(...handlers);
  });

  // Clean up after all tests are done
  afterAll(() => {
    // Decrement active test runs
    activeTestRuns--;

    if (activeTestRuns <= 0) {
      mockServer.close();
      serverStarted = false;
      activeTestRuns = 0; // Safety reset
      console.log('[MSW] Server stopped');
    }
  });
}

/**
 * Reset the mock server handlers
 */
export function resetMockServerHandlers() {
  mockServer.resetHandlers();
  mockServer.use(...handlers);
}`);
      }
    }
  }

  // Suggest adding to package.json scripts if missing MSW debug script
  if (!pkg.scripts?.['test:msw'] && !pkg.scripts?.['test:msw:debug']) {
    console.log(`${colors.blue}Adding MSW debug scripts to package.json...${colors.reset}`);

    pkg.scripts = pkg.scripts || {};
    pkg.scripts['test:msw'] = 'DEBUG_MSW=true pnpm test __tests__/unit/msw-integration.test.ts';
    pkg.scripts['test:msw:debug'] = 'node ./scripts/debug-msw.js';

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log(`${colors.green}✓ Added test:msw and test:msw:debug scripts to package.json${colors.reset}`);
  }

  console.log(`${colors.green}✓ Fix attempt complete. Please check for any remaining issues.${colors.reset}`);
}

// Option to verify MSW setup only
if (options.verifyMockSetup) {
  console.log(`\n${colors.bold}${colors.cyan}MSW setup verification complete.${colors.reset}`);
  process.exit(criticalIssuesFound ? 1 : 0);
}

// Option to check internal state
if (options.checkInternals) {
  console.log(`\n${colors.bold}Checking MSW internal state...${colors.reset}`);

  try {
    // Create a temporary test file to inspect MSW state
    const tempFile = path.join(process.cwd(), '.msw-check-internals.js');
    fs.writeFileSync(tempFile, `
      const { mockServer } = require('./__tests__/mocks/server');

      console.log('MSW Server Status:');
      console.log('- Is Started:', mockServer.listenerCount('request:start') > 0);
      console.log('- Has Handlers:', mockServer.handlersMap?.size > 0);
      console.log('- Number of Handlers:', mockServer.handlersMap?.size);
      console.log('- Event Listeners:');

      const events = mockServer.eventEmitter?._events || {};
      for (const event in events) {
        console.log('  -', event, ':', typeof events[event] === 'function' ? 1 : events[event].length);
      }
    `);

    execSync(`node ${tempFile}`, { stdio: 'inherit' });
    fs.unlinkSync(tempFile);
  } catch (e) {
    console.log(`${colors.red}Error inspecting MSW internal state: ${e.message}${colors.reset}`);
  }
}

// Set up which tests to run
const testCommand = options.testPattern
  ? `DEBUG_MSW=true pnpm test "${options.testPattern}"`
  : `DEBUG_MSW=true pnpm test __tests__/unit/msw-integration.test.ts`;

// Run test with MSW debugging enabled
console.log(`\n${colors.bold}Running tests with MSW debug output enabled...${colors.reset}`);
console.log(`${colors.cyan}This will show all MSW requests and responses${colors.reset}\n`);

try {
  // Run tests with MSW debugging enabled
  console.log(`Running: ${testCommand}\n`);
  execSync(testCommand, {
    env: { ...process.env, DEBUG_MSW: 'true' },
    stdio: 'inherit'
  });

  console.log(`\n${colors.green}✓ Tests completed successfully!${colors.reset}`);
} catch (e) {
  console.log(`\n${colors.yellow}Tests failed, but this can help diagnose MSW issues.${colors.reset}`);
  console.log(`${colors.cyan}Check the [MSW] logs above for insight into request handling.${colors.reset}`);

  // Show common MSW issues and solutions
  console.log(`\n${colors.bold}${colors.cyan}Common MSW Issues and Solutions:${colors.reset}`);
  console.log(`${colors.bold}1. Missing handlers:${colors.reset} Add handlers for all API endpoints you're testing`);
  console.log(`${colors.bold}2. Path mismatches:${colors.reset} Ensure handler paths match exactly what your code requests`);
  console.log(`${colors.bold}3. Redundant server setup:${colors.reset} Make sure mockServer is only started once`);
  console.log(`${colors.bold}4. Timing issues:${colors.reset} Use waitFor() to wait for async operations`);
  console.log(`${colors.bold}5. Error mocking:${colors.reset} If testing error states, use apiMock.error() helpers`);
  console.log(`${colors.bold}6. MSW version conflicts:${colors.reset} Ensure consistent imports for your MSW version`);
  console.log(`${colors.bold}7. Request content parsing:${colors.reset} Handle JSON and non-JSON requests appropriately`);
  console.log(`${colors.bold}8. Response types:${colors.reset} Use HttpResponse for MSW v2 or ctx.json/ctx.status for MSW v1`);
}

console.log(`\n${colors.cyan}=============================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}Debug complete${colors.reset}`);

// Add "test:msw" and "test:msw:debug" scripts to package.json if they don't exist
try {
  if (!pkg.scripts?.['test:msw'] && !pkg.scripts?.['test:msw:debug']) {
    console.log(`\n${colors.blue}TIP: Add these scripts to your package.json:${colors.reset}`);
    console.log(`
"scripts": {
  "test:msw": "DEBUG_MSW=true pnpm test __tests__/unit/msw-integration.test.ts",
  "test:msw:debug": "node ./scripts/debug-msw.js"
}
`);
  }
} catch (e) {
  // Ignore package.json reading errors
}