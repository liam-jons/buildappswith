# Vercel Deployment Guide for Buildappswith

## Current Issue

We're facing an issue with UI component imports when deploying to Vercel. The specific errors are:

1. **Font Path Issue**: The path to OpenDyslexic font needs to use an absolute path from the public directory
2. **UI Component Imports**: Imports using `@/components/ui/button` and similar are failing during build

## Solution

We need to properly install the shadcn/Magic UI components using the CLI:

```bash
# Install the Button component
npx shadcn@latest add button

# Install the Dropdown Menu component
npx shadcn@latest add dropdown-menu

# If you're using Magic UI specifically, you can use:
npx shadcn@latest add "https://magicui.design/f/button.json"
npx shadcn@latest add "https://magicui.design/f/dropdown-menu.json"
```

This approach is more reliable than manually creating the component files because it:
1. Ensures all dependencies are properly installed
2. Configures the components correctly with your project's path aliases
3. Matches the expected structure that your imports are using

## Additional Configuration

1. **Font Path**: Use absolute paths for files in the public directory:
   ```typescript
   // In lib/fonts.ts
   export const fontDyslexic = localFont({
     src: "/fonts/OpenDyslexic/OpenDyslexic-Regular.otf", // No "../public" prefix
     variable: "--font-dyslexic",
     display: "swap",
   })
   ```

2. **Path Aliases**: Verify tsconfig.json has the correct configuration:
   ```json
   "paths": {
     "@/*": ["./*"]
   }
   ```

3. **Vercel Deployment Settings**:
   - Ensure the working directory is set correctly
   - Configure the Build Command (typically `next build`)
   - Set up environment variables properly

## After Deployment

After making these changes, clear the Vercel build cache and redeploy:
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > General
3. Scroll down to "Build & Development Settings"
4. Click "Clear build cache and deploy"

This should properly resolve the component import issues.
