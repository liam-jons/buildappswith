# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Database Setup
- **ALWAYS CHECK DATABASE CONNECTION FIRST** - See `/docs/database/CRITICAL_DATABASE_GUIDE.md`
- Development and Production are SEPARATE databases (not branches)
- Production email: `liam@buildappswith.com` (NOT .ai)
- For database operations, ALWAYS run: `node scripts/verify-database-connection.js`
- For collaboration insights: See `/docs/COLLABORATION_INSIGHTS.md`

## Build/Test/Lint Commands
- Build: `pnpm build` (generates Prisma client and builds Next.js)
- Dev: `pnpm dev` (starts development server)
- Lint: `pnpm lint` (runs ESLint)
- Type check: `pnpm type-check` (runs TypeScript type checking)
- Test (all): `pnpm test` (runs Vitest tests)
- Test (single file): `pnpm test path/to/test.test.tsx` (runs specific test file)
- Test (specific pattern): `pnpm test -t "pattern"` (runs tests matching pattern)
- Test coverage: `pnpm test:coverage` (generates test coverage report)

## Testing Environment Notes
- Test commands will timeout after 2 minutes in the Claude environment however, Liam (the human) can run them successfully in the terminal - STOP IF YOU EXPERIENCE ANY TIMEOUT ISSUES AND ASK LIAM HOW TO PROCEED
- Always use full explicit paths when running tests, avoid using ellipsis (`...`) in test paths e.g., This won't work - pnpm test __tests__/unit/lib/sentry/..., but this WILL: pnpm test __tests__/unit/lib/sentry/basic-config.test.ts
- In test files, prefer importing modules directly rather than using relative paths
- When tests timeout, DO NOT increase the timeout
- Use direct mock objects when possible instead of complex module mocking

## Code Style Guidelines
- **Components**: Follow domain-first organization (`components/[domain]/component-name.tsx`)
- **Imports**: Use barrel exports (`import { X } from "@/components/domain"`)
- **Import Order**: External libs → Internal utils → Internal components → Types
- **Types**: Use TypeScript interfaces/types for all components and functions
- **Naming**: PascalCase for components/types, camelCase for functions/variables
- **File Naming**: kebab-case for files, PascalCase for component names
- **Component Pattern**: Use functional components with explicit return types
- **Styling**: Use Tailwind with cn() utility for conditional classes
- **Error Handling**: Use Zod for validation, proper error boundaries in UI
- **Documentation**: Include README.md in each major directory

## System Architecture Notes

### Active Implementation Paths
- **Authentication and user management**: Clerk-based authentication only (NextAuth.js fully removed)
- **Booking System**: Calendly integration with state machine (custom calendar removed)
- **Payment System**: Stripe
- **Marketplace**: Consolidated implementation with `/marketplace/builders/[id]` routing
- **Monitoring**: Sentry via instrumentation pattern with EU region data compliance. Datadog integration.

### Middleware Configuration
- **Public Resources**: All static assets (images, logos, fonts) must be listed in `publicRoutes` array
- **Pattern Matching**: Use `(.*)` for directory wildcards in Clerk middleware
- **Testing**: Run `node scripts/test-public-access.js` to verify public access
- **Documentation**: See `/docs/engineering/MIDDLEWARE_PUBLIC_ACCESS.md` for detailed configuration

### Feature Flags
- `UseBuilderImage`: Controls whether to use the fixed BuilderImage component
- `UseViewingPreferences`: Controls whether to use the ViewingPreferences component
- `UseClerkAuth`: Controls whether to use Clerk authentication
- `UseDynamicMarketplace`: Controls whether to use the dynamic marketplace

### Component Usage Guidelines
- Always use `components/scheduling/calendly` components for booking flows
- Use `BuilderList` component from `components/marketplace` for builder listings
- Ensure marketplace builder profiles use the `/marketplace/builders/[id]` route pattern

Always refer to `/docs/engineering/COMPONENT_STYLE_GUIDE.md` and `/docs/engineering/FOLDER_STRUCTURE_GUIDE.md` for detailed guidelines.

ALWAYS CHECK IF FUNCTIONALITY EXISTS FIRST, BEFORE BUILDING SOMETHING NEW - ITS CRITICAL THAT WE DON'T CAUSE UNNECESSARY EFFORT FOR OURSELVES, OR DO ANYTHING THAT WOULD BE UNHELPFUL AND WOULD GO AGAINST BEST PRACTICE, UNLESS THERE IS EXPLICIT CONFIRMATION FROM LIAM.