# Calendly Authentication Strategy

*Version: 1.0.0*

This document outlines the authentication strategy for the Calendly integration with BuildAppsWith, detailing both the initial personal token implementation and the future OAuth 2.0 approach.

## Overview

The authentication strategy follows a phased approach:
1. **Phase 1**: Personal API token for initial implementation (Liam's account only)
2. **Phase 2**: OAuth 2.0 for multi-user support (all builders)

## Phase 1: Personal API Token Implementation

### Token Management

```typescript
// lib/scheduling/calendly/token-manager.ts
export function getCalendlyToken(): string {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    throw new Error('Calendly API token not configured');
  }
  return token;
}

export function getCalendlyUserUri(): string {
  const uri = process.env.CALENDLY_USER_URI;
  if (!uri) {
    throw new Error('Calendly user URI not configured');
  }
  return uri;
}
```

### API Client Implementation

```typescript
// lib/scheduling/calendly/api-client.ts
export class CalendlyApiClient {
  private readonly baseUrl = 'https://api.calendly.com';
  private readonly token: string;
  
  constructor(token: string) {
    this.token = token;
  }
  
  getAuthHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
  
  async getUserInfo(): Promise<CalendlyUser> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Other API methods...
}
```

### Client Factory

```typescript
// lib/scheduling/calendly/api-client-factory.ts
import { CalendlyApiClient } from './api-client';
import { getCalendlyToken } from './token-manager';

let clientInstance: CalendlyApiClient | null = null;

export function getCalendlyApiClient(): CalendlyApiClient {
  if (!clientInstance) {
    clientInstance = new CalendlyApiClient(getCalendlyToken());
  }
  return clientInstance;
}
```

### Environment Configuration

Required environment variables for the personal token approach:

```
CALENDLY_API_TOKEN=your_personal_token_here
CALENDLY_USER_URI=https://api.calendly.com/users/USERID
CALENDLY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Phase 2: OAuth 2.0 Implementation

### Database Schema

```prisma
// prisma/schema.prisma addition
model BuilderCalendlyIntegration {
  id             String   @id @default(cuid())
  builderId      String   @unique
  builder        User     @relation(fields: [builderId], references: [id])
  accessToken    String
  refreshToken   String
  tokenExpiry    DateTime
  calendlyUserId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### OAuth Client

```typescript
// lib/scheduling/calendly/oauth-client.ts
export class CalendlyOAuthClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  
  constructor() {
    this.clientId = process.env.CALENDLY_CLIENT_ID!;
    this.clientSecret = process.env.CALENDLY_CLIENT_SECRET!;
    this.redirectUri = process.env.CALENDLY_REDIRECT_URI!;
  }
  
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state
    });
    
    return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
  }
  
  async exchangeCodeForToken(code: string): Promise<CalendlyTokenResponse> {
    const response = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      }).toString()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.status}`);
    }
    
    return response.json();
  }
  
  async refreshToken(refreshToken: string): Promise<CalendlyTokenResponse> {
    const response = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }).toString()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`);
    }
    
    return response.json();
  }
}

interface CalendlyTokenResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  created_at: number;
  scope: string;
  owner: string;
  organization: string;
}
```

### Token Management Service

```typescript
// lib/scheduling/calendly/token-service.ts
export class CalendlyTokenService {
  private readonly oauthClient = new CalendlyOAuthClient();
  
  async getValidToken(builderId: string): Promise<string> {
    const integration = await prisma.builderCalendlyIntegration.findUnique({
      where: { builderId }
    });
    
    if (!integration) {
      throw new Error(`No Calendly integration found for builder ${builderId}`);
    }
    
    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = integration.tokenExpiry < new Date(Date.now() + 5 * 60 * 1000);
    
    if (isExpired) {
      const refreshedTokens = await this.oauthClient.refreshToken(
        integration.refreshToken
      );
      
      // Update stored tokens
      await prisma.builderCalendlyIntegration.update({
        where: { id: integration.id },
        data: {
          accessToken: refreshedTokens.access_token,
          refreshToken: refreshedTokens.refresh_token,
          tokenExpiry: new Date(Date.now() + refreshedTokens.expires_in * 1000)
        }
      });
      
      return refreshedTokens.access_token;
    }
    
    return integration.accessToken;
  }
  
  async storeTokens(
    builderId: string, 
    tokens: CalendlyTokenResponse
  ): Promise<void> {
    await prisma.builderCalendlyIntegration.upsert({
      where: { builderId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        calendlyUserId: tokens.owner,
        updatedAt: new Date()
      },
      create: {
        builderId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        calendlyUserId: tokens.owner
      }
    });
  }
}
```

