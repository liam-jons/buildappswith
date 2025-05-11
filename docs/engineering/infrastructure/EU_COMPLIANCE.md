# EU Compliance Guide

*Version: 1.0.0*
*Date: 2025-05-11*
*Status: Draft*

## Overview
This document outlines how the BuildAppsWith platform ensures compliance with EU data regulations across all infrastructure components. Our approach follows the principles of data protection by design and by default, addressing GDPR and related EU data protection requirements.

## Data Residency

All infrastructure components are configured to store data in EU regions:

### Sentry
- Uses EU-specific DSN pointing to EU-hosted instances
- Region explicitly set to 'eu' in configuration
- Sourcemaps and error reports stored in EU data centers
- PII filtering applied before data is sent to Sentry

```typescript
// In lib/sentry/config.ts
export const sentryConfig = {
  // EU region configuration
  region: 'eu',
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 
    "https://your-key@ingest.de.sentry.io/your-project",
  
  // Rest of configuration
};
```

### Logger
- Implements PII redaction for EU compliance
- Marks logs with region metadata for auditing
- Sanitizes sensitive data before storage or transmission
- Configurable via environment variables

```typescript
// Environment variable configuration
NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true
NEXT_PUBLIC_DATA_REGION=eu
```

### Authentication
- Ensures user data is handled in accordance with EU regulations
- Uses EU-hosted Clerk instances where possible
- Minimizes data collection to necessary information only
- Implements proper consent flows for data collection

## PII Handling

### Automatic PII Redaction
The logger automatically redacts potentially sensitive information:

```typescript
// With EU compliance enabled (NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true)
logger.info('User updated', {
  userId: '123',       // Not redacted (identifier only)
  email: 'user@example.com', // Redacted to [REDACTED]
  name: 'John Doe',    // Redacted to [REDACTED]
  preferences: { theme: 'dark' } // Not redacted (not PII)
});
```

### Sentry Data Filtering
Sentry is configured to filter sensitive data:

```typescript
// In lib/sentry/sensitive-data-filter.ts
export function configureSentryDataFiltering(config) {
  return {
    ...config,
    beforeSend: (event) => {
      // Remove PII from error events
      if (event.user && event.user.email) {
        event.user.email = '[REDACTED]';
      }
      
      // Remove other PII from event data
      if (event.extra) {
        sanitizeObject(event.extra);
      }
      
      return event;
    }
  };
}
```

## Enabling EU Compliance

Enable EU compliance features with the following environment variables:

```bash
# For logger EU compliance
NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true
NEXT_PUBLIC_DATA_REGION=eu

# For Sentry EU data residency
NEXT_PUBLIC_SENTRY_DSN=https://your-key@ingest.de.sentry.io/your-project

# For Clerk EU data handling
CLERK_REGION=eu
```

## Compliance Testing

To verify EU compliance features are working correctly:

### Logger PII Testing
```typescript
// Test EU compliance with sensitive data
import { logger } from '@/lib/logger';

function testEUCompliance() {
  logger.info('Sensitive data test', {
    userId: '123',
    email: 'test@example.com',
    creditCard: '1234-5678-9012-3456',
    userDetails: {
      address: '123 Main St',
      preferences: { theme: 'dark' }
    }
  });
  
  // Check logs to verify redaction
}
```

### Sentry PII Testing
```typescript
// Test Sentry PII filtering
import * as Sentry from '@sentry/nextjs';

function testSentryPIIFiltering() {
  try {
    throw new Error('Test error with PII');
  } catch (error) {
    Sentry.captureException(error, {
      user: {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User'
      },
      extra: {
        sensitiveData: 'This should be filtered'
      }
    });
    
    // Check Sentry dashboard to verify redaction
  }
}
```

## Data Subject Rights Support

Our infrastructure components support GDPR data subject rights:

1. **Right to Access**: User data can be exported and provided to the user
2. **Right to Rectification**: User data can be corrected or updated
3. **Right to Erasure**: User data can be deleted upon request
4. **Right to Restrict Processing**: Processing can be limited to specific purposes
5. **Right to Data Portability**: Data can be exported in machine-readable format
6. **Right to Object**: Users can object to certain processing

## Integration with Data Protection Impact Assessment

Each infrastructure component has been evaluated as part of our Data Protection Impact Assessment (DPIA) process:

| Component | Data Classification | Risk Level | Mitigation Measures |
|-----------|---------------------|------------|---------------------|
| Sentry | Error & Performance | Medium | PII filtering, EU hosting, minimal data collection |
| Logger | System & User Activity | Medium | PII redaction, controlled access, retention limits |
| Authentication | Identity & Access | High | EU hosting, minimal data collection, encryption |

## Regulatory References

- **GDPR**: [General Data Protection Regulation](https://gdpr-info.eu/)
- **EU-US Data Privacy Framework**: [DPF Information](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/eu-us-data-transfers_en)
- **ePrivacy Directive**: [Directive 2002/58/EC](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32002L0058)

## Further Reading
- [Sentry Implementation Guide](/docs/engineering/infrastructure/monitoring/SENTRY_IMPLEMENTATION_GUIDE.md)
- [Logger Migration Guide](/docs/engineering/infrastructure/monitoring/LOGGER_MIGRATION_GUIDE.md)
- [Clerk Express Migration Guide](/docs/engineering/infrastructure/authentication/CLERK_EXPRESS_MIGRATION_GUIDE.md)