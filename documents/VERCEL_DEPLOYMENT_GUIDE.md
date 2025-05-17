# Complete Vercel Deployment Guide for Buildappswith

This comprehensive guide explains how to set up and configure the Buildappswith platform for deployment on Vercel, including resolving common issues and ensuring proper configuration.

## Pre-Deployment Checklist

Before deploying to Vercel, ensure the following is in place:

1. **JavaScript Next.js Configuration**: Use `next.config.js` (not TypeScript version)
2. **Proper Package.json Configuration**: Ensure all dependencies are specified correctly
3. **Correct Font Path References**: Use absolute paths from the public directory
4. **Tailwind CSS v4 Compatibility**: Ensure CSS is updated for Tailwind v4
5. **Environment Variables**: Set up correctly in the Vercel dashboard

## Step 1: Connect GitHub Repository to Vercel

1. Log in to the [Vercel Dashboard](https://vercel.com)
2. Click "Add New" > "Project"
3. Select the GitHub repository containing the Buildappswith project
4. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Leave as default (the repository root)
   - **Build Command**: `npm run vercel-build` (defined in package.json)
   - **Output Directory**: `.next` (default)

## Step 2: Configure Environment Variables

Add the environment variables as specified in [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md):

1. Navigate to "Settings" > "Environment Variables"
2. Add each required variable for the appropriate environments
3. Click "Save" when done

## Step 3: Configure Deployment Options

Ensure the following deployment options are set correctly:

1. Navigate to "Settings" > "Git"
2. Configure the "Production Branch" as `main`
3. Enable "Preview Deployments" for the `develop` branch
4. Set "Auto-Alias" to true for preview deployments

## Step 4: Set Up GitHub Integration

1. Navigate to "Settings" > "Git" > "GitHub Integration"
2. Enable "Auto Deployment Triggers"
3. Configure the appropriate branch protections

## Step 5: Fix Common Deployment Issues

### Font Loading Issues

1. Ensure all font paths use absolute paths from the public directory:

```typescript
// In lib/fonts.ts - CORRECT
export const fontDyslexic = localFont({
  src: "/fonts/OpenDyslexic/OpenDyslexic-Regular.otf", // Starts with /
  variable: "--font-dyslexic",
  display: "swap",
});

// INCORRECT
export const fontDyslexic = localFont({
  src: "../public/fonts/OpenDyslexic/OpenDyslexic-Regular.otf", // Don't use ../public
  variable: "--font-dyslexic",
  display: "swap",
});
```

### UI Component Import Issues

If component imports are failing, ensure they're properly installed using the shadcn CLI:

```bash
# Install basic UI components
npx shadcn@latest add button
npx shadcn@latest add dropdown-menu
npx shadcn@latest add card
npx shadcn@latest add form

# For Magic UI components
npx shadcn@latest add "https://magicui.design/f/text-shimmer.json"
npx shadcn@latest add "https://magicui.design/f/border-beam.json"
```

### Tailwind CSS v4 Compatibility

Ensure all CSS uses the proper Tailwind v4 syntax:

1. Use `@reference "tailwindcss";` at the top of your globals.css
2. Use `@utility` directive for custom utilities
3. Replace theme color utilities with direct HSL values using `bg-[hsl(var(--background))]` syntax

### Path Alias Configuration

Verify that path aliases are properly configured:

1. Check `tsconfig.json` for the correct paths configuration:
```json
"paths": {
  "@/*": ["./*"]
}
```

2. Ensure the `jsconfig.json` file (if present) has matching configuration

## Step 6: Deploy and Verify

1. Trigger a deployment either manually or by pushing to the configured branch
2. Once deployed, verify the following:
   - All styles and components render correctly
   - Font loading works properly
   - Responsive design functions as expected
   - Environment variables are being used correctly

## Troubleshooting Deployment Failures

If your deployment fails, check the following common issues:

1. **Build Errors**: Review the build logs in the Vercel dashboard for specific errors
2. **Dependency Issues**: Make sure all dependencies in package.json are correct and compatible
3. **Configuration Conflicts**: Ensure there's only one `next.config.js` file (not also `next.config.ts`)
4. **Memory Limits**: For large projects, you might need to increase the memory limit in the Vercel settings

### Clearing Build Cache

If issues persist after configuration changes, try clearing the build cache:

1. Navigate to "Settings" > "General"
2. Scroll down to "Build & Development Settings" 
3. Click "Clear build cache and deploy"

## Additional Resources

- [Official Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Next.js Deployment Guide](https://vercel.com/docs/frameworks/nextjs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/blog/tailwindcss-v4)
- [Magic UI Integration Guide](https://magicui.design/docs/installation/manual)

## Maintaining Deployment Configuration

Whenever making significant changes to the project structure or dependencies:

1. Update the vercel.json file if needed
2. Document any new environment variables in VERCEL_ENV_SETUP.md
3. Test deployment in a preview environment before merging to main
4. Update this guide with any new information or troubleshooting steps
