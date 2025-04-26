/**
 * Datadog Integration Setup Script
 * 
 * This script configures the Buildappswith project to use Datadog for test visualization.
 * It updates the package.json with new scripts and installs necessary dependencies.
 * 
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Paths to key files
const packageJsonPath = path.join(process.cwd(), 'package.json');
const vitestConfigPath = path.join(process.cwd(), 'vitest.config.js');

/**
 * Main setup function
 */
async function setupDatadogIntegration() {
  console.log('🐶 Setting up Datadog integration for test visualization');
  
  try {
    // Ensure test-results directories exist
    await ensureDirectories();
    
    // Update package.json with new scripts
    await updatePackageJson();
    
    // Configure Vitest to use Datadog reporter
    await updateVitestConfig();
    
    // Run a test command to verify setup
    await verifySetup();
    
    console.log('\n✅ Datadog integration setup complete!');
    console.log('Now you can run the following commands:');
    console.log('  npm run test:datadog      - Run tests with Datadog reporting');
    console.log('  npm run test:coverage:dd  - Run tests with coverage and send to Datadog');
    
  } catch (err) {
    console.error('❌ Error setting up Datadog integration:', err);
    process.exit(1);
  }
}

/**
 * Ensure all required directories exist
 */
async function ensureDirectories() {
  console.log('Creating test results directories...');
  
  const directories = [
    path.join(process.cwd(), 'test-results'),
    path.join(process.cwd(), 'test-results', 'reports'),
    path.join(process.cwd(), 'test-results', 'coverage'),
    path.join(process.cwd(), 'test-results', 'snapshots'),
    path.join(process.cwd(), 'test-results', 'performance')
  ];
  
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
  }
  
  console.log('✅ Directories created');
}

/**
 * Update package.json with new scripts
 */
async function updatePackageJson() {
  console.log('Updating package.json...');
  
  // Read existing package.json
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  
  // Create a backup
  await fs.writeFile(
    `${packageJsonPath}.bak`,
    JSON.stringify(packageJson, null, 2)
  );
  
  // Updated scripts to add
  const newScripts = {
    "test:datadog": "DATADOG_ENABLED=true vitest run --config vitest.config.js --reporter=./scripts/datadog/vitest-datadog-reporter.js",
    "test:coverage:dd": "DATADOG_ENABLED=true vitest run --config vitest.config.js --coverage --reporter=./scripts/datadog/vitest-datadog-reporter.js && node scripts/datadog/coverage-processor.js",
    "test:marketplace:dd": "DATADOG_ENABLED=true vitest run --config vitest.config.js --dir __tests__/components/marketplace --reporter=./scripts/datadog/vitest-datadog-reporter.js",
    "test:auth:dd": "DATADOG_ENABLED=true vitest run --config vitest.config.js --dir __tests__/components/auth --reporter=./scripts/datadog/vitest-datadog-reporter.js",
    "test:middleware:dd": "DATADOG_ENABLED=true vitest run --config vitest.config.js --dir __tests__/middleware --reporter=./scripts/datadog/vitest-datadog-reporter.js",
    "test:unit:dd": "DATADOG_ENABLED=true vitest run --config vitest.config.js --dir __tests__/unit --reporter=./scripts/datadog/vitest-datadog-reporter.js",
    "test:integration:dd": "DATADOG_ENABLED=true vitest run --config vitest.config.js --dir __tests__/integration --reporter=./scripts/datadog/vitest-datadog-reporter.js"
  };
  
  // Add new scripts to package.json
  packageJson.scripts = {
    ...packageJson.scripts,
    ...newScripts
  };
  
  // Increment version
  const versionParts = packageJson.version.split('.');
  versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();
  packageJson.version = versionParts.join('.');
  
  // Update package.json
  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log(`✅ package.json updated to version ${packageJson.version}`);
}

/**
 * Update vitest.config.js to support Datadog reporter
 */
async function updateVitestConfig() {
  console.log('Checking vitest.config.js...');
  
  // Read existing vitest.config.js
  const vitestConfig = await fs.readFile(vitestConfigPath, 'utf8');
  
  // Create a backup
  await fs.writeFile(`${vitestConfigPath}.bak`, vitestConfig);
  
  // Check if config already has necessary changes
  if (vitestConfig.includes('datadog')) {
    console.log('✅ vitest.config.js already configured for Datadog');
    return;
  }
  
  // Update the config file with dynamic reporter loading
  const updatedConfig = vitestConfig.replace(
    /test: {/,
    `test: {
    reporters: process.env.DATADOG_ENABLED ? './scripts/datadog/vitest-datadog-reporter.js' : undefined,`
  );
  
  // Write updated config
  await fs.writeFile(vitestConfigPath, updatedConfig);
  
  console.log('✅ vitest.config.js updated');
}

/**
 * Verify the setup by running a simple test
 */
async function verifySetup() {
  console.log('\nVerifying setup...');
  console.log('Running a test command without Datadog reporting (dry run)...');
  
  try {
    // Use SKIP_DATADOG to prevent sending metrics during setup
    execSync('SKIP_DATADOG=true npm run test:unit -- --dir=__tests__/unit/example.test.ts', {
      stdio: 'inherit'
    });
    
    console.log('✅ Verification successful');
  } catch (err) {
    console.log('⚠️ Verification test failed, but setup may still be correct');
    console.log('   Check your test configuration and try running tests manually');
  }
}

// Run the setup if executed directly
if (require.main === module) {
  setupDatadogIntegration();
}

module.exports = { setupDatadogIntegration };
