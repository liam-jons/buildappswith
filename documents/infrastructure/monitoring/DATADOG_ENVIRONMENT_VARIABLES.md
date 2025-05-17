# Datadog Environment Variables

This document provides details about all environment variables used for Datadog integration in the BuildAppsWith platform.

## Required Environment Variables

### Server-Side Variables (APM)

| Variable | Description | Example |
|----------|-------------|---------|
| `DD_API_KEY` | Datadog API key for sending data | `a1b2c3d4e5f6g7h8i9j0` |
| `DD_ENV` | Environment name (production, staging, etc.) | `production` |
| `DD_SERVICE` | Service name for the application | `buildappswith-platform` |
| `DD_VERSION` | Application version | `1.0.0` |

### Client-Side Variables (RUM)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID` | RUM application ID | `0cabecbc-19cd-4ac1-981b-044df899c74b` |
| `NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN` | RUM client token | `pub1a2b3c4d5e6f7g8h9i0` |
| `NEXT_PUBLIC_DATADOG_SITE` | Datadog site to send data to | `datadoghq.eu` |

## Optional Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATADOG_ENABLE_DEV` | Enable Datadog in development | `false` | `true` |
| `DATADOG_ENABLE_TEST` | Enable Datadog in test environment | `false` | `true` |
| `DATADOG_SERVICE_NAME` | Override the service name | `buildappswith-platform` | `buildappswith-api` |
| `DATADOG_SITE` | Datadog site for server-side | `datadoghq.com` | `datadoghq.eu` |
| `DD_TRACE_SAMPLE_RATE` | Global sample rate override | Config-based | `0.5` |
| `DD_LOGS_INJECTION` | Enable automatic log correlation | `true` | `false` |
| `DD_RUNTIME_METRICS_ENABLED` | Enable runtime metrics | `true` | `false` |
| `DD_PROFILING_ENABLED` | Enable code profiling | Environment-specific | `true` |
| `NEXT_PUBLIC_APP_VERSION` | Public app version for client tracking | `1.0.0` | `1.2.3` |

## Environment-Specific Configurations

Our implementation uses different default configurations based on the environment. These are defined in the `lib/datadog/config.ts` file:

### Development

```
enabled: process.env.DATADOG_ENABLE_DEV === 'true'
sampleRate: 1.0
logSampleRate: 1.0
rumSampleRate: 1.0
rumSessionReplaySampleRate: 1.0
profiling: true
debugging: true
```

### Testing

```
enabled: process.env.DATADOG_ENABLE_TEST === 'true'
sampleRate: 1.0
logSampleRate: 1.0
rumSampleRate: 1.0
rumSessionReplaySampleRate: 0.0
profiling: false
debugging: true
```

### Staging

```
enabled: true
sampleRate: 0.5
logSampleRate: 0.5
rumSampleRate: 0.5
rumSessionReplaySampleRate: 0.3
profiling: true
debugging: true
```

### Production

```
enabled: true
sampleRate: 0.1
logSampleRate: 0.2
rumSampleRate: 0.1
rumSessionReplaySampleRate: 0.05
profiling: true
debugging: false
```

## Setting Up Environment Variables

### Local Development

For local development, create a `.env.local` file with:

```
# Datadog - Development
DATADOG_ENABLE_DEV=true
DD_API_KEY=your_api_key
NEXT_PUBLIC_DATADOG_SITE=datadoghq.eu
NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID=your_rum_app_id
NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN=your_rum_client_token
```

### Production Environment

In production, ensure these variables are set in your hosting platform (e.g., Vercel):

```
# Datadog - Production
DD_API_KEY=your_api_key
DD_ENV=production
DD_SERVICE=buildappswith-platform
DD_VERSION=1.0.0
NEXT_PUBLIC_DATADOG_SITE=datadoghq.eu
NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID=your_rum_app_id
NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN=your_rum_client_token
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Security Considerations

- Never commit API keys or tokens to the repository
- Use environment-specific API keys
- Consider using read-only API keys where possible
- RUM client tokens are public but should still be treated carefully