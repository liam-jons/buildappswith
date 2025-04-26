/**
 * create-dashboard.js
 * Creates a Datadog dashboard for test visualization
 * 
 * Version: 1.0.7
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
console.log('Loading environment from: .env');
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
} catch (e) {
  // Ignore if .env doesn't exist
}

console.log('Loading environment from: .env.development');
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.development') });
} catch (e) {
  // Ignore if file doesn't exist
}

console.log('Loading environment from: .env.local');
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (e) {
  // Ignore if file doesn't exist
}

console.log('Loading environment from: .env.production.local');
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.production.local') });
} catch (e) {
  // Ignore if file doesn't exist
}

console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

// Check for Datadog API keys
const DD_API_KEY = process.env.DD_API_KEY || process.env.DATADOG_API_KEY;
const DD_APP_KEY = process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY;
const DD_SITE = process.env.DD_SITE || 'datadoghq.com';

if (!DD_API_KEY) {
  console.error('❌ Datadog API Key not found. Set DD_API_KEY or DATADOG_API_KEY environment variable.');
  process.exit(1);
}

if (!DD_APP_KEY) {
  console.error('❌ Datadog APP Key not found. Set DD_APP_KEY or DATADOG_APP_KEY environment variable.');
  process.exit(1);
}

// Mask key for logging
const maskKey = (key) => key.substring(0, 4) + '*'.repeat(20) + key.substring(key.length - 4);
console.log(`🔑 Datadog API Key found (${maskKey(DD_API_KEY)})`);
console.log(`🔑 Datadog APP Key found (${maskKey(DD_APP_KEY)})`);

// Create dashboard
console.log('🔍 Creating Datadog dashboard...');

// Ensure @datadog/datadog-api-client is installed
console.log('📦 Ensuring @datadog/datadog-api-client is installed...');
try {
  require.resolve('@datadog/datadog-api-client');
  console.log('✅ @datadog/datadog-api-client is already installed');
} catch (e) {
  console.log('📥 Installing @datadog/datadog-api-client...');
  execSync('npm install --no-save @datadog/datadog-api-client');
  console.log('✅ @datadog/datadog-api-client installed successfully');
}

// Require dependencies
const { client, v1 } = require('@datadog/datadog-api-client');

// Configure Datadog client
const configuration = client.createConfiguration({
  authMethods: {
    apiKeyAuth: DD_API_KEY,
    appKeyAuth: DD_APP_KEY
  }
});

configuration.setServerVariables({
  site: DD_SITE
});

// Initialize Datadog API client
const apiInstance = new v1.DashboardsApi(configuration);

// Dashboard ID file path
const dashboardIdFile = path.resolve(__dirname, '../../../.datadog-dashboard-id');

// Generate Dashboard Content using API model classes
function generateDashboardContent() {
  console.log('📊 Generating dashboard content using API model classes...');
  
  try {
    const widgets = [];
    let widgetId = 0;
    
    // 1. Create a Note widget with dashboard description
    console.log('Creating note widget...');
    const noteWidgetDefinition = {
      type: "note",
      content: "# Test Visualization Dashboard\n\nThis dashboard provides visualization of the Buildappswith test metrics. It displays key test performance indicators including pass/fail rates and execution time.",
      background_color: "white",
      font_size: "14",
      text_align: "left",
      show_tick: false
    };
    
    widgets.push({
      id: widgetId++,
      definition: noteWidgetDefinition
    });
    console.log('Note widget created successfully');

    // 2. Create a Group widget for Test Execution Overview
    console.log('Creating group widget for Test Execution Overview...');
    
    // 2.1 Create Query Value widget for pass rate
    const passRateWidgetDefinition = {
      type: "query_value",
      title: "Test Pass Rate",
      precision: 2,
      autoscale: true,
      custom_unit: "%",
      requests: [
        {
          q: "avg:buildappswith.tests.pass_rate{*}",
          aggregator: "avg"
        }
      ],
      time: {
        live_span: "1d"
      }
    };
    
    // 2.2 Create Timeseries widget for test results breakdown
    const timeseriesWidgetDefinition = {
      type: "timeseries",
      title: "Test Results Breakdown",
      requests: [
        {
          q: "avg:buildappswith.tests.passed{*}",
          display_type: "line",
          style: {
            palette: "dog_classic",
            line_type: "solid",
            line_width: "normal"
          }
        },
        {
          q: "avg:buildappswith.tests.failed{*}",
          display_type: "line",
          style: {
            palette: "warm",
            line_type: "solid",
            line_width: "normal"
          }
        },
        {
          q: "avg:buildappswith.tests.skipped{*}",
          display_type: "line",
          style: {
            palette: "grey",
            line_type: "solid",
            line_width: "normal"
          }
        }
      ],
      time: {
        live_span: "1w"
      },
      yaxis: {
        label: "Count",
        min: "0",
        scale: "linear"
      },
      markers: []
    };
    
    // 2.3 Create execution time widget
    const executionTimeWidgetDefinition = {
      type: "timeseries",
      title: "Test Execution Time",
      requests: [
        {
          q: "avg:buildappswith.tests.duration{*}",
          display_type: "line",
          style: {
            palette: "cool",
            line_type: "solid",
            line_width: "normal"
          }
        }
      ],
      time: {
        live_span: "1w"
      },
      yaxis: {
        label: "Seconds",
        min: "0",
        scale: "linear"
      }
    };
    
    // 2.4 Create the group widget with child widgets
    const groupWidgetDefinition = {
      type: "group",
      title: "Test Execution Overview",
      layout_type: "ordered",
      widgets: [
        {
          id: widgetId++,
          definition: passRateWidgetDefinition
        },
        {
          id: widgetId++,
          definition: timeseriesWidgetDefinition
        },
        {
          id: widgetId++,
          definition: executionTimeWidgetDefinition
        }
      ]
    };
    
    widgets.push({
      id: widgetId++,
      definition: groupWidgetDefinition
    });
    console.log('Group widget created successfully');
    
    // 3. Create a Group widget for Component Test Performance
    console.log('Creating group widget for Component Test Performance...');
    
    // 3.1 Create Toplist widget for component test pass rate
    const componentPassRateWidgetDefinition = {
      type: "toplist",
      title: "Component Test Pass Rate",
      requests: [
        {
          q: "top(avg:buildappswith.tests.component.*.pass_rate{*} by {component}, 10, 'mean', 'desc')",
          conditional_formats: [
            {
              comparator: "<",
              value: 80,
              palette: "red"
            },
            {
              comparator: ">=",
              value: 80,
              palette: "yellow"
            },
            {
              comparator: ">=",
              value: 95,
              palette: "green"
            }
          ]
        }
      ],
      time: {
        live_span: "1d"
      }
    };
    
    // 3.2 Create Toplist widget for component test count
    const componentCountWidgetDefinition = {
      type: "toplist",
      title: "Component Test Counts",
      requests: [
        {
          q: "top(avg:buildappswith.tests.component.*.total{*} by {component}, 10, 'mean', 'desc')"
        }
      ],
      time: {
        live_span: "1d"
      }
    };
    
    // 3.3 Create Toplist widget for component test duration
    const componentDurationWidgetDefinition = {
      type: "toplist",
      title: "Component Test Duration",
      requests: [
        {
          q: "top(avg:buildappswith.tests.component.*.duration{*} by {component}, 10, 'mean', 'desc')"
        }
      ],
      time: {
        live_span: "1d"
      }
    };
    
    // 3.4 Create the component test performance group
    const componentGroupWidgetDefinition = {
      type: "group",
      title: "Component Test Performance",
      layout_type: "ordered",
      widgets: [
        {
          id: widgetId++,
          definition: componentPassRateWidgetDefinition
        },
        {
          id: widgetId++,
          definition: componentCountWidgetDefinition
        },
        {
          id: widgetId++,
          definition: componentDurationWidgetDefinition
        }
      ]
    };
    
    widgets.push({
      id: widgetId++,
      definition: componentGroupWidgetDefinition
    });
    console.log('Component Test Performance widget created successfully');
    
    // 4. Create a Group widget for Code Coverage
    console.log('Creating group widget for Code Coverage...');
    
    // 4.1 Create Timeseries widget for code coverage
    const coverageTimeseriesWidgetDefinition = {
      type: "timeseries",
      title: "Overall Coverage Metrics",
      requests: [
        {
          q: "avg:buildappswith.tests.coverage.lines{*}",
          display_type: "line",
          style: {
            palette: "dog_classic",
            line_type: "solid",
            line_width: "normal"
          }
        },
        {
          q: "avg:buildappswith.tests.coverage.statements{*}",
          display_type: "line",
          style: {
            palette: "cool",
            line_type: "solid",
            line_width: "normal"
          }
        },
        {
          q: "avg:buildappswith.tests.coverage.functions{*}",
          display_type: "line",
          style: {
            palette: "warm",
            line_type: "solid",
            line_width: "normal"
          }
        },
        {
          q: "avg:buildappswith.tests.coverage.branches{*}",
          display_type: "line",
          style: {
            palette: "purple",
            line_type: "solid",
            line_width: "normal"
          }
        }
      ],
      time: {
        live_span: "1w"
      },
      yaxis: {
        label: "Percentage",
        min: "0",
        max: "100",
        scale: "linear"
      }
    };
    
    // 4.2 Create Toplist widget for component coverage
    const componentCoverageWidgetDefinition = {
      type: "toplist",
      title: "Component Coverage",
      requests: [
        {
          q: "top(avg:buildappswith.tests.coverage.component.*.lines{*} by {component}, 10, 'mean', 'desc')",
          conditional_formats: [
            {
              comparator: "<",
              value: 60,
              palette: "red"
            },
            {
              comparator: ">=",
              value: 60,
              palette: "yellow"
            },
            {
              comparator: ">=",
              value: 80,
              palette: "green"
            }
          ]
        }
      ],
      time: {
        live_span: "1d"
      }
    };
    
    // 4.3 Create the coverage group widget
    const coverageGroupWidgetDefinition = {
      type: "group",
      title: "Code Coverage Metrics",
      layout_type: "ordered",
      widgets: [
        {
          id: widgetId++,
          definition: coverageTimeseriesWidgetDefinition
        },
        {
          id: widgetId++,
          definition: componentCoverageWidgetDefinition
        }
      ]
    };
    
    widgets.push({
      id: widgetId++,
      definition: coverageGroupWidgetDefinition
    });
    console.log('Code Coverage widget created successfully');
    
    // 5. Create a detailed Note widget at the bottom
    console.log('Creating detailed note widget...');
    const detailedNoteWidgetDefinition = {
      type: "note",
      content: "# Test Visualization Dashboard\n\nThis dashboard provides comprehensive visualization of the Buildappswith test metrics. The data is collected from Vitest test runs and includes test execution metrics, component-specific performance, and code coverage data.\n\n## Understanding the Metrics\n\n- **Test Pass Rate**: Percentage of tests that passed out of the total executed tests\n- **Component Test Performance**: Breakdown of test metrics by component\n- **Code Coverage**: Percentage of code covered by tests across different aspects\n\n## Dashboard Update Frequency\n\nThis dashboard updates automatically when tests are run and the results are processed by the Datadog agent.",
      background_color: "gray",
      font_size: "14",
      text_align: "left",
      vertical_align: "top",
      show_tick: false,
      tick_pos: "50%",
      tick_edge: "left"
    };
    
    widgets.push({
      id: widgetId++,
      definition: detailedNoteWidgetDefinition
    });
    console.log('Detailed note widget created successfully');
    
    // Create the dashboard with all widgets
    console.log('Creating dashboard definition with all widgets...');
    const dashboard = {
      title: "Buildappswith Test Dashboard",
      description: "Comprehensive visualization of test metrics for the Buildappswith platform",
      widgets: widgets,
      layout_type: "ordered",
      is_read_only: false,
      notify_list: [],
      template_variables: []
    };
    
    console.log('Dashboard created successfully');
    console.log(`Dashboard contains ${widgets.length} widgets`);
    
    return dashboard;
  } catch (error) {
    console.error('❌ Error creating dashboard definition:', error);
    console.error('Error details:', error.stack);
    throw error;
  }
}

// Create or update dashboard
async function createOrUpdateDashboard() {
  let dashboardId;
  
  // Check if we have an existing dashboard ID
  try {
    if (fs.existsSync(dashboardIdFile)) {
      dashboardId = fs.readFileSync(dashboardIdFile, 'utf8').trim();
      console.log(`Found existing dashboard ID: ${dashboardId}`);
    }
  } catch (error) {
    console.log('No existing dashboard ID found');
  }
  
  try {
    // Generate the dashboard content 
    const dashboardDefinition = generateDashboardContent();
    
    // Log the dashboard definition structure for debugging
    console.log('Dashboard Definition Structure:');
    // Create a deep copy of the dashboard definition for debugging, so we don't log API keys
    const debugDef = JSON.parse(JSON.stringify(dashboardDefinition));
    // Log only a summary to avoid excessive output
    console.log(JSON.stringify({
      title: debugDef.title,
      description: debugDef.description,
      widget_count: debugDef.widgets.length,
      layout_type: debugDef.layout_type
    }, null, 2));
    
    if (dashboardId) {
      // Try to update existing dashboard
      console.log(`Updating existing dashboard ${dashboardId}...`);
      try {
        console.log('Preparing update request...');
        const updateRequest = {
          dashboardId,
          body: dashboardDefinition
        };
        
        console.log('Sending update request to Datadog API...');
        const result = await apiInstance.updateDashboard(updateRequest);
        
        console.log(`✅ Dashboard updated successfully: ${result.id}`);
        console.log(`🔗 Dashboard URL: https://app.${DD_SITE}/dashboard/${result.id}`);
        return result;
      } catch (error) {
        console.log(`⚠️ Could not update dashboard: ${error.message}`);
        console.log('Error details:');
        if (error.responseBody) {
          try {
            const errorData = JSON.parse(error.responseBody);
            console.error(JSON.stringify(errorData, null, 2));
          } catch (e) {
            console.error('Error response:', error.responseBody);
          }
        }
        console.log('Error stack:', error.stack);
        console.log('Creating new dashboard instead...');
        // Continue to create new dashboard
      }
    }
    
    // Create new dashboard
    console.log('Creating new dashboard...');
    console.log('Preparing create request...');
    const createRequest = {
      body: dashboardDefinition
    };
    
    console.log('Sending create request to Datadog API...');
    const result = await apiInstance.createDashboard(createRequest);
    
    console.log(`✅ Dashboard created successfully: ${result.id}`);
    console.log(`🔗 Dashboard URL: https://app.${DD_SITE}/dashboard/${result.id}`);
    
    // Save dashboard ID for future updates
    fs.writeFileSync(dashboardIdFile, result.id);
    console.log(`📝 Dashboard ID saved to: ${dashboardIdFile}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error with Datadog API client: ${error.message}`);
    console.error('Stack trace:', error.stack);
    
    // Log the error type to help diagnose the issue
    console.log(`Error type: ${error.constructor.name}`);
    
    // Log available widget definition types for debugging
    console.log('Available widget definition types:');
    const widgetTypes = Object.keys(v1).filter(key => key.includes('WidgetDefinition'));
    console.log(widgetTypes.join(', '));
    
    if (error.responseBody) {
      try {
        const errorData = JSON.parse(error.responseBody);
        console.error('Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.error('Error response:', error.responseBody);
      }
    }
    
    process.exit(1);
  }
}

// Execute dashboard creation
createOrUpdateDashboard().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
