/**
 * Datadog Configuration for Buildappswith Test Infrastructure
 * 
 * This file contains configuration for sending test metrics to Datadog
 * Version: 1.0.0
 */

const DEFAULT_METRIC_PREFIX = 'buildappswith.tests';

// Tags used for all metrics
const GLOBAL_TAGS = [
  `env:${process.env.NODE_ENV || 'development'}`,
  `version:${process.env.npm_package_version || '1.0.83'}`
];

// Test suites that we track specifically
const IMPORTANT_TEST_SUITES = [
  'marketplace',
  'authentication',
  'validation',
  'bookings',
  'profile',
  'admin'
];

// Metric naming convention
const METRICS = {
  // Test execution metrics
  TEST_RUN: `${DEFAULT_METRIC_PREFIX}.run`,
  TEST_SUCCESS: `${DEFAULT_METRIC_PREFIX}.success`,
  TEST_FAILURE: `${DEFAULT_METRIC_PREFIX}.failure`,
  TEST_SKIPPED: `${DEFAULT_METRIC_PREFIX}.skipped`,
  TEST_DURATION: `${DEFAULT_METRIC_PREFIX}.duration`,
  
  // Coverage metrics
  COVERAGE_LINES: `${DEFAULT_METRIC_PREFIX}.coverage.lines`,
  COVERAGE_FUNCTIONS: `${DEFAULT_METRIC_PREFIX}.coverage.functions`,
  COVERAGE_STATEMENTS: `${DEFAULT_METRIC_PREFIX}.coverage.statements`,
  COVERAGE_BRANCHES: `${DEFAULT_METRIC_PREFIX}.coverage.branches`,
  
  // Performance metrics
  RENDER_TIME: `${DEFAULT_METRIC_PREFIX}.performance.render_time`,
  API_RESPONSE_TIME: `${DEFAULT_METRIC_PREFIX}.performance.api_response_time`,
  
  // CI/CD metrics
  PIPELINE_DURATION: `${DEFAULT_METRIC_PREFIX}.ci.pipeline_duration`,
  PIPELINE_SUCCESS: `${DEFAULT_METRIC_PREFIX}.ci.pipeline_success`
};

module.exports = {
  DEFAULT_METRIC_PREFIX,
  GLOBAL_TAGS,
  IMPORTANT_TEST_SUITES,
  METRICS
};
