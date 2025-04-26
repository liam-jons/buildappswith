// lib/datadog/test-reporter.js
const { createLogger, transports, format } = require('winston');
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const datadogConfig = require('../../datadog-config');

/**
 * Datadog Test Reporter
 * 
 * Sends test results to Datadog for visualization and monitoring.
 * This reporter works with both Vitest and Playwright test results.
 */
class DatadogTestReporter {
  constructor(options = {}) {
    this.options = {
      apiKey: process.env.DATADOG_API_KEY || datadogConfig.api.key,
      datadogSite: process.env.DATADOG_SITE || datadogConfig.api.site,
      metricPrefix: datadogConfig.metrics.prefix,
      environment: process.env.NODE_ENV || 'development',
      service: datadogConfig.metrics.tags.service,
      version: process.env.npm_package_version || '1.0.0',
      ...options
    };

    this.testRunId = uuidv4();
    this.setupLogger();
    this.ensureDirectories();
  }

  /**
   * Set up Winston logger for local logging
   */
  setupLogger() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      defaultMeta: { 
        service: this.options.service,
        environment: this.options.environment,
        version: this.options.version,
        testRunId: this.testRunId
      },
      transports: [
        new transports.File({ 
          filename: path.join(datadogConfig.paths.reports, 'datadog-reporter.log') 
        }),
        new transports.Console()
      ]
    });
  }

  /**
   * Ensure all necessary directories exist
   */
  ensureDirectories() {
    Object.values(datadogConfig.paths).forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Process Vitest results and send to Datadog
   * @param {Object} results - Vitest test results
   */
  processVitestResults(results) {
    this.logger.info('Processing Vitest results', { 
      totalTests: results.numTotalTests,
      passedTests: results.numPassedTests,
      failedTests: results.numFailedTests,
      skippedTests: results.numPendingTests
    });

    // Save raw results to file
    const resultsPath = path.join(datadogConfig.paths.reports, `vitest-results-${Date.now()}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

    // Calculate success rate
    const successRate = results.numTotalTests > 0 
      ? (results.numPassedTests / results.numTotalTests) * 100 
      : 0;

    // Generate metrics for Datadog
    this.sendMetric(`${this.options.metricPrefix}total`, results.numTotalTests);
    this.sendMetric(`${this.options.metricPrefix}passed`, results.numPassedTests);
    this.sendMetric(`${this.options.metricPrefix}failed`, results.numFailedTests);
    this.sendMetric(`${this.options.metricPrefix}skipped`, results.numPendingTests);
    this.sendMetric(`${this.options.metricPrefix}success_rate`, successRate);
    this.sendMetric(`${this.options.metricPrefix}duration`, results.startTime ? (Date.now() - results.startTime) / 1000 : 0);

    // Process test files by test type
    this.processTestFilesByType(results.testResults);

    // Process any coverage information
    if (results.coverageMap) {
      this.processCoverageResults(results.coverageMap);
    }

    return {
      success: results.numFailedTests === 0,
      resultsPath
    };
  }

  /**
   * Process test files by test type (unit, component, integration)
   * @param {Array} testResults - Array of test file results
   */
  processTestFilesByType(testResults) {
    // Initialize counters for each test type
    const testTypes = Object.keys(datadogConfig.testTypes);
    const metrics = testTypes.reduce((acc, type) => {
      acc[type] = { 
        total: 0, 
        passed: 0, 
        failed: 0, 
        skipped: 0, 
        duration: 0 
      };
      return acc;
    }, {});

    // Categorize each test file and count results
    testResults.forEach(result => {
      const filePath = result.testFilePath;
      const testType = this.determineTestType(filePath);
      
      if (testType) {
        metrics[testType].total += result.numTotalTests;
        metrics[testType].passed += result.numPassingTests;
        metrics[testType].failed += result.numFailingTests;
        metrics[testType].skipped += result.numPendingTests;
        metrics[testType].duration += result.perfStats.runtime / 1000; // Convert to seconds
      }
    });

    // Send metrics for each test type
    testTypes.forEach(type => {
      const data = metrics[type];
      const metricName = datadogConfig.testTypes[type].metricName;
      const successRate = data.total > 0 ? (data.passed / data.total) * 100 : 0;

      this.sendMetric(`${this.options.metricPrefix}${metricName}.total`, data.total);
      this.sendMetric(`${this.options.metricPrefix}${metricName}.passed`, data.passed);
      this.sendMetric(`${this.options.metricPrefix}${metricName}.failed`, data.failed);
      this.sendMetric(`${this.options.metricPrefix}${metricName}.skipped`, data.skipped);
      this.sendMetric(`${this.options.metricPrefix}${metricName}.success_rate`, successRate);
      this.sendMetric(`${this.options.metricPrefix}${metricName}.duration`, data.duration);

      // Check if we exceed thresholds and log warnings
      const thresholds = datadogConfig.testTypes[type].thresholds;
      if (successRate < thresholds.successRate) {
        this.logger.warn(`${type} tests success rate below threshold`, {
          actual: successRate,
          threshold: thresholds.successRate,
          testType: type
        });
      }

      if (data.duration > thresholds.duration) {
        this.logger.warn(`${type} tests duration exceeds threshold`, {
          actual: data.duration,
          threshold: thresholds.duration,
          testType: type
        });
      }
    });
  }

  /**
   * Determine the test type based on file path
   * @param {string} filePath - Path to test file
   * @returns {string|null} Test type or null if not recognized
   */
  determineTestType(filePath) {
    for (const [type, config] of Object.entries(datadogConfig.testTypes)) {
      if (filePath.includes(config.directory)) {
        return type;
      }
    }
    return null;
  }

  /**
   * Process coverage results and send to Datadog
   * @param {Object} coverageMap - Coverage information
   */
  processCoverageResults(coverageMap) {
    try {
      // Extract overall coverage statistics
      const summary = coverageMap.getCoverageSummary();
      const lines = summary.lines || {};
      const statements = summary.statements || {};
      const functions = summary.functions || {};
      const branches = summary.branches || {};

      // Calculate percentages
      const linesPct = lines.pct || 0;
      const statementsPct = statements.pct || 0;
      const functionsPct = functions.pct || 0;
      const branchesPct = branches.pct || 0;
      
      // Overall coverage (average of the four metrics)
      const overallPct = (linesPct + statementsPct + functionsPct + branchesPct) / 4;

      // Send metrics to Datadog
      this.sendMetric(`${this.options.metricPrefix}coverage.overall`, overallPct);
      this.sendMetric(`${this.options.metricPrefix}coverage.lines`, linesPct);
      this.sendMetric(`${this.options.metricPrefix}coverage.statements`, statementsPct);
      this.sendMetric(`${this.options.metricPrefix}coverage.functions`, functionsPct);
      this.sendMetric(`${this.options.metricPrefix}coverage.branches`, branchesPct);

      // Check coverage threshold
      const threshold = datadogConfig.visualization.thresholds.coverageRate;
      if (overallPct < threshold) {
        this.logger.warn(`Overall code coverage below threshold`, {
          actual: overallPct,
          threshold,
          lines: linesPct,
          statements: statementsPct,
          functions: functionsPct,
          branches: branchesPct
        });
      }

      this.logger.info('Processed coverage results', {
        overall: overallPct,
        lines: linesPct,
        statements: statementsPct,
        functions: functionsPct,
        branches: branchesPct
      });
    } catch (error) {
      this.logger.error('Error processing coverage results', { error: error.message });
    }
  }

  /**
   * Send a metric to Datadog
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Array} additionalTags - Additional tags
   */
  sendMetric(name, value, additionalTags = []) {
    try {
      const tags = [
        `env:${this.options.environment}`,
        `service:${this.options.service}`,
        `version:${this.options.version}`,
        `test_run_id:${this.testRunId}`,
        ...additionalTags
      ];
      
      const tagString = tags.join(',');
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Using the local Datadog agent
      // Note: Datadog agent must be installed and running
      const cmd = `
        echo "\\
        ${name}:${value}|g|#${tagString}" \\
        | nc -4u -w1 127.0.0.1 8125
      `;
      
      execSync(cmd);
      
      this.logger.debug('Sent metric to Datadog', { 
        name, 
        value, 
        tags: tagString 
      });
    } catch (error) {
      this.logger.error('Error sending metric to Datadog', { 
        error: error.message, 
        metric: name, 
        value 
      });
    }
  }

  /**
   * Process Playwright test results and send to Datadog
   * @param {Object} results - Playwright test results
   */
  processPlaywrightResults(results) {
    this.logger.info('Processing Playwright E2E results', {
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      total: results.total
    });

    // Save raw results to file
    const resultsPath = path.join(datadogConfig.paths.reports, `playwright-results-${Date.now()}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

    // Calculate success rate
    const successRate = results.total > 0 
      ? (results.passed / results.total) * 100 
      : 0;

    // Send metrics to Datadog
    this.sendMetric(`${this.options.metricPrefix}e2e.total`, results.total);
    this.sendMetric(`${this.options.metricPrefix}e2e.passed`, results.passed);
    this.sendMetric(`${this.options.metricPrefix}e2e.failed`, results.failed);
    this.sendMetric(`${this.options.metricPrefix}e2e.skipped`, results.skipped);
    this.sendMetric(`${this.options.metricPrefix}e2e.success_rate`, successRate);
    this.sendMetric(`${this.options.metricPrefix}e2e.duration`, results.duration / 1000); // Convert to seconds

    // Check if success rate is below threshold
    const threshold = datadogConfig.testTypes.e2e.thresholds.successRate;
    if (successRate < threshold) {
      this.logger.warn(`E2E tests success rate below threshold`, {
        actual: successRate,
        threshold
      });
    }

    return {
      success: results.failed === 0,
      resultsPath
    };
  }
}

module.exports = DatadogTestReporter;
