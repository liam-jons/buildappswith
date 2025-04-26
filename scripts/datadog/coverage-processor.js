/**
 * Coverage Data Processor for Datadog Integration
 * 
 * This utility processes coverage data from Vitest/Istanbul and prepares metrics for Datadog.
 * It reads the coverage JSON file and extracts key metrics.
 * 
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { METRICS, GLOBAL_TAGS } = require('./config');

/**
 * Process coverage data and send metrics to Datadog
 */
async function processCoverageForDatadog() {
  try {
    // Find the most recent coverage report
    const coverageDir = path.join(process.cwd(), 'coverage');
    const jsonReport = path.join(coverageDir, 'coverage-final.json');
    
    console.log('🐶 Datadog Coverage Processor: Processing coverage data');
    
    // Check if the coverage report exists
    try {
      await fs.access(jsonReport);
    } catch (err) {
      console.error('   Coverage report not found at:', jsonReport);
      return;
    }
    
    // Read and parse the coverage report
    const coverageData = JSON.parse(await fs.readFile(jsonReport, 'utf8'));
    
    // Extract summary metrics
    const summary = extractCoverageSummary(coverageData);
    
    // Copy summary to test-results directory
    const resultsDir = path.join(process.cwd(), 'test-results', 'coverage');
    try {
      await fs.mkdir(resultsDir, { recursive: true });
      await fs.writeFile(
        path.join(resultsDir, `coverage-summary-${Date.now()}.json`),
        JSON.stringify(summary, null, 2)
      );
    } catch (err) {
      console.error('   Error saving coverage summary:', err);
    }
    
    // Send metrics to Datadog
    sendCoverageMetricsToDatadog(summary);
    
    console.log('   Coverage processing complete');
    
  } catch (err) {
    console.error('Error processing coverage data:', err);
  }
}

/**
 * Extract coverage summary from raw coverage data
 */
function extractCoverageSummary(coverageData) {
  // Initialize counters
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;
  
  // Categorize files by directory
  const categories = {
    components: {
      files: 0,
      statements: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      lines: { total: 0, covered: 0 }
    },
    lib: {
      files: 0,
      statements: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      lines: { total: 0, covered: 0 }
    },
    utils: {
      files: 0,
      statements: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      lines: { total: 0, covered: 0 }
    },
    other: {
      files: 0,
      statements: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      lines: { total: 0, covered: 0 }
    }
  };
  
  // Process each file
  for (const [filePath, fileData] of Object.entries(coverageData)) {
    // Determine category
    let category = 'other';
    if (filePath.includes('/components/')) {
      category = 'components';
    } else if (filePath.includes('/lib/')) {
      category = 'lib';
    } else if (filePath.includes('/utils/') || filePath.includes('/helpers/')) {
      category = 'utils';
    }
    
    // Update file count
    categories[category].files++;
    
    // Get coverage data for this file
    const { statementMap, s, branchMap, b, fnMap, f } = fileData;
    
    // Count statements
    const statementsTotal = Object.keys(statementMap).length;
    const statementsCovered = Object.values(s).filter(hits => hits > 0).length;
    totalStatements += statementsTotal;
    coveredStatements += statementsCovered;
    categories[category].statements.total += statementsTotal;
    categories[category].statements.covered += statementsCovered;
    
    // Count branches
    const branchesTotal = Object.values(b).flat().length;
    const branchesCovered = Object.values(b).flat().filter(hits => hits > 0).length;
    totalBranches += branchesTotal;
    coveredBranches += branchesCovered;
    categories[category].branches.total += branchesTotal;
    categories[category].branches.covered += branchesCovered;
    
    // Count functions
    const functionsTotal = Object.keys(fnMap).length;
    const functionsCovered = Object.values(f).filter(hits => hits > 0).length;
    totalFunctions += functionsTotal;
    coveredFunctions += functionsCovered;
    categories[category].functions.total += functionsTotal;
    categories[category].functions.covered += functionsCovered;
    
    // Count lines (approximated by statements for simplicity)
    totalLines += statementsTotal;
    coveredLines += statementsCovered;
    categories[category].lines.total += statementsTotal;
    categories[category].lines.covered += statementsCovered;
  }
  
  // Calculate percentages
  const summary = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.83',
    environment: process.env.NODE_ENV || 'development',
    totals: {
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        percentage: totalStatements ? (coveredStatements / totalStatements * 100).toFixed(2) : 0
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        percentage: totalBranches ? (coveredBranches / totalBranches * 100).toFixed(2) : 0
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        percentage: totalFunctions ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0
      },
      lines: {
        total: totalLines,
        covered: coveredLines,
        percentage: totalLines ? (coveredLines / totalLines * 100).toFixed(2) : 0
      }
    },
    categories: {}
  };
  
  // Calculate percentages for each category
  for (const [category, data] of Object.entries(categories)) {
    summary.categories[category] = {
      files: data.files,
      statements: {
        total: data.statements.total,
        covered: data.statements.covered,
        percentage: data.statements.total ? (data.statements.covered / data.statements.total * 100).toFixed(2) : 0
      },
      branches: {
        total: data.branches.total,
        covered: data.branches.covered,
        percentage: data.branches.total ? (data.branches.covered / data.branches.total * 100).toFixed(2) : 0
      },
      functions: {
        total: data.functions.total,
        covered: data.functions.covered,
        percentage: data.functions.total ? (data.functions.covered / data.functions.total * 100).toFixed(2) : 0
      },
      lines: {
        total: data.lines.total,
        covered: data.lines.covered,
        percentage: data.lines.total ? (data.lines.covered / data.lines.total * 100).toFixed(2) : 0
      }
    };
  }
  
  return summary;
}

