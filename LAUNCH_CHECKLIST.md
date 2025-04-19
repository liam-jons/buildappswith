# Buildappswith Launch Checklist

This checklist provides the specific steps needed for the initial MVP launch of Buildappswith.

## MVP Functionality Scope

The launch includes:
- Landing page
- How it works page
- Toolkit page
- Marketplace with 6 builder profiles (5 dummy + 1 real profile for Liam Jones)
- Profile functionality for:
  * Viewing session types and availability
  * Selecting dates and times
  * Processing payments

## Pre-Launch Checklist

### 1. Database Setup

- [ ] Run database migrations
  ```
  pnpm prisma migrate deploy
  ```
- [ ] Seed the database with Liam Jones profile and 5 dummy profiles
  ```
  # RECOMMENDED: Use the environment-aware script
  chmod +x scripts/seed-data/run-builder-seed.sh
  ./scripts/seed-data/run-builder-seed.sh
  
  # Alternative methods if needed:
  # Option 1: TypeScript version with path resolution
  chmod +x scripts/seed-data/run-seeding.sh
  ./scripts/seed-data/run-seeding.sh
  
  # Option 2: Simple JavaScript version
  chmod +x scripts/seed-data/quick-seed.sh
  ./scripts/seed-data/quick-seed.sh
  ```
- [ ] Verify all profiles are visible in the admin panel

### 2. Stripe Integration

- [ ] Verify Stripe environment variables are set:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- [ ] Test payment flow with Stripe test card (4242 4242 4242 4242)
- [ ] Verify successful payment webhook processing
- [ ] Confirm confirmation page displays correctly after payment

### 3. Authentication

- [ ] Test user signup process
- [ ] Verify login functionality works
- [ ] Confirm navigation changes correctly when logged in/out
- [ ] Test admin access for Liam Jones account
- [ ] Verify profile editing works for admin

### 4. Core Pages

- [ ] Verify Landing page loads correctly
- [ ] Check How it works page content and links
- [ ] Ensure Toolkit page displays properly
- [ ] Test Marketplace page with all filters
- [ ] Confirm builder profiles can be viewed

### 5. Booking Flow

- [ ] Verify each profile shows the Schedule button
- [ ] Test selection of different session types
- [ ] Confirm calendar displays available dates
- [ ] Check time slot selection functionality
- [ ] Test entire booking flow end-to-end

### 6. Performance & Accessibility

- [ ] Run Lighthouse audit on key pages
- [ ] Verify WCAG 2.1 AA compliance
- [ ] Test with screen readers
- [ ] Check responsive layout on mobile devices
- [ ] Verify reduced motion preference is respected

### 7. Deployment

- [ ] Build the application for production
  ```
  pnpm run build
  ```
- [ ] Verify environment variables on hosting platform
- [ ] Deploy to staging environment for final testing
- [ ] Perform smoke test on staging
- [ ] Deploy to production environment

## Launch Day

- [ ] Perform final smoke test on production
- [ ] Verify Stripe webhooks are properly configured for production
- [ ] Confirm SSL certificate is valid
- [ ] Test booking flow with real card (small amount)
- [ ] Monitor application logs for errors
- [ ] Be ready to roll back if critical issues are found

## Post-Launch

- [ ] Monitor user signups and sessions
- [ ] Track successful bookings and payments
- [ ] Document any issues for future development
- [ ] Create backlog for next iteration features
- [ ] Schedule retrospective meeting

## Critical Contacts

**Technical Support:**
- Liam Jones - Primary Contact
  - Email: liam.jones@buildappswith.com
  - Phone: [Your phone number]

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com/support
- Email: support@stripe.com

**Hosting Platform Support:**
- [Add relevant hosting platform support details]

## Rollback Procedure

If critical issues are encountered:

1. Identify whether the issue is isolated to a specific feature or affects the entire platform
2. For isolated issues, disable the affected feature if possible
3. For system-wide issues, follow these rollback steps:
   ```
   # Return to the previous stable version
   git checkout [previous-stable-tag]
   
   # Rebuild and redeploy
   pnpm install
   pnpm build
   # Deploy using your platform's deployment command
   ```
4. Communicate the issue and estimated resolution time to users
5. Document the issue, impact, and resolution steps taken
