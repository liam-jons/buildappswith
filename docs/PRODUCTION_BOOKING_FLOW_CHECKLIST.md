# Production Booking Flow Deployment Checklist

## Environment Variables Configuration

### Required Environment Variables for Production

#### 1. Calendly Integration
- [ ] `CALENDLY_API_TOKEN` - Your Calendly Personal Access Token
- [ ] `CALENDLY_USERNAME` - Your Calendly username 
- [ ] `CALENDLY_WEBHOOK_SIGNING_KEY` - For webhook signature verification
- [ ] `CALENDLY_WEBHOOK_URL` - Production webhook endpoint (https://www.buildappswith.com/api/webhooks/calendly)

#### 2. Stripe Integration
- [ ] `STRIPE_SECRET_KEY` - Production Stripe secret key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Production Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - For webhook signature verification
- [ ] `STRIPE_WEBHOOK_URL` - Production webhook endpoint (https://www.buildappswith.com/api/webhooks/stripe)

#### 3. Email Service (SendGrid)
- [ ] `SENDGRID_API_KEY` - Your SendGrid API key
- [ ] `SENDGRID_BOOKING_TEMPLATE_ID` - (Optional) Dynamic template ID
- [ ] `SENDGRID_FROM_EMAIL` - noreply@buildappswith.com

#### 4. Database
- [ ] `DATABASE_URL` - Production database connection string
- [ ] `DIRECT_URL` - Direct database connection (for migrations)

#### 5. Application
- [ ] `NEXT_PUBLIC_BASE_URL` - https://www.buildappswith.com
- [ ] `NODE_ENV` - production
- [ ] `VERCEL_ENV` - production

## Pre-Deployment Verification

### 1. Webhook Configuration
- [ ] Register Calendly webhook endpoint in Calendly dashboard
  - Events to subscribe: `invitee.created`, `invitee.canceled`
  - URL: `https://www.buildappswith.com/api/webhooks/calendly`
- [ ] Configure Stripe webhook endpoint in Stripe dashboard
  - Events to subscribe: `checkout.session.completed`, `payment_intent.succeeded`
  - URL: `https://www.buildappswith.com/api/webhooks/stripe`

### 2. Database Preparation
- [ ] Run all pending migrations on production database
- [ ] Verify all tables exist: `Booking`, `SessionType`, `User`, `BuilderProfile`
- [ ] Check that session types are seeded correctly
- [ ] Ensure builder profiles are visible in marketplace

### 3. Test Webhook Endpoints
```bash
# Test Calendly webhook endpoint
curl -X POST https://www.buildappswith.com/api/webhooks/calendly \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "payload": {}}'

# Test Stripe webhook endpoint
curl -X POST https://www.buildappswith.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "data": {}}'
```

### 4. Email Template Verification
- [ ] Test SendGrid email delivery
- [ ] Verify email templates render correctly
- [ ] Check SPF/DKIM records for buildappswith.com

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# Or using Git push
git push origin main
```

### 2. Post-Deployment Verification
- [ ] Verify all environment variables are set
- [ ] Check deployment logs for errors
- [ ] Test webhook endpoints are accessible
- [ ] Verify database connections are stable

## End-to-End Testing Scenarios

### Test Case 1: Anonymous User - Free Session
1. [ ] Browse marketplace
2. [ ] Select builder profile
3. [ ] Choose free session type
4. [ ] Select available time slot
5. [ ] Complete Calendly booking
6. [ ] Receive confirmation email
7. [ ] Verify booking in database

### Test Case 2: Authenticated User - Paid Session
1. [ ] Log in to the platform
2. [ ] Browse marketplace
3. [ ] Select builder profile
4. [ ] Choose paid session type
5. [ ] Select available time slot
6. [ ] Complete Calendly booking
7. [ ] Complete Stripe payment
8. [ ] Receive confirmation email
9. [ ] Receive payment receipt email
10. [ ] Verify booking status is CONFIRMED
11. [ ] Verify payment status is PAID

### Test Case 3: Booking Cancellation
1. [ ] Create a booking
2. [ ] Cancel via Calendly
3. [ ] Verify webhook processes cancellation
4. [ ] Receive cancellation email
5. [ ] Verify booking status is CANCELLED

### Test Case 4: Webhook Processing
1. [ ] Create booking via Calendly
2. [ ] Verify `invitee.created` webhook is received
3. [ ] Complete payment via Stripe
4. [ ] Verify `checkout.session.completed` webhook is received
5. [ ] Check database synchronization

## Monitoring and Logging

### 1. Error Monitoring (Sentry)
- [ ] Verify Sentry is capturing errors
- [ ] Set up alerts for critical errors
- [ ] Configure error grouping rules

### 2. Performance Monitoring (Datadog)
- [ ] Monitor webhook processing times
- [ ] Track email delivery success rates
- [ ] Monitor database query performance

### 3. Business Metrics
- [ ] Track booking conversion rates
- [ ] Monitor payment success rates
- [ ] Analyze session type popularity

## Rollback Plan

### If Issues Occur:
1. [ ] Revert to previous deployment
2. [ ] Disable webhooks temporarily
3. [ ] Switch to manual booking processing
4. [ ] Communicate with affected users

### Emergency Contacts:
- Calendly Support: (if webhook issues)
- Stripe Support: (if payment issues)
- SendGrid Support: (if email issues)
- Database Support: (if connection issues)

## Security Checklist

- [ ] Webhook signatures are validated
- [ ] Environment variables are encrypted
- [ ] CORS is properly configured
- [ ] Rate limiting is in place
- [ ] Input validation on all endpoints
- [ ] SQL injection protection via Prisma

## Documentation

- [ ] Update API documentation
- [ ] Document webhook payload formats
- [ ] Create troubleshooting guide
- [ ] Update user guides

## Support Preparation

- [ ] Create FAQ for common issues
- [ ] Prepare customer support scripts
- [ ] Set up monitoring alerts
- [ ] Define escalation procedures

## Final Verification

Before declaring production ready:
1. [ ] All test scenarios pass
2. [ ] Monitoring is configured
3. [ ] Documentation is complete
4. [ ] Support team is trained
5. [ ] Rollback plan is tested
6. [ ] Performance meets requirements

## Post-Launch Tasks

After successful deployment:
1. [ ] Monitor system for 24 hours
2. [ ] Review error logs
3. [ ] Collect user feedback
4. [ ] Optimize based on metrics
5. [ ] Plan for scale adjustments

## Notes

- Always test in development first
- Use staging environment if available
- Keep webhook signing keys secure
- Monitor email delivery rates
- Have backup payment processing ready
- Document any custom configurations