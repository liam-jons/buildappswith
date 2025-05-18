# Vercel Environment Variables Setup

This document outlines the environment variables that need to be configured in the Vercel dashboard for successful deployment of the Buildappswith platform.

## Required Environment Variables

Configure the following environment variables in the Vercel dashboard for each environment (Production, Preview, Development):

### Core Variables

| Variable                | Description                                             | Example Value                             |
|-------------------------|---------------------------------------------------------|-------------------------------------------|
| NEXT_PUBLIC_API_URL     | API endpoint URL                                        | https://buildappswith.com/api             |
| AUTH_SECRET             | Secret key for authentication                           | (Generate a secure random string)         |
| NEXTAUTH_URL            | URL for NextAuth                                        | https://buildappswith.com                 |
| NEXT_PUBLIC_APP_ENV     | Environment name                                        | production                                |

### Feature Flags

| Variable                         | Description                            | Example Value |
|----------------------------------|----------------------------------------|---------------|
| NEXT_PUBLIC_ENABLE_BUILDER_PROFILES | Enable builder profiles feature     | true          |
| NEXT_PUBLIC_ENABLE_SKILL_TREE    | Enable skill tree feature              | true/false    |
| NEXT_PUBLIC_ENABLE_TIMELINE      | Enable AI timeline feature             | true/false    |

## Environment-Specific Settings

Configure different values for each environment:

### Production Environment

- NEXT_PUBLIC_APP_ENV: production
- NEXT_PUBLIC_API_URL: https://buildappswith.com/api
- NEXTAUTH_URL: https://buildappswith.com

### Preview Environment

- NEXT_PUBLIC_APP_ENV: preview
- NEXT_PUBLIC_API_URL: https://develop.buildappswith.vercel.app/api
- NEXTAUTH_URL: https://develop.buildappswith.vercel.app

### Development Environment

- NEXT_PUBLIC_APP_ENV: development
- NEXT_PUBLIC_API_URL: http://localhost:3000/api
- NEXTAUTH_URL: http://localhost:3000

## Setting Up in Vercel Dashboard

1. Go to the [Vercel Dashboard](https://vercel.com)
2. Select the Buildappswith project
3. Navigate to "Settings" → "Environment Variables"
4. Add each required variable, selecting the appropriate environments (Production, Preview, Development)
5. Save the changes
6. Redeploy the application to apply the new environment variables

## Troubleshooting Environment Variables

If you encounter issues related to environment variables:

1. Ensure all required variables are set for each environment
2. Check for typos in variable names
3. Verify that the values are appropriate for each environment
4. Remember that changes to environment variables require a redeployment

## Security Best Practices

- Never commit sensitive environment variables to the repository
- Use different values for AUTH_SECRET in each environment
- Regularly rotate authentication secrets
- Use environment-specific URLs for all configuration
