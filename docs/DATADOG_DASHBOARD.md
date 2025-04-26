# Datadog Dashboard Integration

This document describes the Datadog test visualization dashboard integration for the Buildappswith platform.

## Overview

The Datadog dashboard integration provides real-time visualization of test results from our CI/CD pipeline. Instead of importing dashboards via JSON (which can lead to format incompatibilities), we use the Datadog API to programmatically create and update dashboards.

## Configuration

### Required Environment Variables

The dashboard creation script requires the following environment variables:

- `DD_API_KEY` or `DATADOG_API_KEY`: Your Datadog API key
- `DD_APP_KEY` or `DATADOG_APP_KEY`: Your Datadog Application key
- `DD_SITE` or `DATADOG_SITE`: (Optional) Your Datadog site (default: `datadoghq.com`)

These can be set in any of the following files:
- `.env`
- `.env.development`
- `.env.local`
- `.env.production.local`

### Creating API Keys

To create the necessary API and Application keys:

1. Log in to your Datadog account
2. Navigate to **Organization Settings** > **API Keys**
3. Create a new API key if needed
4. Navigate to **Organization Settings** > **Application Keys**
5. Create a new Application key if needed

## Usage

### Manually Creating/Updating the Dashboard

To manually create or update the dashboard, run:

```bash
node scripts/datadog/dashboards/create-dashboard.js
```

This script will:
1. Check for an existing dashboard ID stored in `.datadog-dashboard-id`
2. If found, attempt to update the existing dashboard
3. If not found or update fails, create a new dashboard
4. Store the dashboard ID in `.datadog-dashboard-id` for future updates

### CI/CD Integration

The dashboard is automatically updated as part of our GitHub Actions CI/CD workflow. After tests are run, the dashboard is updated with the latest results.

## Dashboard Structure

The dashboard includes the following sections:

1. **Test Execution Overview** - Group widget containing:
   - Test Pass Rate (query_value widget)
   - Test Results Breakdown (timeseries widget)
2. **Dashboard Information** - Note widget explaining the dashboard purpose and metrics

## Dashboard API Structure (Updated 1.0.100)

After multiple iterations and testing, we've determined the exact structure required by the Datadog API. The critical discovery is that we should **NOT** use the Datadog API model classes (like `new v1.NoteWidgetDefinition()`) and instead use plain JavaScript objects that exactly match the structure from an exported dashboard.

### Key Findings

1. **Use Plain JavaScript Objects**: Avoid using Datadog API model classes like `new v1.NoteWidgetDefinition()` and instead use plain objects
2. **Widget IDs Are Required**: Each widget must have a unique `id` property (numeric)
3. **Proper Widget Definition Format**: The definition must match exactly what's exported from Datadog UI
4. **Time Specification**: Include proper `time` properties with `live_span` values
5. **Proper Nesting for Groups**: Group widgets must include a widgets array with properly structured child widgets
6. **Proper Metric Prefixing**: Use consistent prefix (`buildappswith.tests.*`) for all metrics

### Correct Widget Structure Examples

```javascript
// Group widget example
{
  id: 0,  // Widget ID is important
  definition: {
    type: "group",
    title: "Test Execution Overview",
    layout_type: "ordered",
    widgets: [
      {
        id: 1,  // Child widgets also need IDs
        definition: {
          title: "Test Pass Rate",
          type: "query_value",
          requests: [
            {
              q: "avg:buildappswith.tests.pass_rate{*}",
              aggregator: "avg"
            }
          ],
          precision: 2,
          time: {
            live_span: "1d"
          },
          autoscale: true,
          custom_unit: "%"
        }
      }
    ]
  }
}

// Note widget example
{
  id: 3,
  definition: {
    type: "note",
    content: "# Test Visualization Dashboard\n\nThis dashboard provides visualization of the Buildappswith test metrics.",
    background_color: "gray",
    font_size: "14",
    text_align: "left", 
    vertical_align: "top",
    show_tick: false,
    tick_pos: "50%",
    tick_edge: "left"
  }
}

// Toplist widget example
{
  id: 5,
  definition: {
    title: "Component Test Pass Rate",
    type: "toplist",
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
  }
}
```

### Dashboard Validation

We've confirmed that the following structure works correctly with the Datadog API:

```javascript
{
  title: "Buildappswith Test Dashboard",
  description: "Comprehensive visualization of test metrics for the Buildappswith platform",
  widgets: [
    // Array of widgets with IDs and proper definitions
  ],
  template_variables: [],
  layout_type: "ordered",
  is_read_only: false,
  notify_list: []
}
```

This structure exactly matches what the Datadog UI exports and is validated to work with the API client.

## Valid Widget Types

Based on the Datadog-model.txt file, supported widget types include:

- `alert_graph`, `alert_value`, `change`, `check_status`
- `distribution`, `event_stream`, `event_timeline`
- `free_text`, `funnel`, `geomap`, `group`
- `heatmap`, `hostmap`, `iframe`, `image`
- `list_stream`, `log_stream`, `monitor_summary`
- `note`, `powerpack`, `query_value`, `run_workflow`
- `slo_list`, `slo`, `scatterplot`
- `servicemap`, `service_summary`, `split_graph`
- `sunburst`, `table`, `timeseries`, `toplist`
- `topology_map`, `treemap`

Each widget type has specific required properties that must be included in the definition.

## Troubleshooting

### Common Errors

- **"[object Object] doesn't match any type from AlertGraphWidgetDefinition..."**: This error indicates that your widget definition doesn't match any of the expected types. Ensure you're using the exact structure from a successful Datadog UI export.

- **"Missing required property 'layout_type'"**: This error occurs when a group widget doesn't include the required `layout_type` property. Always include `layout_type: "ordered"` within group widget definitions.

- **Authentication errors**: Verify API and Application keys are set correctly

- **Dashboard not found**: The dashboard ID in `.datadog-dashboard-id` may be invalid or the dashboard was deleted

### Best Practices

1. **Start Simple**: Begin with a minimal dashboard with just one or two widgets
2. **Use Exported JSON as Reference**: Export a working dashboard from the Datadog UI to understand the exact structure
3. **Include Widget IDs**: Always include unique numeric IDs for each widget
4. **Check the Types**: Verify widget type names match exactly (e.g., "query_value" not "queryValue")
5. **Include All Required Properties**: Each widget type has specific required properties 

## Extending the Dashboard

To add new visualization widgets to the dashboard:

1. Modify the `generateDashboardContent()` function in `scripts/datadog/dashboards/create-dashboard.js`
2. Follow the structure of existing widgets, ensuring proper IDs and definition types
3. Run the script to update the dashboard

When adding widgets, follow this pattern:

```javascript
{
  id: 123,  // Unique numeric ID
  definition: {
    type: "widget_type_name",
    title: "Widget Title",
    // Include all required properties for the specific widget type
    // ...
  }
}
```

## References

- [Datadog API Documentation](https://docs.datadoghq.com/api/latest/)
- [Datadog Dashboard API](https://docs.datadoghq.com/api/latest/dashboards/)
- [Datadog Node.js Client](https://www.npmjs.com/package/@datadog/datadog-api-client)
