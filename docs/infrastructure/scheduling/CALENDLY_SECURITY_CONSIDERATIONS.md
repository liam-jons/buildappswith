# Calendly Integration Security Considerations

*Version: 1.0.0*

This document outlines the security considerations for API key management and other security aspects of the Calendly integration with the BuildAppsWith platform.

## API Key Management

### 1. Environment Variable Management

- **Separation of Environments**: Use different API tokens for development, staging, and production environments
- **Restriction of Access**: Limit access to environment variables to only necessary personnel
- **No Hardcoding**: Never hardcode tokens in source code or configuration files
- **Rotation Schedule**: Establish a regular rotation schedule for all API keys and tokens

```typescript
// Example environment configuration
// .env.development
CALENDLY_API_TOKEN=dev_token_here
CALENDLY_WEBHOOK_SECRET=dev_webhook_secret

// .env.production
CALENDLY_API_TOKEN=prod_token_here
CALENDLY_WEBHOOK_SECRET=prod_webhook_secret
```

### 2. Secure Storage

- **Encryption at Rest**: Ensure OAuth tokens stored in the database are encrypted
- **Minimal Data Storage**: Store only necessary token information and metadata
- **Database Security**: Apply proper access controls and encryption to the database

```typescript
// Example of storing encrypted tokens
import { encrypt, decrypt } from '@/lib/encryption';

class SecureTokenStorage {
  async storeToken(userId: string, token: string): Promise<void> {
    const encryptedToken = encrypt(token);
    await prisma.userTokens.upsert({
      where: { userId },
      update: { token: encryptedToken },
      create: { userId, token: encryptedToken }
    });
  }
  
  async getToken(userId: string): Promise<string> {
    const data = await prisma.userTokens.findUnique({
      where: { userId }
    });
    
    if (!data) {
      throw new Error('Token not found');
    }
    
    return decrypt(data.token);
  }
}
```

### 3. Access Control

- **Principle of Least Privilege**: Request only the required scopes for the application
- **Role-Based Access**: Restrict access to token management functions to administrators
- **Token Expiry**: Ensure all tokens have a limited lifetime and proper refresh process

### 4. Secure Transmission

- **HTTPS Only**: Use HTTPS for all API communications
- **TLS 1.2+**: Enforce modern TLS versions for all API requests
- **Certificate Validation**: Validate SSL certificates for all external API calls

```typescript
// Example of enforcing TLS
const fetch = require('node-fetch');
const https = require('https');

const agent = new https.Agent({
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true // Ensures valid certificates
});

async function secureApiCall(url: string, options: any) {
  return fetch(url, {
    ...options,
    agent,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json'
    }
  });
}
```

### 5. Key Management Lifecycle

- **Provisioning**: Secure process for obtaining and distributing initial tokens
- **Rotation**: Automated process for regular key rotation
- **Revocation**: Immediate process for revoking compromised tokens
- **Auditing**: Logging of all key management activities for security review

```typescript
// Key rotation service
export class TokenRotationService {
  private static readonly ROTATION_PERIOD_DAYS = 90;
  
  async rotateTokenIfNeeded(userId: string): Promise<void> {
    const tokenData = await prisma.userTokens.findUnique({
      where: { userId },
      select: { lastRotated: true }
    });
    
    if (!tokenData) return;
    
    const daysSinceRotation = Math.floor(
      (Date.now() - tokenData.lastRotated.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceRotation >= TokenRotationService.ROTATION_PERIOD_DAYS) {
      await this.rotateToken(userId);
    }
  }
  
  private async rotateToken(userId: string): Promise<void> {
    // Implementation for refreshing OAuth token or rotating API key
    // Log rotation for audit trail
    logger.info(`Rotated token for user ${userId}`, { 
      action: 'token_rotation',
      userId,
      timestamp: new Date().toISOString()
    });
  }
}
```

## Webhook Security

### 1. Signature Verification

All incoming webhooks must be verified using Calendly's signature verification:

```typescript
// Example of webhook signature verification with replay protection
export async function verifyWebhookWithReplayProtection(
  signature: string,
  body: string,
  timestamp: string,
  secret: string
): Promise<boolean> {
  // Check if timestamp is recent (within 5 minutes)
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  
  if (currentTime - requestTime > 300) { // 5 minutes
    logger.warn('Webhook replay attempt detected', { timestamp });
    return false;
  }
  
  // Check if this webhook has been processed before
  const webhookId = createWebhookId(signature, timestamp);
  const isProcessed = await hasProcessedWebhook(webhookId);
  
  if (isProcessed) {
    logger.warn('Duplicate webhook detected', { webhookId });
    return false;
  }
  
  // Verify signature
  const isValid = verifySignature(signature, body, timestamp, secret);
  
  if (isValid) {
    // Record this webhook as processed
    await markWebhookAsProcessed(webhookId);
  }
  
  return isValid;
}
```

### 2. Replay Protection

Implement protection against webhook replay attacks by:
- Checking webhook timestamps
- Maintaining a record of processed webhooks
- Rejecting duplicate webhooks

