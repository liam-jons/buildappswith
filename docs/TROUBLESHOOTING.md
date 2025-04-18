# Buildappswith Platform Troubleshooting Guide

This document provides solutions for common build and development issues encountered with the Buildappswith platform.

## Build Issues

### Port Conflicts

**Symptom**: Error message: `listen EADDRINUSE: address already in use 127.0.0.1:XXXX`

**Solution**:
1. Disable the webpack-bundle-analyzer during normal development. In `next.config.mjs`:
   ```javascript
   // Only run when explicitly enabled
   if (process.env.ANALYZE === 'true' && !isServer) {
     config.plugins.push(
       new BundleAnalyzerPlugin({
         analyzerMode: 'server',
         analyzerPort: 8890,
         openAnalyzer: false,
       })
     );
   }
   ```
2. Use the dedicated script for bundle analysis when needed:
   ```bash
   npm run dev:analyze
   # or
   npm run build:analyze
   ```
3. If port conflicts still occur, identify and stop the process using the port:
   - On Linux/Mac: `lsof -i :XXXX` then `kill PID`
   - On Windows: `netstat -ano | findstr :XXXX` then `taskkill /PID YYYY /F`

### Missing Bundle Assets

**Symptom**: Multiple "no such file" errors for Next.js bundle files during build

**Solution**:
1. Clean the `.next` directory and cache:
   ```bash
   # Use the script we added
   npm run clean
   
   # Or manually
   rm -rf .next node_modules/.cache
   ```
2. Run a clean build:
   ```bash
   npm run build:clean
   ```
3. If issues persist, try a complete reinstall of dependencies:
   ```bash
   npm run clean:full
   npm install
   npm run build
   ```

### Webpack Caching Issues

**Symptom**: `Error: ENOENT: no such file or directory, rename...` or `[webpack.cache.PackFileCacheStrategy] Caching failed for pack`

**Solution**:
1. Clean Next.js cache and temporary files:
   ```bash
   npm run clean
   ```
2. If issues persist, try a complete rebuild with clean cache:
   ```bash
   npm run build:clean:full
   ```
3. Ensure proper file permissions on the project directory
4. Check disk space availability
5. Increase watchers limit if on Linux:
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
   ```

## Authentication and Security Issues

### Content Security Policy Conflicts

**Symptom**: Authentication or API requests fail with CSP errors in browser console

**Solution**:
1. Check Content Security Policy in `next.config.mjs`
2. Ensure `connect-src` directive includes necessary domains:
   ```javascript
   connect-src 'self' https://api.stripe.com https://*.vercel-insights.com http://localhost:* https://localhost:*;
   ```
3. For NextAuth.js, ensure proper domains are allowed in frame-src and connect-src

### Authentication Failures

**Symptom**: Login fails or sessions don't persist

**Solution**:
1. Verify NextAuth.js configuration in `pages/api/auth/[...nextauth].js`
2. Check NEXTAUTH_URL and NEXTAUTH_SECRET environment variables
3. Ensure CSRF protection is properly configured for authentication endpoints
4. Verify database connection for session storage

## API and Backend Issues

### Rate Limiting Blocks

**Symptom**: API requests receive 429 responses during development

**Solution**:
1. Check rate limiting configuration in `lib/rate-limit.ts`
2. Increase limits for development environment:
   ```javascript
   const DEFAULT_RATE_LIMITS = {
     // Increase these values for development
     api: process.env.NODE_ENV === 'development' ? 200 : 60,
     auth: process.env.NODE_ENV === 'development' ? 50 : 10,
     // ...other limits
   };
   ```

### CSRF Validation Failures

**Symptom**: API requests fail with "Invalid CSRF token" error

**Solution**:
1. Verify CSRF implementation in `lib/csrf.ts`
2. Ensure proper handling of CSRF tokens in forms and API requests
3. Check that CSRF middleware exempts authentication endpoints
4. Use the `CsrfField` component in all forms and the `getCsrfToken` function for AJAX requests

## Environment Issues

### Environment Variable Missing

**Symptom**: Application crashes with "Cannot read properties of undefined" related to environment variables

**Solution**:
1. Check `.env.local` file for missing variables
2. Ensure all required variables are defined
3. Restart the development server after changing environment variables

### Database Connection Issues

**Symptom**: Database-related errors during development or build

**Solution**:
1. Verify DATABASE_URL in `.env.local`
2. Check database access permissions
3. Ensure database schema is up to date:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```
4. Generate up-to-date Prisma client:
   ```bash
   npx prisma generate
   ```

## Development Workflow Tips

### Efficient Rebuilds

For faster development cycles:

1. Use incremental rebuilds when possible:
   ```bash
   npm run dev
   ```

2. When encountering build issues, use the clean scripts:
   ```bash
   # For minor cache issues
   npm run clean
   
   # For complete reinstall
   npm run clean:full && npm install
   ```

3. Monitor bundle size during development:
   - Use the bundle analyzer at http://localhost:8890 (after port change)
   - Look for unusually large dependencies or duplicate modules

### Debugging Security Headers

1. Use browser developer tools to inspect headers on responses
2. Temporarily disable specific headers for testing:
   ```javascript
   // In next.config.mjs
   // Comment out problematic headers for testing
   async headers() {
     return [
       {
         source: '/:path*',
         headers: securityHeaders.filter(header => 
           header.key !== 'Content-Security-Policy' // Comment out CSP temporarily
         ),
       },
     ];
   },
   ```

3. Re-enable headers after identifying issues

## Code and Syntax Issues

### Duplicate Variable or Function Declarations

**Symptom**: Error messages like `Module parse failed: Identifier 'X' has already been declared`

**Solution**:
1. Check for duplicate variable or function declarations in the identified file
2. Look for the exact identifier mentioned in the error message
3. Fix duplicate declarations:
   ```javascript
   // Fix this:
   const clearAllFilters = () => { /* code */ };
   
   // Later in the same file:
   const clearAllFilters = () => { /* more code */ }; // Duplicate declaration!
   
   // By removing one declaration or renaming one of them
   ```
4. Use ESLint to catch these issues early:
   ```bash
   npm run lint
   ```

## Deployment Issues

### Vercel Deployment Failures

**Symptom**: Build fails in Vercel but works locally

**Solution**:
1. Check Vercel logs for specific errors
2. Verify environment variables are correctly set in Vercel dashboard
3. Ensure build output settings match your configuration:
   ```javascript
   // In next.config.mjs
   output: 'standalone',
   ```
4. Check for Vercel-specific configuration in `vercel.json`