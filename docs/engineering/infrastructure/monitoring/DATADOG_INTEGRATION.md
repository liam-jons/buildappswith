# Datadog Test Visualization Integration

This document provides a quick guide to setting up and using the Datadog test visualization integration for the Buildappswith platform.

## Overview

The Datadog test visualization integration allows you to:

1. Run tests with automatic reporting to Datadog
2. Visualize test results and metrics in Datadog dashboards
3. Track test performance over time
4. Monitor code coverage trends
5. Integrate with CI/CD pipelines for continuous monitoring

## Requirements

- Datadog account with API and Application keys
- Datadog agent installed locally (for local development)
- Properly configured environment variables

## Quick Start

### 1. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
# Datadog API credentials for test visualization
DATADOG_API_KEY=your_api_key_here
DATADOG_APP_KEY=your_app_key_here
```

### 2. Run the Setup Script

```bash
node scripts/setup-datadog-test-visualization.js
```

This will:
- Check for Datadog agent installation
- Create necessary directory structure
- Configure package.json with test scripts
- Create or update the Datadog dashboard using the Datadog API

#### Dashboard Creation

The setup automatically creates a Datadog dashboard via the API. When successful, you'll receive a URL to access the dashboard directly. The dashboard ID is saved in a `.datadog-dashboard-id` file in the project root, which enables future updates to the same dashboard.

### 3. Verify the Integration

```bash
node scripts/verify-datadog-metrics.js
```

This will run a test and verify that metrics are being reported to Datadog correctly.

### 4. Run Tests with Datadog Reporting

```bash
# Run all tests with Datadog reporting
pnpm run test:datadog

# Run tests with coverage and reporting
pnpm run test:datadog:coverage

# Run specific test suites with reporting
pnpm run test:datadog:marketplace
pnpm run test:datadog:auth
pnpm run test:datadog:integration
```

## CI/CD Integration

The GitHub Actions workflow at `.github/workflows/datadog-tests.yml` is set up to:

1. Run after the main CI tests
2. Install and configure the Datadog agent
3. Run tests with Datadog reporting
4. Upload test artifacts for reference

To enable this workflow, add the following secrets to your GitHub repository:

- `DATADOG_API_KEY`: Your Datadog API key
- `DATADOG_APP_KEY`: Your Datadog application key

## Dashboard Creation Approach

### API-Based Dashboard Creation

Buildappswith uses a programmatic approach to create and update Datadog dashboards instead of relying on JSON import. This approach:

1. **Eliminates JSON Format Compatibility Issues**: Datadog's dashboard JSON format can change over time, causing import errors.
2. **Provides More Control**: We can dynamically create and update dashboards based on the current environment.
3. **Integrates Seamlessly with CI/CD**: The dashboard creation/update process can be automated in CI/CD pipelines.
4. **Enables Version Control**: The dashboard definition is stored in code and can be versioned together with the application.

### How It Works

The dashboard creation is handled by the script at `scripts/datadog/dashboards/create-dashboard.js`, which:

1. Authenticates with the Datadog API using your API and Application keys
2. Defines a dashboard with appropriate widgets for test visualization
3. Creates a new dashboard or updates an existing one based on the saved dashboard ID
4. Saves the dashboard ID to `.datadog-dashboard-id` for future updates

### Why Not Use JSON Import?

We migrated from JSON import to API-based creation because:

- **Format Incompatibilities**: Datadog's dashboard JSON format evolves, causing "Unable to import dashboard with different layout type" errors.
- **ID Conflicts**: Dashboard JSON with IDs can cause errors when Datadog tries to update non-existent dashboards.
- **Missing Data Source Types**: Some dashboards reference data sources that aren't properly defined in the JSON.
- **Complex Structure**: The dashboard JSON structure is complex and difficult to maintain manually.

## Troubleshooting

### Common Issues

1. **Missing Datadog Agent**: Install with `brew install datadog-agent` on Mac or follow instructions at https://docs.datadoghq.com/agent/ for Linux.

2. **Environment Variable Errors**: Ensure your `.env.local` file contains the correct Datadog API and APP keys.

3. **Metrics Not Appearing**: Allow up to 5 minutes for metrics to be processed and appear in Datadog. Verify the agent is running with `datadog-agent status`.

4. **CI/CD Integration Issues**: Check that GitHub Secrets are properly configured and that the workflow has the necessary permissions.

5. **Dashboard Creation Errors**: If you encounter issues with dashboard creation, try running the script manually:
   ```bash
   node scripts/datadog/dashboards/create-dashboard.js
   ```
   This will provide detailed error messages that can help identify the issue.

6. **Dashboard Not Updating**: Ensure the `.datadog-dashboard-id` file exists in the project root. If it doesn't, the script will create a new dashboard.

7. **API Client Issues**: Make sure the `@datadog/datadog-api-client` package is installed. The script will attempt to install it automatically if missing.

### Verification

If you're unsure whether metrics are being reported correctly, run:

```bash
node scripts/verify-datadog-metrics.js
```

This will provide debugging information about the metrics reporting process.

## Customizing the Dashboard

To customize the dashboard structure, edit the `createDashboardDefinition` function in `scripts/datadog/dashboards/create-dashboard.js`. The function returns a JSON object that defines the dashboard according to the Datadog Dashboard API specification.

Common customizations include:

- **Adding new widgets**: Add additional widget definitions to the appropriate widget groups
- **Changing metrics**: Modify the query strings to track different metrics
- **Updating layout**: Adjust the layout type or widget group organization
- **Enhancing visualization**: Modify color palettes, time ranges, or display formats

## Additional Resources

- [Datadog API Documentation](https://docs.datadoghq.com/api/latest/)
- [Datadog Dashboard API](https://docs.datadoghq.com/api/latest/dashboards/)
- [Datadog Widget Documentation](https://docs.datadoghq.com/dashboards/widgets/)
- [Full Testing Framework Documentation](./TESTING_FRAMEWORK.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
