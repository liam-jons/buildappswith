/**
 * Datadog Test Agent Integration
 * Version: 1.0.0
 * 
 * This script processes test results from Vitest and sends metrics to Datadog
 * for visualization and monitoring. It reads the JSON output from Vitest and
 * transforms it into Datadog metrics.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const TEST_RESULTS_PATH = path.join(__dirname, 'test-results/reports/vitest-results.json');
const DATADOG_METRICS_PREFIX = 'buildappswith.tests';
const COVERAGE_RESULTS_PATH = path.join(__dirname, 'test-results/coverage/coverage-summary.json');

/**
 * Reads test results from the JSON file and processes them
 */
function processTestResults() {
  try {
    // Check if the results file exists
    if (!fs.existsSync(TEST_RESULTS_PATH)) {
      console.error(`Test results file not found at ${TEST_RESULTS_PATH}`);
      return;
    }

    const testData = JSON.parse(fs.readFileSync(TEST_RESULTS_PATH, 'utf8'));
    
    // Extract key metrics
    const totalTests = testData.numTotalTests;
    const failedTests = testData.numFailedTests;
    const passedTests = testData.numPassedTests;
    const skippedTests = testData.numTotalTests - (testData.numFailedTests + testData.numPassedTests);
    const duration = testData.startTime && testData.endTime 
      ? (testData.endTime - testData.startTime) / 1000 
      : 0;

    // Process test suites for component-level metrics
    const componentMetrics = {};
    
    if (testData.testResults) {
      testData.testResults.forEach(suite => {
        const suitePath = suite.name || 'unknown';
        const component = extractComponentName(suitePath);
        
        if (!componentMetrics[component]) {
          componentMetrics[component] = {
            total: 0,
            passed: 0,
            failed: 0,
            duration: 0
          };
        }
        
        suite.assertionResults.forEach(test => {
          componentMetrics[component].total++;
          
          if (test.status === 'passed') {
            componentMetrics[component].passed++;
          } else if (test.status === 'failed') {
            componentMetrics[component].failed++;
          }
          
          if (test.duration) {
            componentMetrics[component].duration += test.duration;
          }
        });
      });
    }

    // Send metrics to Datadog
    sendMetricsToDatadog({
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      duration,
      componentMetrics
    });
    
    // Process coverage data if available
    processCoverageData();
    
    console.log('Successfully processed test results and sent metrics to Datadog');
  } catch (error) {
    console.error('Error processing test results:', error);
  }
}

/**
 * Extracts component name from test file path
 */
function extractComponentName(filePath) {
  // Extract the component name from the test file path
  // Example: "/Users/liamj/Documents/Development/buildappswith/__tests__/components/marketplace/BuilderProfileClient.test.tsx"
  // Should return: "marketplace"
  
  // Remove file extension and get path parts
  const normalizedPath = filePath.replace(/\\/g, '/');
  const parts = normalizedPath.split('/');
  
  // Look for component directories
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'components' && i + 1 < parts.length) {
      return parts[i + 1];
    }
    if (parts[i] === 'integration' && i + 1 < parts.length) {
      return parts[i + 1];
    }
    if (parts[i] === 'unit' && i + 1 < parts.length) {
      return parts[i + 1];
    }
  }
  
  // Fallback: try to extract from filename
  const fileName = parts[parts.length - 1];
  const match = fileName.match(/^([a-zA-Z-]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Reads and processes coverage data
 */
function processCoverageData() {
  try {
    if (!fs.existsSync(COVERAGE_RESULTS_PATH)) {
      console.warn(`Coverage results not found at ${COVERAGE_RESULTS_PATH}`);
      return;
    }
    
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_RESULTS_PATH, 'utf8'));
    const total = coverageData.total || {};
    
    // Send coverage metrics to Datadog
    const metrics = {
      'coverage.lines': total.lines?.pct || 0,
      'coverage.statements': total.statements?.pct || 0,
      'coverage.functions': total.functions?.pct || 0,
      'coverage.branches': total.branches?.pct || 0
    };
    
    Object.entries(metrics).forEach(([key, value]) => {
      sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.${key}`, value);
    });
    
    // Process per-component coverage metrics
    Object.entries(coverageData).forEach(([path, data]) => {
      if (path === 'total') return;
      
      const component = extractComponentName(path);
      if (component === 'unknown') return;
      
      sendDatadogMetric(
        `${DATADOG_METRICS_PREFIX}.coverage.component.${component}.lines`, 
        data.lines?.pct || 0
      );
    });
    
  } catch (error) {
    console.error('Error processing coverage data:', error);
  }
}

/**
 * Sends metrics to Datadog using the Datadog Agent
 */
function sendMetricsToDatadog(metrics) {
  // Overall test metrics
  sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.total`, metrics.totalTests);
  sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.passed`, metrics.passedTests);
  sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.failed`, metrics.failedTests);
  sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.skipped`, metrics.skippedTests);
  sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.duration`, metrics.duration);
  sendDatadogMetric(
    `${DATADOG_METRICS_PREFIX}.pass_rate`, 
    metrics.totalTests > 0 ? (metrics.passedTests / metrics.totalTests) * 100 : 0
  );
  
  // Component-level metrics
  Object.entries(metrics.componentMetrics).forEach(([component, data]) => {
    sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.component.${component}.total`, data.total);
    sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.component.${component}.passed`, data.passed);
    sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.component.${component}.failed`, data.failed);
    sendDatadogMetric(`${DATADOG_METRICS_PREFIX}.component.${component}.duration`, data.duration);
    sendDatadogMetric(
      `${DATADOG_METRICS_PREFIX}.component.${component}.pass_rate`, 
      data.total > 0 ? (data.passed / data.total) * 100 : 0
    );
  });
}

/**
 * Sends a single metric to the Datadog Agent
 */
function sendDatadogMetric(name, value, tags = []) {
  const tagString = tags.length > 0 ? `#${tags.join(',')}` : '';
  const command = `echo "${name}:${value}${tagString}" | nc -4u -w0 127.0.0.1 8125`;
  
  exec(command, (error) => {
    if (error) {
      console.error(`Error sending metric ${name} to Datadog:`, error);
    }
  });
}

// Execute the script if run directly
if (require.main === module) {
  processTestResults();
}

module.exports = {
  processTestResults,
  sendMetricsToDatadog
};
