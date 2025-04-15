# Buildappswith Session: April 16, 2025

## Project Status

**Current Phase:** Phase 1 (Foundation) - MVP development

**Version:** 0.1.2

**Repository:** /Users/liamj/Documents/Development/buildappswith

## Focus Component

Today we're focusing on **Vercel Deployment and Builder Profile Creation** which are currently in **Planning** state.

### Component Description
We need to set up Vercel deployment to establish our preview and production environments, then implement the Builder Profile Creation system to allow you to showcase your expertise, schedule free sessions for unemployed users, and begin building the marketplace foundation.

### Recent Progress
- Completed landing page implementation
- Set up comprehensive project documentation and structure
- Established GitHub templates and project management docs
- Created GitHub repository and resolved setup issues

### Goals for This Session
- [ ] Configure Vercel deployment
  - Set up preview environments
  - Configure environment variables
  - Implement deployment workflow
- [ ] Design builder profile data model
  - Define schema for profile information
  - Create validation tier structure
  - Plan portfolio section requirements
- [ ] Research and select scheduling integration
  - Evaluate Calendly, Cal.com, and alternatives
  - Determine embedding approach
  - Plan authentication requirements

### Key Requirements
- Must support all three validation tiers (Entry, Established, Expert)
- Portfolio section for project showcases
- Integration with scheduling systems for free sessions
- Support for video conferencing links/embeds
- Accessibility for all user abilities
- Preview deployments for QA before production

## Reference Information

### Related Components
- Validation System - Not Started
- Portfolio Gallery - Not Started
- Scheduling Integration - Not Started
- Authentication System - Not Started

### Relevant Decisions
- DES-004 - "Race to top" validation visualization
- FEAT-001 - Tiered builder validation system
- FEAT-005 - Free educational sessions for unemployed
- FEAT-006 - External scheduling integration
- TECH-005 - External scheduling and video conferencing
- DEPLOY-001 - Vercel for deployment

### Accessibility Requirements
- Form validation must be screen reader compatible
- All interactive elements must support keyboard navigation
- Color contrast must meet WCAG AA standards
- Profile display must be compatible with assistive technologies

## Current Implementation Challenges

1. Determining the best external scheduling service to integrate with (Calendly, Cal.com, etc.)
2. Planning authentication flow that balances security with ease of use
3. Designing a flexible portfolio showcase system that can grow with future requirements
4. Implementing the validation tier visualization in a way that communicates trustworthiness without being complex

## Next Up After This Component

After completing the Vercel deployment and Builder Profile Creation:
1. Implement basic authentication system to support profile creation
2. Develop the "What AI Can/Can't Do" timeline for AI literacy
3. Create Project Creation system for clients to define their requirements
4. Integrate builder profiles into homepage to feature selected builders
