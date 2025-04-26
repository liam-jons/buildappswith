# Datadog Dashboard Creation

This directory contains scripts for programmatically creating and updating Datadog dashboards for test visualization.

## Overview

Instead of manually importing JSON dashboards (which can be error-prone due to format incompatibilities), these scripts use the Datadog API to create and update dashboards directly. This approach is more reliable and allows for automated dashboard management as part of the CI/CD pipeline.

## Scripts

### `create-dashboard.js`

This script creates or updates a Datadog dashboard for visualizing test results.

#### Features

- Creates a new dashboard if one doesn't exist
- Updates an existing dashboard if already created
- Saves the dashboard ID for future updates
- Handles authentication and API integration
- Provides detailed error reporting

#### Usage

```bash
# Direct execution
node scripts/datadog/dashboards/create-dashboard.js

# Or through the setup script
node scripts/setup-datadog-test-visualization.js
```

#### Requirements

- Datadog API key and Application key set in environment variables
- Node.js environment

#### Environment Variables

- `DATADOG_API_KEY` or `DD_API_KEY`: Your Datadog API key
- `DATADOG_APP_KEY` or `DD_APP_KEY`: Your Datadog Application key
- `DATADOG_SITE` or `DD_SITE`: Optional, the Datadog site to use (default: 'datadoghq.com')

## Dashboard Structure

The dashboard is structured with several widget groups:

1. **Build and Test Information**: Overview of the test visualization dashboard
2. **Test Summary**: Key metrics like pass rate, total tests, and average duration
3. **Test Results Over Time**: Graphs showing test counts and duration trends
4. **Code Coverage**: Line, function, and branch coverage metrics
5. **Component Test Results**: Component-specific test metrics

## Customization

To customize the dashboard, edit the `createDashboardDefinition` function in the `create-dashboard.js` script. The function returns a JSON object that defines the dashboard structure according to the [Datadog Dashboard API specification](https://docs.datadoghq.com/api/latest/dashboards/).

## Integration with CI/CD

The dashboard creation script is integrated into the GitHub Actions workflow in `.github/workflows/datadog-tests.yml`. After tests run, the workflow:

1. Installs the required dependency (`@datadog/datadog-api-client`)
2. Runs the dashboard creation script
3. Updates the GitHub step summary with a link to the dashboard

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your API and Application keys are correctly set and have the necessary permissions.

2. **Dashboard Not Updating**: Check that the `.datadog-dashboard-id` file exists in the project root.

3. **API Client Errors**: The script will install the required API client package, but if you encounter issues, try installing it manually:
   ```bash
   npm install @datadog/datadog-api-client
   ```

4. **Dashboard Not Found**: If the dashboard ID in `.datadog-dashboard-id` is no longer valid, delete the file and run the script again to create a new dashboard.

### Get Detailed Logs

Run the script with debugging output for more detailed logs:

```bash
DEBUG=1 node scripts/datadog/dashboards/create-dashboard.js
```

## Resources

- [Datadog Dashboard API Documentation](https://docs.datadoghq.com/api/latest/dashboards/)
- [Datadog API Client for Node.js](https://www.npmjs.com/package/@datadog/datadog-api-client)
- [Datadog Dashboard Widget Documentation](https://docs.datadoghq.com/dashboards/widgets/)
