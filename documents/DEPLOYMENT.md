### Infrastructure Diagram

```
GitHub Repository
│
├── main branch ────────► Vercel Production Deployment ────► buildappswith.com
│
└── develop branch ─────► Vercel Preview Deployment ──────► develop.buildappswith.vercel.app
```# Deployment Guide

## Vercel Deployment

The Buildappswith platform is deployed on Vercel with the following configuration:

### Deployment Environments

- **Production**: Deployed from the `main` branch
  - URL: https://buildappswith.com (or your production URL)
  - Environment: Production
  
- **Preview**: Deployed from the `develop` branch
  - URL: https://develop.buildappswith.vercel.app (or your preview URL)
  - Environment: Preview

### Environment Variables

Environment variables are managed in the Vercel dashboard and should be configured for each environment (Production, Preview, and Development).

Required variables:
- `NEXT_PUBLIC_API_URL`: API endpoint URL
- `AUTH_SECRET`: Secret for authentication
- `NEXTAUTH_URL`: URL for NextAuth
- `NEXT_PUBLIC_APP_ENV`: Environment name (production/preview/development)
- Feature flags (various `NEXT_PUBLIC_ENABLE_*` variables)

### Deployment Configuration

Deployment settings are managed through:
- `vercel.json` at the project root
- Project settings in the Vercel dashboard
- `.env.production` and other environment files

### Common Deployment Issues

#### 1. Font Path Issue

If you encounter errors related to font files, ensure that the paths in `lib/fonts.ts` are correct. For files in the public directory, use absolute paths from the public root:

```typescript
export const fontDyslexic = localFont({
  src: "/fonts/OpenDyslexic/OpenDyslexic-Regular.otf", // Note: No "../public" prefix
  variable: "--font-dyslexic",
  display: "swap",
})
```

Important: In Next.js, files in the `public` directory should be referenced with absolute paths starting from the root, without including "public" in the path.

#### 2. Missing UI Components

If build errors mention missing UI components, ensure that all the required Shadcn UI components are properly installed in the `components/ui` directory. The most commonly used components are:

- `button.tsx`
- `dropdown-menu.tsx`
- Other UI components as needed by the application

#### 3. Path Alias Configuration

If you encounter errors like `Module not found: Can't resolve '@/components/ui/button'`, ensure your path aliases are correctly configured:

1. Check `tsconfig.json` for the correct paths configuration:
   ```json
   "paths": {
     "@/*": ["./*"]
   }
   ```

2. Make sure you have the following import in the component using the alias:
   ```typescript
   import { Button } from "@/components/ui/button"
   ```

3. Verify that the component actually exists at the specified path
   - The path should be relative to the project root
   - For example, `@/components/ui/button` should resolve to `/components/ui/button.tsx`

4. If the issue persists in production but works locally, try clearing the Vercel build cache

### Deployment Process

1. Code pushed to `develop` branch is automatically deployed to the Preview environment
2. After testing in Preview, merge to `main` for Production deployment
3. Production deployments trigger automatically when changes are merged to `main`

### Manual Deployments

To trigger a manual deployment:
1. Go to the [Vercel Dashboard](https://vercel.com)
2. Select the Buildappswith project
3. Click "Deployments" tab
4. Use "Redeploy" or "Deploy" actions as needed

### Environment Configuration

Each environment (Development, Preview, Production) can have specific settings:

- **Development**: Local development environment
  - Uses `.env.local` for local variables
  - URL typically `http://localhost:3000`

- **Preview**: Testing environment from `develop` branch
  - Uses environment variables set in Vercel for the Preview environment
  - URL typically `https://develop.buildappswith.vercel.app`

- **Production**: Live environment from `main` branch
  - Uses environment variables set in Vercel for the Production environment
  - URL typically `https://buildappswith.com`

### Deployment Checks

Before deploying to Production, ensure:

1. All UI components are properly installed and referenced
2. Font paths are correct in the codebase
3. Environment variables are properly set in the Vercel dashboard
4. The application builds successfully in the Preview environment
5. Core functionality works as expected in the Preview environment

### Troubleshooting Failed Deployments

If your deployment fails, follow these steps:

1. Check the Vercel build logs for specific error messages
2. Common issues include:
   - Missing dependencies in package.json
   - Path resolution errors (especially with public files or path aliases)
   - Environment variable issues
   - Next.js configuration format (use .js instead of .ts)
   - Compatibility issues with latest versions of Next.js/React
3. Test the fix locally before redeploying
4. If the issue persists, try the following:
   - Clear the Vercel build cache
   - Ensure all dependencies are up to date
   - Check for compatibility issues between packages
   - Use the `vercel-build` script defined in package.json

#### Specific Issues and Solutions

##### Next.js Config Format

Vercel may have difficulty with TypeScript-based Next.js config files. Use `next.config.js` rather than `next.config.ts` for maximum compatibility.

##### Latest Next.js/React Versions

If you're using very recent versions (e.g., Next.js 15 or React 19), there might be compatibility issues with Vercel's build system. Consider pinning to stable versions if deployment problems persist.

##### Tailwind CSS v4 Compatibility

Tailwind CSS v4 is relatively new and might cause build issues. Ensure you have the correct configuration for Tailwind v4 and consider downgrading if necessary.

##### Environment Variables

Refer to the `docs/VERCEL_ENV_SETUP.md` file for a comprehensive guide on configuring environment variables in the Vercel dashboard.

### Tailwind CSS v4 Deployment Considerations

When deploying a Next.js application with Tailwind CSS v4, be aware of these specific requirements:

1. Use JavaScript format for Next.js configuration:
   - Use `next.config.js` instead of `next.config.ts`
   - Remove outdated options like `swcMinify`

2. Ensure correct PostCSS configuration:
   ```javascript
   // postcss.config.mjs
   const config = {
     plugins: [
       "@tailwindcss/postcss",
       "autoprefixer"
     ],
   };
   
   export default config;
   ```

3. Include required dependencies:
   - `@tailwindcss/postcss` - The PostCSS plugin for Tailwind v4
   - `autoprefixer` - Required for browser compatibility

4. Follow Tailwind CSS v4 syntax in your CSS files:
   - Add `@reference "tailwindcss"` at the top
   - Use `@utility` for custom utilities
   - Use direct HSL values instead of theme color references
   - See `docs/TAILWIND_V4_GUIDE.md` for detailed guidance

### Infrastructure Diagram

```
GitHub Repository
│
├── main branch ────────► Vercel Production Deployment ────► buildappswith.com
│
└── develop branch ─────► Vercel Preview Deployment ──────► develop.buildappswith.vercel.app
```
