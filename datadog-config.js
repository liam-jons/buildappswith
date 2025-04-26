// datadog-config.js - Integration with Datadog for test visualization
const path = require('path');

/**
 * Datadog Test Integration Configuration
 * 
 * This file configures the integration between our test framework
 * and Datadog for test result visualization and monitoring.
 */
module.exports = {
  // Core settings
  api: {
    // Replace with your actual Datadog API key
    key: process.env.DATADOG_API_KEY || '',
    // The site to send metrics to (datadoghq.com or datadoghq.eu)
    site: process.env.DATADOG_SITE || 'datadoghq.com',
  },
  
  // Metric namespaces
  metrics: {
    prefix: 'buildappswith.tests.',
    tags: {
      env: process.env.NODE_ENV || 'development',
      service: 'buildappswith-platform',
      version: process.env.npm_package_version || '1.0.0'
    }
  },
  
  // Test result directories
  paths: {
    // Base directory for test results
    base: path.resolve(__dirname, 'test-results'),
    
    // Specific result directories
    coverage: path.resolve(__dirname, 'test-results/coverage'),
    reports: path.resolve(__dirname, 'test-results/reports'),
    performance: path.resolve(__dirname, 'test-results/performance'),
    snapshots: path.resolve(__dirname, 'test-results/snapshots'),
  },
  
  // Test visualization settings
  visualization: {
    // Dashboard refresh interval in seconds
    refreshInterval: 60,
    // Whether to include flaky tests in the dashboard
    includeFlaky: true,
    // Whether to include skipped tests in metrics
    includeSkipped: false,
    // Custom thresholds for various metrics
    thresholds: {
      // Success percentage threshold for alert
      successRate: 95,
      // Coverage percentage threshold for alert
      coverageRate: 80,
      // Maximum test duration in seconds before performance alert
      duration: 120
    }
  },
  
  // Specific test type settings
  testTypes: {
    unit: {
      metricName: 'unit',
      directory: '__tests__/unit',
      thresholds: {
        duration: 5, // Unit tests should be fast
        successRate: 98 // Higher threshold for unit tests
      }
    },
    component: {
      metricName: 'component',
      directory: '__tests__/components',
      thresholds: {
        duration: 10,
        successRate: 95
      }
    },
    integration: {
      metricName: 'integration',
      directory: '__tests__/integration',
      thresholds: {
        duration: 30,
        successRate: 90
      }
    },
    e2e: {
      metricName: 'e2e',
      directory: 'e2e',
      thresholds: {
        duration: 120,
        successRate: 85
      }
    }
  },
  
  // Datadog dashboard configuration
  dashboard: {
    title: 'Buildappswith Test Results',
    description: 'Visualization of test results across all test types',
    // Dashboard layout and widgets defined in separate file
    layoutFile: path.resolve(__dirname, 'datadog-dashboard-layout.json')
  }
};
