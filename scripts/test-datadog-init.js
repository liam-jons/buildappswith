/**
 * Datadog Initialization Test Script
 * 
 * This script validates the proper separation of client and server code
 * in the Datadog SDK implementation.
 * 
 * Usage:
 *   node scripts/test-datadog-init.js
 */

const path = require('path');
const fs = require('fs');

// Define paths to key files
const INTERFACES_DIR = path.resolve(__dirname, '../lib/datadog/interfaces');
const CLIENT_DIR = path.resolve(__dirname, '../lib/datadog/client');
const SERVER_DIR = path.resolve(__dirname, '../lib/datadog/server');
const CONFIG_DIR = path.resolve(__dirname, '../lib/datadog/config');
const MAIN_INDEX_PATH = path.resolve(__dirname, '../lib/datadog/index.ts');
const RUM_PROVIDER_PATH = path.resolve(__dirname, '../components/providers/datadog-rum-provider.tsx');
const LOGGER_CLIENT_PATH = path.resolve(__dirname, '../lib/enhanced-logger.client.ts');
const LOGGER_SERVER_PATH = path.resolve(__dirname, '../lib/enhanced-logger.server.ts');
const INSTRUMENTATION_CLIENT_PATH = path.resolve(__dirname, '../instrumentation-client.ts');
const INSTRUMENTATION_SERVER_PATH = path.resolve(__dirname, '../instrumentation.ts');

// Basic test framework
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${error.message}`);
    failedTests++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Verification functions
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(`Error checking file ${filePath}:`, err);
    return false;
  }
}

function checkDirectoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (err) {
    console.error(`Error checking directory ${dirPath}:`, err);
    return false;
  }
}

function checkFileContains(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (typeof pattern === 'string') {
      return content.includes(pattern);
    } else if (pattern instanceof RegExp) {
      return pattern.test(content);
    }
    return false;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return false;
  }
}

// Test utility to check for Node.js module imports in a file
function checkForNodeModuleImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for direct 'require' or import statements with server-only modules
  const serverModules = [
    'dd-trace',
    'express',
    'http',
    'fs',
    'path',
    'os',
    'crypto',
    'zlib',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'net',
    'tls',
    'readline',
    'stream',
    'string_decoder',
    'util',
    'vm',
    'worker_threads',
  ];
  
  // Check for requires
  const requireRegex = new RegExp(`require\\s*\\(\\s*['"](?:${serverModules.join('|')})(?:['\"]|/)`, 'g');
  const requireMatches = content.match(requireRegex);
  
  // Check for imports
  const importRegex = new RegExp(`import\\s+.*?\\s+from\\s+['"](?:${serverModules.join('|')})(?:['\"]|/)`, 'g');
  const importMatches = content.match(importRegex);
  
  return {
    hasNodeImports: !!(requireMatches || importMatches),
    requireMatches,
    importMatches
  };
}

// Check all client files for server-only imports
function checkAllClientFiles() {
  const isDir = fs.statSync(CLIENT_DIR).isDirectory();
  if (!isDir) return [];
  
  const clientFiles = fs.readdirSync(CLIENT_DIR)
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map(file => path.join(CLIENT_DIR, file));
  
  const results = [];
  
  clientFiles.forEach(file => {
    const result = checkForNodeModuleImports(file);
    if (result.hasNodeImports) {
      results.push({ file, result });
    }
  });
  
  return results;
}

// Test directory structure
test('Directory structure is set up correctly', () => {
  assert(checkDirectoryExists(INTERFACES_DIR), "Interfaces directory not found");
  assert(checkDirectoryExists(CLIENT_DIR), "Client directory not found");
  assert(checkDirectoryExists(SERVER_DIR), "Server directory not found");
  assert(checkDirectoryExists(CONFIG_DIR), "Config directory not found");
  assert(checkFileExists(MAIN_INDEX_PATH), "Main index file not found");
});

// Test EU1 region settings
test('EU1 region is used as default', () => {
  const baseConfigPath = path.join(CONFIG_DIR, 'base-config.ts');
  assert(checkFileExists(baseConfigPath), "Base config file not found");
  assert(checkFileContains(baseConfigPath, "site: process.env.DATADOG_SITE || 'datadoghq.eu'"), 
    "Default site should be datadoghq.eu (EU1 region)");
  
  assert(checkFileContains(baseConfigPath, "validateEURegion"), 
    "EU region validation function should exist");
});

// Test client code for server module imports
test('Client code does not import server-only modules', () => {
  const results = checkAllClientFiles();
  assert(results.length === 0, `Found ${results.length} client files with server module imports`);
});

// Test environment detection in the main index
test('Main index uses proper environment detection', () => {
  assert(checkFileContains(MAIN_INDEX_PATH, "typeof window === 'undefined'"), 
    "Main index should use 'typeof window === undefined' for environment detection");
  
  assert(checkFileContains(MAIN_INDEX_PATH, /export \* from (["'])\.\/server\1/), 
    "Main index should conditionally export server module");
  
  assert(checkFileContains(MAIN_INDEX_PATH, /export \* from (["'])\.\/client\1/), 
    "Main index should conditionally export client module");
});

// Test integration points
test('Integration points use updated module imports', () => {
  assert(checkFileContains(RUM_PROVIDER_PATH, "import { rum"), 
    "RUM provider should import from new module structure");
  
  assert(checkFileContains(LOGGER_CLIENT_PATH, "import { logs"), 
    "Client logger should import from new module structure");
  
  assert(checkFileContains(LOGGER_SERVER_PATH, "import { tracer"), 
    "Server logger should import from new module structure");
  
  assert(checkFileContains(INSTRUMENTATION_CLIENT_PATH, "import { rum"), 
    "Client instrumentation should import from new module structure");
  
  assert(checkFileContains(INSTRUMENTATION_SERVER_PATH, "import { tracer"), 
    "Server instrumentation should import from new module structure");
});

// Test for singleton patterns in implementations
test('Implementations include singleton protection', () => {
  const rumClientPath = path.join(CLIENT_DIR, 'rum.client.ts');
  const logsClientPath = path.join(CLIENT_DIR, 'logs.client.ts');
  const tracerServerPath = path.join(SERVER_DIR, 'tracer.server.ts');
  
  assert(checkFileContains(rumClientPath, "rumInitialized = "), 
    "RUM client should have singleton protection");
  
  assert(checkFileContains(logsClientPath, "logsInitialized = "), 
    "Logs client should have singleton protection");
  
  assert(checkFileContains(tracerServerPath, "tracerInitialized = "), 
    "Tracer server should have singleton protection");
});

// Test initialization in client and server loggers
test('Loggers use updated initialization', () => {
  assert(checkFileContains(LOGGER_CLIENT_PATH, "logs.init("), 
    "Client logger should use logs.init method");
  
  assert(checkFileContains(LOGGER_SERVER_PATH, "tracer.init("), 
    "Server logger should use tracer.init method");
});

// Print test results
console.log(`\nTest Results: ${passedTests} passed, ${failedTests} failed`);

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);