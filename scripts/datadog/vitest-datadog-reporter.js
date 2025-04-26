/**
 * Vitest Reporter for Datadog Integration
 * 
 * This custom reporter sends test results to Datadog as metrics.
 * It works with Vitest's reporter API to capture test results.
 * 
 * Version: 1.0.0
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { METRICS, GLOBAL_TAGS, IMPORTANT_TEST_SUITES } = require('./config');

class DatadogReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      total: 0,
      success: 0,
      failure: 0,
      skipped: 0,
      duration: 0,
      suites: new Map()
    };

    // Ensure test-results directory exists
    this.ensureResultsDirectory();
  }

  /**
   * Make sure the test-results directory exists
   */
  async ensureResultsDirectory() {
    const resultsDir = path.join(process.cwd(), 'test-results');
    try {
      await fs.mkdir(resultsDir, { recursive: true });
      await fs.mkdir(path.join(resultsDir, 'reports'), { recursive: true });
    } catch (err) {
      console.error('Error creating test-results directory:', err);
    }
  }

  /**
   * Called when the test run begins
   */
  onInit(context) {
    this.startTime = new Date();
    console.log('\n🐶 Datadog Reporter: Initialized, will send metrics when tests complete');
  }

  /**
   * Called when a test completes
   */
  onTestComplete(test) {
    this.results.total++;
    
    // Get the test suite name from the filepath
    const filepath = test.file?.name || '';
    const relPath = filepath.replace(process.cwd(), '');
    const suiteMatch = relPath.match(/__tests__\/(components|integration|unit)\/([^\/]+)/);
    const suiteName = suiteMatch ? suiteMatch[2] : 'other';
    
    // Initialize suite if it doesn't exist
    if (!this.results.suites.has(suiteName)) {
      this.results.suites.set(suiteName, { total: 0, success: 0, failure: 0, skipped: 0, duration: 0 });
    }
    
    const suite = this.results.suites.get(suiteName);
    suite.total++;
    
    // Track test status
    if (test.result?.state === 'pass') {
      this.results.success++;
      suite.success++;
    } else if (test.result?.state === 'fail') {
      this.results.failure++;
      suite.failure++;
    } else if (test.result?.state === 'skip') {
      this.results.skipped++;
      suite.skipped++;
    }
    
    // Track duration
    const duration = test.result?.duration || 0;
    this.results.duration += duration;
    suite.duration += duration;
  }

  /**
   * Called when all tests are complete
   */
  async onFinished(files, errors) {
    const endTime = new Date();
    const totalDuration = (endTime - this.startTime) / 1000; // in seconds
    
    // Log results
    console.log('\n🐶 Datadog Reporter: Test run complete');
    console.log(`   Tests: ${this.results.total} total, ${this.results.success} passed, ${this.results.failure} failed, ${this.results.skipped} skipped`);
    console.log(`   Duration: ${totalDuration.toFixed(2)}s`);
    
    // Save results to JSON file for Datadog to collect
    const resultPath = path.join(process.cwd(), 'test-results', 'reports', `results-${Date.now()}.json`);
    const resultsWithMeta = {
      ...this.results,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.83',
      environment: process.env.NODE_ENV || 'development',
      totalDuration,
      suites: Object.fromEntries(this.results.suites)
    };
    
    try {
      await fs.writeFile(resultPath, JSON.stringify(resultsWithMeta, null, 2));
      console.log(`   Results saved to ${resultPath}`);
    } catch (err) {
      console.error('Error saving test results:', err);
    }
    
    // Send metrics to Datadog
    this.sendMetricsToDatadog(resultsWithMeta);
  }

  /**
   * Send metrics to Datadog using the Datadog Agent
   * This uses the dogstatsd protocol via command line
   */
  sendMetricsToDatadog(results) {
    // Only run this if we're in an environment with Datadog available
    if (process.env.SKIP_DATADOG) {
      console.log('   Skipping Datadog metrics submission (SKIP_DATADOG is set)');
      return;
    }
    
    console.log('   Sending metrics to Datadog...');
    
    // Prepare global tags
    const baseTags = GLOBAL_TAGS.join(',');
    
    // Send overall metrics
    this.sendMetric(METRICS.TEST_RUN, 1, baseTags);
    this.sendMetric(METRICS.TEST_SUCCESS, results.success, baseTags);
    this.sendMetric(METRICS.TEST_FAILURE, results.failure, baseTags);
    this.sendMetric(METRICS.TEST_SKIPPED, results.skipped, baseTags);
    this.sendMetric(METRICS.TEST_DURATION, results.totalDuration, baseTags);
    
    // Send suite-specific metrics
    for (const [suiteName, suite] of Object.entries(results.suites)) {
      // Only send detailed metrics for important suites
      if (IMPORTANT_TEST_SUITES.includes(suiteName)) {
        const suiteTags = `${baseTags},suite:${suiteName}`;
        this.sendMetric(METRICS.TEST_SUCCESS, suite.success, suiteTags);
        this.sendMetric(METRICS.TEST_FAILURE, suite.failure, suiteTags);
        this.sendMetric(METRICS.TEST_DURATION, suite.duration / 1000, suiteTags); // Convert to seconds
      }
    }
    
    // If coverage data is available, send coverage metrics
    if (global.__coverage__) {
      // This would require more processing to extract coverage data
      // For MVP, we're skipping detailed coverage metrics
      console.log('   Coverage data available, but not yet processed for Datadog');
    }
    
    console.log('   Metrics sent to Datadog');
  }

  /**
   * Send a single metric to Datadog
   */
  sendMetric(name, value, tags) {
    const cmd = `echo "${name}:${value}|g|#${tags}" | nc -4u -w1 127.0.0.1 8125`;
    
    exec(cmd, (error) => {
      if (error) {
        console.error(`   Error sending metric ${name} to Datadog:`, error.message);
      }
    });
  }
}

module.exports = DatadogReporter;
