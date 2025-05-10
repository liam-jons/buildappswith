# Sentry Environment Variable Setup Guide

*Version: 1.0.0*  
*Date: May 8, 2025*  
*Status: Draft*

## 1. Core Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Data Source Name | Yes | None |
| `SENTRY_AUTH_TOKEN` | Auth token for API access | Yes | None |
| `SENTRY_ORG` | Sentry organization slug | Yes | "build-apps-with" |
| `SENTRY_PROJECT` | Sentry project identifier | Yes | "javascript-nextjs" |
| `SENTRY_ENVIRONMENT` | Environment name | Yes | `process.env.NODE_ENV` |
| `SENTRY_RELEASE` | Release identifier | No | `buildappswith@${APP_VERSION}` |

## 2. Environment-Specific Variables

### 2.1 Development Environment

```env
# .env.development
NEXT_PUBLIC_SENTRY_DSN=https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376
SENTRY_ENVIRONMENT=development
SENTRY_DEBUG=true
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_FILTER_LOCAL=false
SENTRY_LOG_LEVEL=debug
SENTRY_ENABLE_SOURCEMAPS=true
```

**Development Environment Notes:**
- Full sampling rate (1.0) for comprehensive monitoring
- Debug mode enabled for verbose logging
- Source maps enabled for accurate stack traces
- Local PII filtering disabled for easier debugging
- Verbose logging with debug level enabled

### 2.2 Staging Environment

```env
# .env.staging
NEXT_PUBLIC_SENTRY_DSN=https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376
SENTRY_ENVIRONMENT=staging
SENTRY_DEBUG=false
SENTRY_TRACES_SAMPLE_RATE=0.5
SENTRY_FILTER_LOCAL=true
SENTRY_LOG_LEVEL=info
SENTRY_ENABLE_SOURCEMAPS=true
```

**Staging Environment Notes:**
- Medium sampling rate (0.5) for balanced monitoring
- Debug mode disabled for production-like behavior
- Source maps enabled for accurate stack traces
- PII filtering enabled to match production behavior
- Standard logging with info level

### 2.3 Production Environment

```env
# .env.production
NEXT_PUBLIC_SENTRY_DSN=https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376
SENTRY_ENVIRONMENT=production
SENTRY_DEBUG=false
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_FILTER_LOCAL=true
SENTRY_LOG_LEVEL=warn
SENTRY_ENABLE_SOURCEMAPS=true
```

**Production Environment Notes:**
- Lower sampling rate (0.1) to minimize overhead
- Debug mode disabled for optimal performance
- Source maps enabled for accurate stack traces
- PII filtering strictly enabled for compliance
- Minimal logging with warn level for reduced noise

## 3. CI/CD-Specific Variables

```env
# CI/CD Pipeline Variables
SENTRY_AUTH_TOKEN=${SECRET_SENTRY_AUTH_TOKEN}
SENTRY_ORG=build-apps-with
SENTRY_PROJECT=javascript-nextjs
SENTRY_RELEASE=${COMMIT_SHA}
SENTRY_UPLOAD_SOURCEMAPS=true
SENTRY_SOURCEMAP_UPLOAD_DEBUG=false
```

**CI/CD Notes:**
- Authentication token securely stored in CI secrets
- Release tied to specific commit SHA for traceability
- Source map upload explicitly enabled
- Source map debug mode disabled in CI

## 4. Test Environment Variables

```env
# .env.test
NEXT_PUBLIC_SENTRY_DSN=https://fbc43927da128c3a176f85092ef2bb5c@o4509207749328896.ingest.de.sentry.io/4509207750967376
SENTRY_ENVIRONMENT=test
SENTRY_ENABLE_IN_TESTS=false
SENTRY_DEBUG=false
SENTRY_TRACES_SAMPLE_RATE=0
```

**Test Environment Notes:**
- Sentry disabled by default in tests
- Can be selectively enabled with SENTRY_ENABLE_IN_TESTS
- Zero sampling rate to minimize performance impact
- Debug mode disabled to minimize logging noise

## 5. Environment Variable Configuration Guide

### 5.1 Local Development Setup

1. Copy `.env.example` to `.env.local`
2. Obtain Sentry DSN from the Sentry dashboard
3. Use development presets for local work:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Sentry DSN and development settings
   ```

### 5.2 Staging/Production Deployment

1. Configure environment variables in deployment platform:
   - For Vercel: Use Environment Variables section in project settings
   - For custom deployment: Set up environment variables in your deployment pipeline

2. Store sensitive tokens as secrets:
   ```bash
   # Add to Vercel secrets
   vercel secrets add sentry-auth-token "your-auth-token"
   
   # Reference in vercel.json
   {
     "env": {
       "SENTRY_AUTH_TOKEN": "@sentry-auth-token"
     }
   }
   ```

3. Validate environment detection on deployment:
   ```bash
   # Check environment configuration
   NODE_ENV=production node -e "console.log(require('./lib/sentry/config').sentryConfig.getEnvironmentConfig())"
   ```

### 5.3 Feature Branch Testing

1. Optionally create specific projects for feature testing:
   ```bash
   # Setup feature branch environment
   SENTRY_ENVIRONMENT=feature-branch-name
   ```

2. Use branch name in environment value for clear separation:
   ```bash
   # Set in CI/CD for feature branches
   if [[ $BRANCH_NAME != "main" && $BRANCH_NAME != "staging" ]]; then
     export SENTRY_ENVIRONMENT="feature-${BRANCH_NAME}"
   fi
   ```

### 5.4 Environment Access Control

1. Restrict production Sentry access to senior team members
2. Use separate auth tokens for different environments:
   ```bash
   # Development token
   SENTRY_AUTH_TOKEN_DEV=xxx
   
   # Production token
   SENTRY_AUTH_TOKEN_PROD=yyy
   
   # Use in scripts
   if [[ $NODE_ENV == "production" ]]; then
     export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN_PROD
   else
     export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN_DEV
   fi
   ```
3. Implement IP restrictions for production Sentry access through Sentry organization settings

## 6. Troubleshooting

### 6.1 Missing DSN
- **Symptom**: Errors not reporting to Sentry
- **Fix**: Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly

### 6.2 Source Map Issues
- **Symptom**: Stack traces show minified code
- **Fix**: Ensure `SENTRY_ENABLE_SOURCEMAPS=true` and source maps are uploading properly

### 6.3 Environment Detection
- **Symptom**: Errors showing up in wrong environment
- **Fix**: Explicitly set `SENTRY_ENVIRONMENT` in your runtime environment