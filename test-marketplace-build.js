const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Define the paths to check
const marketplacePath = path.join(__dirname, 'components', 'marketplace');
const errorBoundaryPath = path.join(marketplacePath, 'components', 'error-boundaries', 'marketplace-error-boundary.tsx');

// Check if the file exists
if (!fs.existsSync(errorBoundaryPath)) {
  console.error(`File not found: ${errorBoundaryPath}`);
  process.exit(1);
}

console.log('Checking if the marketplace error boundary can be compiled...');

try {
  // Run TypeScript compiler on just the error boundary file
  execSync(`npx tsc ${errorBoundaryPath} --noEmit`, { stdio: 'inherit' });
  console.log('TypeScript compilation successful!');
} catch (error) {
  console.error('TypeScript compilation failed.');
  process.exit(1);
}

console.log('All checks passed!');