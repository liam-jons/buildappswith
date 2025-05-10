# Next.js Chunk Loading Errors

## Issue Description

After updating the codebase, you're experiencing issues with Next.js not being able to find its JavaScript chunks. This is shown by these errors:

```
GET /_next/static/chunks/app/layout.js 404 in 44ms
GET /_next/static/chunks/app-pages-internals.js 404 in 44ms
GET /_next/static/chunks/main-app.js?v=1746803983217 404 in 45ms
GET /_next/static/css/app/layout.css?v=1746803983217 404 in 46ms
```

## Causes

These errors typically happen due to:

1. **Stale Cache**: The Next.js development server has cached old builds
2. **Multiple Processes**: Multiple development server instances running simultaneously
3. **Build Issues**: Incomplete or failed builds
4. **Port Conflicts**: The server trying to use a port that's already in use

## Solution

I've created a restart script that performs all the necessary steps to fix this issue:

1. Kill any running Next.js processes
2. Clear the Next.js cache
3. Regenerate the Prisma client
4. Start a fresh development server

## How to Fix

Run the restart script from the terminal:

```bash
# Make sure you're in the project root directory
cd /Users/liamj/Documents/development/buildappswith

# Run the restart script
./restart-dev.sh
```

This script will properly restart your development environment.

## Manual Steps (if needed)

If the script doesn't work, you can try these steps manually:

1. Press `Ctrl+C` to stop the current development server
2. Kill any lingering Next.js processes:
   ```bash
   pkill -f "node.*next"
   ```
3. Clear the Next.js cache:
   ```bash
   rm -rf .next
   ```
4. Regenerate the Prisma client:
   ```bash
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Verification

After restarting, the marketplace page should load correctly with all its JavaScript chunks. If you still encounter issues, it might indicate a deeper problem with the Next.js configuration or build process.