# Buildappswith Deployment Guide

This guide provides instructions for deploying the Buildappswith platform.

## Prerequisites

- Node.js v20+
- PNPM package manager
- Git

## Deployment Steps

### 1. Clone the repository (if not already done)

```bash
git clone [repository-url]
cd buildappswith
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Ensure correct Tailwind CSS configuration

The project uses Tailwind CSS v3.4.17. If you encounter styling issues, run the fix-tailwind script:

```bash
pnpm run fix-tailwind
```

This script will:
- Ensure the correct Tailwind CSS version (v3.4.17) is installed
- Update the postcss.config.js to use the correct configuration
- Clean build artifacts to ensure a fresh build

### 4. Build the application

```bash
pnpm build
```

### 5. Run the deployment script

Make the deployment script executable:

```bash
chmod +x scripts/deploy.sh
```

Run the deployment script:

```bash
./scripts/deploy.sh
```

### 6. Verify deployment

Start the application locally to verify everything is working:

```bash
pnpm start
```

## Troubleshooting

### Styling Issues

If you encounter styling issues after deployment:

1. Verify that you're using Tailwind CSS v3.4.17 (not v4)
2. Check that your `postcss.config.js` contains:
   ```js
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```
3. Remove the `.next` directory and rebuild:
   ```bash
   pnpm run build:clean
   ```

### Build Failures

If the build fails:

1. Check the error messages in the console
2. Verify that all dependencies are correctly installed
3. Check for any conflicting PostCSS configuration files in the project
4. Ensure environment variables are properly configured

## Database Synchronization

Before deploying to production, synchronize the database:

```bash
pnpm run db:sync
```

This ensures your database schema matches your Prisma models.

## Stripe Payment Integration

The platform uses Stripe for processing payments. Follow these steps to set up Stripe:

1. **Create a Stripe Account**:
   - Sign up at [stripe.com](https://stripe.com) if you don't have an account
   - Switch to test mode for development/staging environments

2. **Get API Keys**:
   - Navigate to Developers > API keys in your Stripe dashboard
   - Copy your publishable key and secret key
   - Add these to your environment variables

3. **Set Up Webhook Endpoint**:
   - In the Stripe dashboard, go to Developers > Webhooks
   - Add an endpoint with URL: `https://your-domain.com/api/stripe/webhook`
   - Subscribe to these events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret and add it to your environment variables

4. **Test the Integration**:
   - In development, use Stripe's test cards (e.g., `4242 4242 4242 4242`)
   - Test the entire booking flow from selecting a session to payment confirmation
   - Check for webhook event processing by monitoring your application logs

5. **Go Live**:
   - When ready for production, switch Stripe to live mode
   - Update your environment variables with live API keys
   - Update the webhook endpoint to use your production URL

## Environment Variables

Ensure all required environment variables are set in your environment:

1. `DATABASE_URL`: Your database connection string
2. `NEXTAUTH_URL`: Your application URL
3. `NEXTAUTH_SECRET`: A secure random string
4. OAuth provider keys (GitHub, Google, etc.)
5. Stripe payment integration keys:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
6. Any other service-specific environment variables

## Maintenance

After deployment, regularly:

1. Update dependencies to their latest versions
2. Test the application thoroughly after each update
3. Monitor application performance and error logs
