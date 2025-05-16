# Clerk Social SSO Setup Guide

## Apple Sign-In Setup

### What You'll Need from Apple:
1. **Apple Developer Account** ($99/year)
2. **Services ID** (for web authentication)
3. **Key ID** and **Private Key** (.p8 file)
4. **Team ID**

### Steps in Apple Developer Portal:

#### 1. Create App ID
- Go to Certificates, Identifiers & Profiles
- Click Identifiers → App IDs → Register a new identifier
- Select "App IDs" and click Continue
- Select "App" and click Continue
- Fill in:
  - Description: "BuildAppsWith Platform"
  - Bundle ID: "com.buildappswith.platform" (reverse domain notation)
  - Enable "Sign in with Apple" capability
- Register

#### 2. Create Services ID (for Web)
- Go to Identifiers → Services IDs → Register a new identifier
- Fill in:
  - Description: "BuildAppsWith Web"
  - Identifier: "com.buildappswith.web"
- Click Continue, then Register
- Click on the created Services ID
- Enable "Sign in with Apple"
- Configure:
  - Primary App ID: Select the App ID created above
  - Domains and Subdomains: 
    - `buildappswith.com`
    - `www.buildappswith.com`
    - `clerk.buildappswith.com` (if using Clerk's domain)
  - Return URLs:
    - `https://YOUR-CLERK-FRONTEND-API.clerk.accounts.dev/v1/oauth_callback/oauth_apple`
    - `https://www.buildappswith.com/sso-callback/apple` (if using custom domain)

#### 3. Create Private Key
- Go to Keys → Create a new key
- Key Name: "BuildAppsWith Sign In Key"
- Enable "Sign in with Apple"
- Configure:
  - Choose Primary App ID
- Continue → Register
- Download the private key (.p8 file) - SAVE THIS SECURELY!
- Note the Key ID shown

#### 4. Get Your Team ID
- Found in Membership section of your Apple Developer account
- Format: "XXXXXXXXXX" (10 characters)

### Information to Enter in Clerk:

1. **Client ID**: Your Services ID (e.g., "com.buildappswith.web")
2. **Team ID**: Your 10-character Team ID
3. **Key ID**: The Key ID from step 3
4. **Private Key**: Contents of the .p8 file
5. **Scopes**: name, email (default)

---

## Google OAuth Setup

### What You'll Need:
1. **Google Cloud Console Account**
2. **OAuth 2.0 Client ID**
3. **Client Secret**

### Steps in Google Cloud Console:

#### 1. Create/Select Project
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create new project: "BuildAppsWith Production"
- Select the project

#### 2. Enable APIs
- Go to APIs & Services → Enable APIs
- Search and enable: "Google+ API" or "Google Identity Toolkit API"

#### 3. Configure OAuth Consent Screen
- Go to APIs & Services → OAuth consent screen
- Choose "External" user type
- Fill in:
  - App name: "BuildAppsWith"
  - User support email: support@buildappswith.com
  - App logo: Upload your logo
  - Application home page: https://www.buildappswith.com
  - Application privacy policy: https://www.buildappswith.com/privacy
  - Application terms of service: https://www.buildappswith.com/terms
  - Authorized domains:
    - buildappswith.com
    - clerk.accounts.dev (for Clerk)
  - Developer contact: liam@buildappswith.com

#### 4. Create OAuth 2.0 Client ID
- Go to APIs & Services → Credentials
- Click "Create Credentials" → "OAuth client ID"
- Application type: Web application
- Name: "BuildAppsWith Web Client"
- Authorized redirect URIs:
  - `https://YOUR-CLERK-FRONTEND-API.clerk.accounts.dev/v1/oauth_callback/oauth_google`
  - `https://www.buildappswith.com/sso-callback/google`

### Information to Enter in Clerk:

1. **Client ID**: Your OAuth 2.0 Client ID
2. **Client Secret**: Your OAuth 2.0 Client Secret
3. **Scopes**: email, profile, openid (default)

---

## Microsoft/Azure AD Setup

### What You'll Need:
1. **Azure Account**
2. **App Registration**
3. **Client ID and Secret**

### Steps in Azure Portal:

#### 1. Register Application
- Go to [portal.azure.com](https://portal.azure.com)
- Navigate to Azure Active Directory → App registrations
- Click "New registration"
- Fill in:
  - Name: "BuildAppsWith Platform"
  - Supported account types: 
    - "Accounts in any organizational directory and personal Microsoft accounts"
  - Redirect URI: 
    - Platform: Web
    - URI: `https://YOUR-CLERK-FRONTEND-API.clerk.accounts.dev/v1/oauth_callback/oauth_microsoft`

#### 2. Configure Application
- Note the **Application (client) ID**
- Note the **Directory (tenant) ID**
- Go to "Authentication" in left menu:
  - Add additional redirect URIs if needed:
    - `https://www.buildappswith.com/sso-callback/microsoft`
  - Enable "ID tokens" under Implicit grant and hybrid flows
  - Enable "Access tokens" if needed

#### 3. Create Client Secret
- Go to "Certificates & secrets"
- Click "New client secret"
- Description: "BuildAppsWith Clerk Integration"
- Expires: Choose appropriate expiration
- Copy the secret value immediately (won't be shown again!)

#### 4. Configure API Permissions
- Go to "API permissions"
- Should have these by default:
  - Microsoft Graph → User.Read
- Add if needed:
  - Microsoft Graph → email
  - Microsoft Graph → profile
  - Microsoft Graph → openid

### Information to Enter in Clerk:

1. **Client ID**: Application (client) ID from Azure
2. **Client Secret**: The secret value you created
3. **Tenant ID**: Directory (tenant) ID (or "common" for multi-tenant)

---

## Common Configuration Notes

### For All Providers:

1. **Redirect URLs Pattern**:
   - Clerk Default: `https://YOUR-CLERK-FRONTEND-API.clerk.accounts.dev/v1/oauth_callback/oauth_[provider]`
   - Custom Domain: `https://www.buildappswith.com/sso-callback/[provider]`

2. **Required Scopes**:
   - Always include: email, profile/name
   - Optional: openid (for OIDC compliance)

3. **Testing Considerations**:
   - Set up separate apps for development/staging
   - Development URLs: `http://localhost:3000/sso-callback/[provider]`
   - Add all Clerk development/preview URLs

4. **Security Best Practices**:
   - Store secrets in environment variables
   - Never commit secrets to git
   - Rotate secrets regularly
   - Use different secrets for different environments

### Environment Variables to Add:

```env
# Apple Sign In
NEXT_PUBLIC_CLERK_APPLE_CLIENT_ID=com.buildappswith.web
CLERK_APPLE_TEAM_ID=XXXXXXXXXX
CLERK_APPLE_KEY_ID=XXXXXXXXXX
CLERK_APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google OAuth
NEXT_PUBLIC_CLERK_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
CLERK_GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# Microsoft OAuth
NEXT_PUBLIC_CLERK_MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CLERK_MICROSOFT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxx
CLERK_MICROSOFT_TENANT_ID=common
```

### Troubleshooting Tips:

1. **Apple Issues**:
   - Verify bundle ID matches
   - Check domain verification
   - Ensure private key format is correct
   - Verify Team ID is correct

2. **Google Issues**:
   - Check OAuth consent screen is published
   - Verify authorized domains
   - Ensure APIs are enabled

3. **Microsoft Issues**:
   - Check tenant configuration
   - Verify redirect URIs exactly match
   - Ensure proper API permissions

### Testing Checklist:

- [ ] Test sign up with each provider
- [ ] Test sign in with existing account
- [ ] Verify email is captured correctly
- [ ] Check profile information is synced
- [ ] Test on mobile devices
- [ ] Verify error handling
- [ ] Test account linking scenarios

---

*Last Updated: January 16, 2025*