### Enhanced API Client Factory

```typescript
// Enhanced factory to support both personal token and OAuth
export async function getCalendlyApiClient(builderId?: string): Promise<CalendlyApiClient> {
  if (builderId) {
    // OAuth flow - get token for specific builder
    const tokenService = new CalendlyTokenService();
    const token = await tokenService.getValidToken(builderId);
    return new CalendlyApiClient(token);
  } else {
    // Default to personal token for backward compatibility
    return new CalendlyApiClient(getCalendlyToken());
  }
}
```

### OAuth Connect and Callback Routes

Connect Route:

```typescript
// app/api/connect/calendly/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user || user.role !== 'BUILDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Generate a state parameter to prevent CSRF
  const state = crypto.randomUUID();
  
  // Store state in session for verification
  const session = await getSession();
  session.calendlyOAuthState = state;
  await session.save();
  
  // Get authorization URL
  const oauthClient = new CalendlyOAuthClient();
  const authUrl = oauthClient.getAuthorizationUrl(state);
  
  // Redirect to Calendly authorization page
  return NextResponse.redirect(authUrl);
}
```

Callback Route:

```typescript
// app/api/auth/calendly/callback/route.ts
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user || user.role !== 'BUILDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
  }
  
  // Verify state parameter
  const session = await getSession();
  if (state !== session.calendlyOAuthState) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }
  
  // Clean up the session
  delete session.calendlyOAuthState;
  await session.save();
  
  try {
    // Exchange code for token
    const oauthClient = new CalendlyOAuthClient();
    const tokens = await oauthClient.exchangeCodeForToken(code);
    
    // Store tokens in database
    const tokenService = new CalendlyTokenService();
    await tokenService.storeTokens(user.id, tokens);
    
    // Redirect to success page
    return NextResponse.redirect(new URL('/dashboard/integrations/calendly/success', request.url));
  } catch (error) {
    console.error('Calendly OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard/integrations/calendly/error', request.url));
  }
}
```

## Migration Strategy

The transition from personal API token to OAuth 2.0 will follow these phases:

### Phase 1: Initial Implementation
- Use personal API token for Liam's account only
- Implement basic webhook handling and Stripe integration

### Phase 2: Preparation
- Develop OAuth infrastructure without changing existing functionality
- Create database models for token storage
- Implement OAuth endpoints and token refresh mechanisms

### Phase 3: Testing
- Set up a test builder account using OAuth flow
- Run parallel systems to ensure compatibility

### Phase 4: Migration
- Provide UI for existing builders to connect their Calendly accounts
- Update API client factory to prioritize OAuth tokens when available
- Fall back to personal token only when needed

### Phase 5: Completion
- Make OAuth mandatory for new builder accounts
- Schedule deprecation of personal token approach

## Environment Configuration for OAuth

Required environment variables for the OAuth implementation:

```
# Personal token (for backward compatibility)
CALENDLY_API_TOKEN=your_personal_token_here
CALENDLY_USER_URI=https://api.calendly.com/users/USERID

# OAuth configuration
CALENDLY_CLIENT_ID=your_client_id_here
CALENDLY_CLIENT_SECRET=your_client_secret_here
CALENDLY_REDIRECT_URI=https://buildappswith.com/api/auth/calendly/callback

# Webhook configuration
CALENDLY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Security Considerations

1. **Token Storage**: All tokens are stored encrypted in the database
2. **HTTPS Only**: All communication uses HTTPS
3. **State Parameter**: OAuth flow uses a state parameter to prevent CSRF attacks
4. **Token Rotation**: Access tokens are automatically refreshed before expiry
5. **Scoped Access**: Only request the minimum necessary permissions

## Related Documentation

- [Calendly Integration](./CALENDLY_INTEGRATION.md)
- [Calendly Webhook Implementation](./CALENDLY_WEBHOOK_IMPLEMENTATION.md)