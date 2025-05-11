# Datadog Integration: Next Steps

This document outlines the next steps to complete the Datadog APM and observability integration.

## Verification Steps

1. **Deploy to Test/Staging Environment**
   - Deploy the application to a test or staging environment
   - Ensure all required environment variables are set
   - Verify that the application loads and functions correctly with monitoring enabled

2. **Verify Data Collection**
   - **APM Traces**: Check the Datadog APM UI for traces from the application
     - URL: https://app.datadoghq.eu/apm/traces
     - Verify service name appears as `buildappswith-platform`
     - Check that critical paths (auth, booking, payments) are traced
   
   - **RUM Sessions**: Verify RUM sessions appear in the RUM dashboard
     - URL: https://app.datadoghq.eu/rum/application/0cabecbc-19cd-4ac1-981b-044df899c74b
     - Confirm user sessions, page loads, and frontend errors are captured
     - Check that user actions are tracked correctly
   
   - **Logs**: Confirm logs are sent and correlated with traces
     - URL: https://app.datadoghq.eu/logs
     - Verify log correlation with APM traces (trace IDs should be linked)
     - Check that structured metadata appears correctly

3. **Test Error Tracking Integration**
   - Trigger a test error in the application
   - Verify the error appears in both Sentry and Datadog
   - Confirm trace context links exist between platforms
   - Test both frontend and backend error scenarios

## Optimization Steps

1. **Fine-tune Sampling Rates**
   - Review initial data volumes in Datadog
   - Adjust sampling rates in `lib/datadog/config.ts` based on traffic
   - Consider increasing critical transaction sampling while reducing overall rates
   - Recommended sampling rates:
     - Production: 5-10% general traffic, 100% for critical paths
     - Staging: 20-50% general traffic, 100% for critical paths
     - Development: 100% for all traffic to aid debugging

2. **Implement Custom Business Metrics**
   - Add custom spans for important business operations:
     ```typescript
     import { createSpan, withSpan } from '@/lib/datadog/tracer';
     
     // Manual span creation
     const span = createSpan('business.operation', {
       service: 'booking-service',
       resource: 'create-booking',
       tags: { booking_type: 'premium' }
     });
     
     try {
       // Business logic
     } finally {
       span.finish();
     }
     
     // Or using the wrapper function
     const processBooking = withSpan(
       'business.process_booking',
       async (bookingData) => {
         // Implementation
         return result;
       },
       { resource: 'process-booking' }
     );
     ```
   
   - Create dashboard widgets for business-specific metrics
   - Add custom metrics for conversion rates, signup completion, etc.

3. **Set Up Alerts**
   - Configure alerts for critical performance thresholds
   - Set up error rate monitors for key services
   - Create availability monitors for critical API endpoints
   - Configure anomaly detection for unusual patterns
   - Ensure alert notifications are sent to appropriate channels

## Documentation Steps

1. **Update Environment Variable Documentation**
   - Add all Datadog environment variables to environment variable reference
   - Document required vs. optional variables
   - Include example values and descriptions

2. **Create Developer Guide**
   - Document how to use tracing utilities in custom code
   - Provide examples for common instrumentation scenarios
   - Include troubleshooting section for common issues

3. **Dashboard Documentation**
   - Document available dashboards and their purposes
   - Include screenshots and explanations of key metrics
   - Provide guidance on creating custom dashboards

## Implementation Enhancements

1. **Add Browser Logs Integration**
   - Enhance client-side error reporting
   - Configure sensitive data scrubbing
   - Integrate with frontend framework error boundaries

2. **Implement User Journey Tracking**
   - Set up user session tracking across pages
   - Create funnels for critical user journeys
   - Measure conversion rates and drop-offs

3. **Extend Database Monitoring**
   - Add more detailed Prisma query tracking
   - Monitor database performance and query patterns
   - Create dashboard for database health metrics

## Required Environment Variables

```
# Server-side Datadog APM
DD_API_KEY=your_api_key
DD_ENV=production|staging|development
DD_SERVICE=buildappswith-platform
DD_VERSION=1.0.0

# Client-side Datadog RUM
NEXT_PUBLIC_DATADOG_SITE=datadoghq.eu
NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID=0cabecbc-19cd-4ac1-981b-044df899c74b
NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN=your_rum_client_token

# Optional configuration
DATADOG_ENABLE_DEV=true|false  # Enable Datadog in development
```

## Resources

- [Datadog APM Documentation](https://docs.datadoghq.com/tracing/)
- [Datadog RUM Documentation](https://docs.datadoghq.com/real_user_monitoring/)
- [Datadog Logs Documentation](https://docs.datadoghq.com/logs/)
- [Datadog Dashboards Documentation](https://docs.datadoghq.com/dashboards/)