#!/usr/bin/env node

/**
 * Datadog Test Visualization Setup Script
 * 
 * This script sets up the Datadog integration for test visualization by:
 * 1. Checking for Datadog agent installation
 * 2. Creating necessary directory structure
 * 3. Configuring package.json with test scripts
 * 4. Setting up Datadog dashboard
 * 
 * Usage: node scripts/setup-datadog-test-visualization.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createHash } = require('crypto');

// Load environment variables from multiple sources
// This ensures API keys are properly loaded from .env files
const dotenv = require('dotenv');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Create a merged environment object to capture all variables
const mergedEnv = {};

// Helper function to merge env variables into our object
function loadAndMergeEnv(envPath) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${path.relative(PROJECT_ROOT, envPath)}`);
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const key in envConfig) {
      mergedEnv[key] = envConfig[key];
    }
  }
}

// Load environment variables in order of precedence
// First load .env (lowest precedence)
loadAndMergeEnv(path.join(PROJECT_ROOT, '.env'));

// Then load environment-specific files
const NODE_ENV = process.env.NODE_ENV || 'development';
loadAndMergeEnv(path.join(PROJECT_ROOT, `.env.${NODE_ENV}`));

// Then load .env.local which overrides both
loadAndMergeEnv(path.join(PROJECT_ROOT, '.env.local'));

// Finally load environment-specific local files (highest precedence)
loadAndMergeEnv(path.join(PROJECT_ROOT, `.env.${NODE_ENV}.local`));

// If we have specific production environment variables for local development
loadAndMergeEnv(path.join(PROJECT_ROOT, '.env.production.local'));

// Now add all the merged variables to process.env
for (const key in mergedEnv) {
  process.env[key] = mergedEnv[key];
}

// Log the current environment for debugging
console.log(`🔧 Environment: ${NODE_ENV}`);

const TEST_RESULTS_DIR = path.join(PROJECT_ROOT, 'test-results');
const DATADOG_API_KEY_ENV = 'DATADOG_API_KEY';
const DATADOG_APP_KEY_ENV = 'DATADOG_APP_KEY';

// Verify that we have the required API keys
if (!process.env[DATADOG_API_KEY_ENV] && process.env.DATADOG_API_KEY) {
  process.env[DATADOG_API_KEY_ENV] = process.env.DATADOG_API_KEY;
  console.log(`Found DATADOG_API_KEY from direct environment variable`);
}

if (!process.env[DATADOG_APP_KEY_ENV] && process.env.DATADOG_APP_KEY) {
  process.env[DATADOG_APP_KEY_ENV] = process.env.DATADOG_APP_KEY;
  console.log(`Found DATADOG_APP_KEY from direct environment variable`);
}

// Log loaded API keys (masked) for verification
if (process.env[DATADOG_API_KEY_ENV]) {
  const keyLength = process.env[DATADOG_API_KEY_ENV].length;
  const maskedKey = '*'.repeat(Math.max(0, keyLength - 4)) + 
                    process.env[DATADOG_API_KEY_ENV].slice(-4);
  console.log(`🔑 ${DATADOG_API_KEY_ENV} found (${maskedKey})`);
} else {
  console.log(`⚠️ ${DATADOG_API_KEY_ENV} not found in environment variables`);
}

if (process.env[DATADOG_APP_KEY_ENV]) {
  const keyLength = process.env[DATADOG_APP_KEY_ENV].length;
  const maskedKey = '*'.repeat(Math.max(0, keyLength - 4)) + 
                    process.env[DATADOG_APP_KEY_ENV].slice(-4);
  console.log(`🔑 ${DATADOG_APP_KEY_ENV} found (${maskedKey})`);
} else {
  console.log(`⚠️ ${DATADOG_APP_KEY_ENV} not found in environment variables`);
}

/**
 * Main setup function
 */