### 3. Rate Limiting

Apply rate limits to webhook endpoints to prevent abuse:

```typescript
// Example rate limiting middleware
export function rateLimitMiddleware(
  req: NextRequest,
  res: NextResponse,
  next: () => void
) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `ratelimit:${ip}:webhook`;
  
  // Check rate limit (100 requests per hour per IP)
  const limit = 100;
  const window = 60 * 60; // 1 hour in seconds
  
  rateLimit(key, limit, window).then(({ success, remaining, reset }) => {
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);
    
    if (!success) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded'
      });
    }
    
    next();
  });
}
```

## OAuth Security

### 1. State Parameter

Use a state parameter in OAuth flows to prevent CSRF attacks:

```typescript
export function generateOAuthState(): string {
  return crypto.randomUUID();
}

export function storeOAuthState(state: string, userId: string): void {
  // Store in secure session storage with short TTL
  sessionStorage.set(`oauth_state_${state}`, userId, { ttl: 10 * 60 }); // 10 minutes
}

export async function verifyOAuthState(state: string): Promise<string | null> {
  // Retrieve and immediately delete
  const userId = await sessionStorage.get(`oauth_state_${state}`);
  await sessionStorage.del(`oauth_state_${state}`);
  return userId;
}
```

### 2. PKCE Flow

Implement PKCE (Proof Key for Code Exchange) for additional security in OAuth flows:

```typescript
export function generatePKCE(): { codeVerifier: string, codeChallenge: string } {
  // Generate a code verifier (random string)
  const codeVerifier = crypto.randomBytes(64).toString('base64url');
  
  // Create code challenge using S256 method
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}
```

### 3. Secure Token Storage

Store OAuth tokens securely:
- Encrypt tokens before storing in database
- Use parameterized queries to prevent SQL injection
- Apply appropriate database access controls

## Monitoring and Alerting

### 1. Security Logging

Implement detailed logging for all security-related events:

```typescript
// Example of security logging middleware
export function securityLoggingMiddleware(
  req: NextRequest,
  res: NextResponse,
  next: () => void
) {
  const startTime = Date.now();
  
  // Add response hooks
  const originalEnd = res.end;
  res.end = function(chunk?: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log API requests
    if (req.url.includes('/api/')) {
      logger.info('API Request', {
        method: req.method,
        path: req.url,
        status: res.statusCode,
        duration,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      // Alert on authentication failures
      if (res.statusCode === 401 || res.statusCode === 403) {
        logger.warn('Authentication failure', {
          method: req.method,
          path: req.url,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });
      }
    }
    
    return originalEnd.apply(res, arguments);
  };
  
  next();
}
```

### 2. Anomaly Detection

Monitor for suspicious activities:
- Unusual API usage patterns
- Multiple authentication failures
- Access attempts from unusual locations

### 3. Alerting

Set up alerts for security incidents:
- Authentication failures
- Signature verification failures
- Token compromise indicators

## Secret Prevention

### 1. Git Protection

Implement measures to prevent secret leakage:

```
# Example .gitignore entries
.env*
*.pem
*_key
*_token
```

### 2. Pre-commit Hooks

Use pre-commit hooks to scan for secrets:

```bash
#!/bin/bash
# pre-commit hook to check for secrets

files=$(git diff --cached --name-only)

# Look for potential API keys/tokens
if grep -r --include="*.{js,ts,tsx,json,env}" -E '(api[_-]?key|calendar?ly|token).*["\w]{32,}' $files; then
  echo "WARNING: Possible API key/token found in commit"
  exit 1
fi

# Look for .env files
if git diff --cached --name-only | grep -q '\.env'; then
  echo "WARNING: Attempting to commit .env file"
  exit 1
fi
```

### 3. Secret Scanning

Implement automated scanning for:
- Accidental token commits
- Exposed secrets in code
- Configuration file leaks

## Incident Response

### 1. Detection

Implement systems to detect potential token compromise:
- Unusual access patterns
- Unexpected token usage
- Failed verification attempts

### 2. Containment

Procedures to immediately respond to compromised tokens:
- Token revocation
- Service isolation
- Access restriction

### 3. Recovery

Process to recover from security incidents:
- Issue new tokens
- Update affected systems
- Verify integrity of data

### 4. Documentation

Maintain clear documentation for:
- Incident response procedures
- Communication protocols
- Post-incident analysis

## Deployment Security

### 1. Environment Isolation

Maintain separate environments with different tokens:
- Development
- Staging
- Production

### 2. Access Control

Restrict access to production tokens:
- Limited personnel access
- Multi-factor authentication
- Clear access logs

### 3. Rotation Schedule

Implement regular key rotation:
- Personal API tokens: Every 90 days
- OAuth client secrets: Yearly
- Webhook secrets: Every 180 days

## Related Documentation

- [Calendly Integration](./CALENDLY_INTEGRATION.md)
- [Calendly Authentication](./CALENDLY_AUTHENTICATION.md)
- [Calendly Webhook Implementation](./CALENDLY_WEBHOOK_IMPLEMENTATION.md)