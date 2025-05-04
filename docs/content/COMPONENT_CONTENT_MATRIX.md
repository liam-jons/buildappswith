# Component Content Requirements Matrix

**Version:** 1.0  
**Date:** May 3, 2025  
**Purpose:** Map content requirements to each component for consistent content integration

## Marketing Domain Components

### MarketingHeader
**Content Requirements:**
- Navigation labels (UK English)
- CTA button text
- Logo alt text
- Mobile menu labels

**Default Content:**
- "Sign in" (not "Login")
- "Get Started" (main CTA)
- "Buildappswith logo" (alt text)

**Accessibility:** ARIA labels in UK English

### MarketingHero
**Content Requirements:**
- Main headline (dynamic with name rotation)
- Subheadline
- Primary CTA button text
- Secondary CTA button text

**Tone Considerations:**
- Empowering, direct
- Focus on transformation, not revolution
- UK spelling throughout

**ADHD Considerations:**
- Clear, concise messaging
- Option to disable animations if needed

### MarketingStats
**Content Requirements:**
- Metric labels
- Statistic values
- Contextual descriptions

**Formatting:**
- British number formatting (1,234.56)
- Percentage symbols with proper spacing

### FeatureShowcase
**Content Requirements:**
- Feature titles
- Feature descriptions
- Visual labels
- "Read more" links

**Content Focus:**
- Practical applications
- Real outcomes
- User benefits

### MarketingCTA
**Content Requirements:**
- Section heading
- Value proposition text
- CTA button variants
- Supporting microcopy

**Variants to Support:**
- Primary: "Get started now"
- Secondary: "Request demo"
- Tertiary: "Keep me informed"

### MarketingFAQ
**Content Requirements:**
- Question prompts
- Detailed answers
- Expandable content labels

**Accessibility:**
- ARIA expanded states
- Screen reader text for expand/collapse

### MarketingFooter
**Content Requirements:**
- Navigation sections
- Legal links
- Contact information
- Newsletter signup CTA

## Marketplace Domain Components

### BuilderCard
**Content Requirements:**
- Builder name
- Specialisation areas
- Rating/validation tier
- Price range
- Session types offered
- "View profile" button

**Trust Signals:**
- Verification badge labels
- Success metrics
- Client testimonial preview

### BuilderGrid
**Content Requirements:**
- Filter labels
- Search placeholder text
- "No results" messaging
- Pagination labels

**Error States:**
- Loading indicators
- Empty state messages
- Network error messages

### CategoryFilter
**Content Requirements:**
- Category names
- "All categories" option
- Selected state indicators
- Filter count badges

## Profile Domain Components

### ProfileHeader
**Content Requirements:**
- User name/business name
- Tagline/specialisation
- Location (if public)
- Availability indicator
- Contact button text

**ADHD-Specific Fields:**
- Working style preferences
- Communication preferences
- Session structure preferences

### ValidationTierBadge
**Content Requirements:**
- Tier level names
- Tier descriptions
- Progress indicators
- Next tier requirements

**Tier Levels:**
- Verified
- Established
- Expert
- Master

### SessionTypeCard
**Content Requirements:**
- Session type name
- Duration display
- Price display
- Brief description
- Booking button text

**Formatting:**
- Price in GBP (£)
- Duration in hours/minutes
- Available slots indicator

### ProfileStats
**Content Requirements:**
- Metric labels
- Value displays
- Comparison indicators
- Achievement descriptions

## Trust Domain Components

### TrustProofCompanies
**Content Requirements:**
- Section title
- Company descriptions
- Logo alt text
- Trust indicators

**Current Status:**
- Technology ecosystem vs. client testimonials
- Permission disclaimers
- Verification indicators

### ValidationBadge
**Content Requirements:**
- Validation status
- Verification date
- Criteria met
- Tooltip descriptions

**States:**
- Verified
- Pending
- Expired
- Not verified

### TestimonialCard
**Content Requirements:**
- Quote text
- Client name
- Client business/role
- Project outcome
- Verification status

## Booking Domain Components

### CalendarComponent
**Content Requirements:**
- Month/year labels
- Day names (abbreviated)
- Available/unavailable indicators
- Time slot labels
- Date format (DD/MM/YYYY)

**Accessibility:**
- Date navigation labels
- Time zone indicators
- Screen reader announcements

### BookingForm
**Content Requirements:**
- Field labels
- Placeholder text
- Validation messages
- Confirmation text
- Error messages

**Forms:**
- Session type selection
- Duration selection
- Date/time selection
- Requirements input
- Contact preferences

## Payment Domain Components

### CheckoutSummary
**Content Requirements:**
- Item descriptions
- Price breakdown
- VAT information
- Total calculation
- Payment button text

**Legal Text:**
- Terms acceptance
- Cancellation policy
- Refund policy links

### PaymentStatus
**Content Requirements:**
- Success/failure messages
- Next steps instructions
- Receipt information
- Support contact details

## Learning Domain Components

### ProgressTracker
**Content Requirements:**
- Skill labels
- Completion percentages
- Next milestone text
- Achievement descriptions

### KnowledgeCard
**Content Requirements:**
- Topic title
- Difficulty level
- Duration estimate
- Prerequisites
- Learning outcomes

## Content Update Workflow

### Regular Updates
1. **Weekly:** Blog content, featured builders
2. **Monthly:** Landing page testimonials, stats
3. **Quarterly:** Pricing, feature updates
4. **As needed:** Help documentation, FAQs

### Automated Updates
- AI capability updates
- Builder availability
- Real-time pricing
- Session availability

### Content Localisation Pipeline
1. Source content creation
2. UK English conversion
3. Legal review
4. Accessibility check
5. Implementation
6. A/B testing

## Accessibility Requirements

### All Components
- Alt text for images
- ARIA labels for interactive elements
- High contrast text
- Keyboard navigable
- Screen reader friendly

### Language-Specific
- UK English for all user-facing text
- US English for code/technical terms
- Consistent terminology across components

## Next Steps
1. Populate default content for each component
2. Create content templates for dynamic content
3. Implement translation/localisation system
4. Set up content monitoring for consistency
5. Establish content update approval workflow