async function setupDatadogIntegration() {
  console.log('🐶 Setting up Datadog Test Visualization...');
  
  // Check Datadog agent
  checkDatadogAgent();
  
  // Create directory structure
  createDirectoryStructure();
  
  // Update package.json
  updatePackageJson();
  
  // Create test reporter script if not exists
  createTestReporter();
  
  // Set up Datadog dashboard if API credentials available
  setupDatadogDashboard();
  
  console.log('✅ Datadog Test Visualization setup complete!');
  console.log('\n📊 Next steps:');
  console.log('1. Run tests with Datadog reporting: npm run test:datadog');
  console.log('2. Check the Datadog dashboard for test metrics');
  console.log('3. Integrate with CI/CD pipeline by adding the test:datadog script to your workflows');
}

/**
 * Check if Datadog agent is installed and running
 */
function checkDatadogAgent() {
  console.log('🔍 Checking Datadog agent...');
  
  try {
    // Check if Datadog agent is running
    const agentStatus = execSync('datadog-agent status 2>/dev/null || echo "Agent not running"', { encoding: 'utf8' });
    
    if (agentStatus.includes('Agent not running')) {
      console.log('⚠️  Datadog agent not detected or not running');
      console.log('Please ensure the Datadog agent is installed and running:');
      console.log('- For Mac: brew install datadog-agent');
      console.log('- For Linux: Follow instructions at https://docs.datadoghq.com/agent/');
      console.log('After installation, configure the agent with your API key');
    } else {
      console.log('✅ Datadog agent detected');
    }
  } catch (error) {
    console.log('⚠️  Could not check Datadog agent status. Ensure it\'s installed and running.');
  }
}

/**
 * Create necessary directory structure
 */