/**
 * Send coverage metrics to Datadog
 */
function sendCoverageMetricsToDatadog(summary) {
  // Only run this if we're in an environment with Datadog available
  if (process.env.SKIP_DATADOG) {
    console.log('   Skipping Datadog metrics submission (SKIP_DATADOG is set)');
    return;
  }
  
  console.log('   Sending coverage metrics to Datadog...');
  
  // Prepare global tags
  const baseTags = GLOBAL_TAGS.join(',');
  
  // Send overall coverage metrics
  sendMetric(METRICS.COVERAGE_STATEMENTS, summary.totals.statements.percentage, baseTags);
  sendMetric(METRICS.COVERAGE_BRANCHES, summary.totals.branches.percentage, baseTags);
  sendMetric(METRICS.COVERAGE_FUNCTIONS, summary.totals.functions.percentage, baseTags);
  sendMetric(METRICS.COVERAGE_LINES, summary.totals.lines.percentage, baseTags);
  
  // Send category-specific metrics
  for (const [category, data] of Object.entries(summary.categories)) {
    if (data.files > 0) {
      const categoryTags = `${baseTags},category:${category}`;
      sendMetric(METRICS.COVERAGE_STATEMENTS, data.statements.percentage, categoryTags);
      sendMetric(METRICS.COVERAGE_BRANCHES, data.branches.percentage, categoryTags);
      sendMetric(METRICS.COVERAGE_FUNCTIONS, data.functions.percentage, categoryTags);
      sendMetric(METRICS.COVERAGE_LINES, data.lines.percentage, categoryTags);
    }
  }
  
  console.log('   Coverage metrics sent to Datadog');
}

/**
 * Send a single metric to Datadog
 */
function sendMetric(name, value, tags) {
  const cmd = `echo "${name}:${value}|g|#${tags}" | nc -4u -w1 127.0.0.1 8125`;
  
  exec(cmd, (error) => {
    if (error) {
      console.error(`   Error sending metric ${name} to Datadog:`, error.message);
    }
  });
}

// If called directly, process coverage data
if (require.main === module) {
  processCoverageForDatadog();
}

module.exports = { processCoverageForDatadog };
