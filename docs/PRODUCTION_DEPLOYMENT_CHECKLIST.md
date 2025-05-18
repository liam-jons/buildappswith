# Production Deployment Checklist

## Environment Variables

### Required for Production
- [ ] `CALENDLY_API_TOKEN`: Your Calendly API personal access token
- [ ] `CALENDLY_USERNAME`: Your Calendly username (for scheduling URLs)
- [ ] `CALENDLY_WEBHOOK_SIGNING_KEY`: Webhook signature validation
- [ ] `STRIPE_SECRET_KEY`: Updated production key (already done)
- [ ] `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- [ ] `SENDGRID_API_KEY` or `RESEND_API_KEY`: Email service credentials
- [ ] `NEXT_PUBLIC_BASE_URL`: Should be `https://www.buildappswith.com`

### Calendly Dashboard Configuration

1. **Create Webhook Subscription**
   - URL: `https://www.buildappswith.com/api/webhooks/calendly`
   - Events: `invitee.created`, `invitee.canceled`
   - Save the signing secret to environment variables

2. **Configure Event Types**
   - Ensure all 8 event types are active
   - Verify scheduling URLs match database records
   - Set up any custom questions if needed

3. **Test Integration**
   - Create a test booking
   - Verify webhook is received
   - Check database updates

### Email Service Setup (SendGrid Recommended)

1. **Create Account**
   - Sign up at https://sendgrid.com
   - Choose appropriate plan

2. **Domain Verification**
   - Add DNS records for buildappswith.com
   - Verify sender authentication

3. **Create API Key**
   - Navigate to Settings > API Keys
   - Create full access key
   - Add to Vercel environment variables

4. **Update Email Implementation**
   ```bash
   pnpm add @sendgrid/mail
   ```

### Monitoring Setup

1. **Error Tracking**
   - Sentry is already configured
   - Ensure production DSN is set

2. **Performance Monitoring**
   - Datadog is configured
   - Set up custom dashboards for booking flow

3. **Webhook Monitoring**
   - Log all webhook events
   - Set up alerts for failures

### Security Checklist

- [ ] All API keys are server-side only
- [ ] Webhook signatures are validated
- [ ] CORS is properly configured
- [ ] Rate limiting is in place
- [ ] Input validation on all endpoints

### Testing Checklist

- [ ] Free session booking flow
- [ ] Paid session with payment
- [ ] Webhook processing
- [ ] Email delivery
- [ ] Error handling
- [ ] Mobile responsiveness

## Deployment Steps

1. **Update Environment Variables in Vercel**
   ```bash
   vercel env add CALENDLY_WEBHOOK_SIGNING_KEY production
   vercel env add SENDGRID_API_KEY production
   ```

2. **Deploy to Production**
   ```bash
   git push origin main
   ```

3. **Run Post-Deployment Tests**
   - Execute `scripts/test-booking-flow.js` against production
   - Monitor logs for errors
   - Test webhook delivery

4. **Monitor Initial Usage**
   - Watch Sentry for new errors
   - Check Datadog metrics
   - Review booking completion rates

## Rollback Plan

If issues arise:
1. Revert to previous deployment in Vercel
2. Check webhook logs for failures
3. Review error tracking
4. Communicate with affected users

## Success Metrics

Monitor these KPIs:
- Booking completion rate
- Average time to book
- Error rates
- Email delivery rates
- Payment success rates