function createDirectoryStructure() {
  console.log('📁 Creating directory structure...');
  
  const directories = [
    TEST_RESULTS_DIR,
    path.join(TEST_RESULTS_DIR, 'reports'),
    path.join(TEST_RESULTS_DIR, 'coverage'),
    path.join(TEST_RESULTS_DIR, 'snapshots'),
    path.join(TEST_RESULTS_DIR, 'performance')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  Created ${path.relative(PROJECT_ROOT, dir)}`);
    } else {
      console.log(`  ${path.relative(PROJECT_ROOT, dir)} already exists`);
    }
  });
  
  // Create .gitignore for test results if not exists
  const gitignorePath = path.join(TEST_RESULTS_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '# Ignore test result files\n*\n# Except this file\n!.gitignore\n');
    console.log('  Created test-results/.gitignore');
  }
}

/**
 * Update package.json with test scripts
 */
function updatePackageJson() {
  console.log('📝 Updating package.json with test scripts...');
  
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Calculate current version and increment
  const currentVersion = packageJson.version || '0.0.0';
  const versionParts = currentVersion.split('.');
  const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2] || 0) + 1}`;
  
  // Add/update test scripts
  packageJson.scripts = packageJson.scripts || {};
  
  // Save original scripts if they don't exist
  if (!packageJson.scripts['test:original'] && packageJson.scripts['test']) {
    packageJson.scripts['test:original'] = packageJson.scripts['test'];
  }
  
  // Add Datadog-specific test scripts
  const newScripts = {
    'test:datadog': 'vitest run --config vitest.config.js && node datadog-test-agent.js',
    'test:datadog:watch': 'vitest watch --config vitest.config.js',
    'test:datadog:marketplace': 'vitest run --config vitest.config.js --dir __tests__/components/marketplace && node datadog-test-agent.js',
    'test:datadog:auth': 'vitest run --config vitest.config.js --dir __tests__/components/auth && node datadog-test-agent.js',
    'test:datadog:integration': 'vitest run --config vitest.config.js --dir __tests__/integration && node datadog-test-agent.js',
    'test:datadog:coverage': 'vitest run --config vitest.config.js --coverage && node datadog-test-agent.js'
  };
  
  // Update scripts
  Object.entries(newScripts).forEach(([key, value]) => {
    if (packageJson.scripts[key] !== value) {
      packageJson.scripts[key] = value;
      console.log(`  Added/updated script: ${key}`);
    }
  });
  
  // Update version
  packageJson.version = newVersion;
  console.log(`  Updated version: ${currentVersion} → ${newVersion}`);
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * Create test reporter script if not exists
 */
function createTestReporter() {
  const reporterPath = path.join(PROJECT_ROOT, 'datadog-test-agent.js');
  
  if (!fs.existsSync(reporterPath)) {
    console.log('📊 Creating Datadog test reporter script...');
    
    // Copy the reporter script from the source file
    const sourceReporterPath = path.join(PROJECT_ROOT, 'datadog-test-agent.js');
    const targetReporterPath = reporterPath;
    
    if (fs.existsSync(sourceReporterPath)) {
      fs.copyFileSync(sourceReporterPath, targetReporterPath);
      console.log('  Created datadog-test-agent.js');
    } else {
      console.error('❌ Source reporter script not found. Please ensure datadog-test-agent.js exists in the project root.');
      process.exit(1);
    }
  } else {
    console.log('📊 Datadog test reporter script already exists');
  }
}

/**
 * Set up Datadog dashboard using API
 */
function setupDatadogDashboard() {
  console.log('🖥️  Setting up Datadog dashboard...');
  
  const apiKey = process.env[DATADOG_API_KEY_ENV];
  const appKey = process.env[DATADOG_APP_KEY_ENV];
  
  if (!apiKey || !appKey) {
    console.log('⚠️  Datadog API credentials not found in environment variables');
    console.log(`Set ${DATADOG_API_KEY_ENV} and ${DATADOG_APP_KEY_ENV} to create the dashboard automatically`);
    console.log('You can still use the dashboard creation script manually:');
    console.log('- Add Datadog API credentials to your .env.local file');
    console.log('- Run: node scripts/datadog/dashboards/create-dashboard.js');
    
    // Create a .env.example file with the required variables if it doesn't exist
    const envExamplePath = path.join(PROJECT_ROOT, '.env.example');
    if (!fs.existsSync(envExamplePath) || !fs.readFileSync(envExamplePath, 'utf8').includes('DATADOG_API_KEY')) {
      console.log('✍️  Creating/updating .env.example with Datadog variables...');
      try {
        let envExample = '';
        if (fs.existsSync(envExamplePath)) {
          envExample = fs.readFileSync(envExamplePath, 'utf8');
        }
        
        if (!envExample.includes('DATADOG_API_KEY')) {
          envExample += '\n# Datadog API credentials for test visualization\nDATADOG_API_KEY=your_api_key_here\nDATADOG_APP_KEY=your_app_key_here\n';
          fs.writeFileSync(envExamplePath, envExample);
          console.log('  Added Datadog variables to .env.example');
        }
      } catch (error) {
        console.error('  Error updating .env.example:', error.message);
      }
    }
    
    return;
  }
  
  console.log('🔄 Creating dashboard in Datadog using API...');
  try {
    // Path to the dashboard creation script
    const createDashboardScriptPath = path.join(PROJECT_ROOT, 'scripts', 'datadog', 'dashboards', 'create-dashboard.js');
    
    // Ensure dashboard script exists
    if (!fs.existsSync(createDashboardScriptPath)) {
      console.error(`❌ Dashboard creation script not found at: ${path.relative(PROJECT_ROOT, createDashboardScriptPath)}`);
      console.error('Please make sure the script exists before running setup.');
      return;
    }
    
    // Execute the dashboard creation script
    try {
      // Load and execute the dashboard creation script
      const { createDashboard } = require('./datadog/dashboards/create-dashboard');
      const result = createDashboard();
      
      // Handle the result
      result.then(dashboardResult => {
        if (dashboardResult.success) {
          console.log(`✅ Dashboard ${dashboardResult.action} successfully.`);
          console.log(`🔗 Dashboard URL: ${dashboardResult.url}`);
        } else {
          console.error(`❌ Error creating dashboard: ${dashboardResult.error}`);
          console.log('You can try running the script manually:');
          console.log('- node scripts/datadog/dashboards/create-dashboard.js');
        }
      });
    } catch (execError) {
      console.error(`❌ Error executing dashboard creation script:`, execError.message);
      console.log('You can try running the script manually:');
      console.log('- node scripts/datadog/dashboards/create-dashboard.js');
    }
  } catch (error) {
    console.error('❌ Error setting up Datadog dashboard:', error.message);
  }
}

// Execute the script
setupDatadogIntegration().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
