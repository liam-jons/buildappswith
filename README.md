# Buildappswith Platform

Buildappswith represents a transformative platform designed to democratize AI application development through a human-centered approach. This MVP focuses on connecting users with trusted AI builders for guidance and education.

## Project Overview

The platform creates a marketplace where users can connect with verified builders for affordable custom solutions, while also providing accessible education resources that empower anyone to understand and leverage AI effectively in their daily lives.

## MVP Features

1. **Landing Page** - Dynamic builder showcase with clear value proposition
2. **Simplified Marketplace** - Featuring Liam Jons' profile with booking functionality
3. **Liam Jons Profile** - Comprehensive profile with session booking capabilities
4. **"How It Works" Page** - Educational content explaining the platform
5. **Toolkit Page** - Curated collection of recommended AI tools
6. **User Registration** - Basic community building with email collection

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, set up your environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your database and Stripe credentials
```

Run database migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

## Technology Stack

- **Frontend**: Next.js 15.3.1 with App Router, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM (v6.6.0)
- **Authentication**: NextAuth.js with database adapter
- **Components**: Shadcn/ui components enhanced with Magic UI
- **Accessibility**: WCAG 2.1 AA compliance
- **Payment Processing**: Stripe integration
- **Deployment**: Vercel with GitHub integration

## Project Structure

- `/app` - Next.js application files (pages, routes, etc.)
- `/components` - Reusable React components
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/prisma` - Database schema and migrations
- `/docs` - Project documentation

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://...
PRODUCTION_DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

See [docs/ENVIRONMENT_MANAGEMENT.md](docs/ENVIRONMENT_MANAGEMENT.md) for complete details.

## Key Documentation

### MVP Documentation
- [MVP_COMPONENT_STATUS.md](docs/MVP_COMPONENT_STATUS.md) - Implementation status for PRD 2.0 features
- [PRD_2.0_FEATURES.md](docs/PRD_2.0_FEATURES.md) - Detailed PRD 2.0 feature specifications
- [IMPLEMENTATION_DEVIATIONS.md](docs/IMPLEMENTATION_DEVIATIONS.md) - Features implemented beyond PRD 2.0 scope

### Technical Resources
- [DATABASE_SETUP.md](docs/DATABASE_SETUP.md) - Database setup and migration guide
- [ENVIRONMENT_MANAGEMENT.md](docs/ENVIRONMENT_MANAGEMENT.md) - Environment variable management
- [STRIPE_INTEGRATION.md](docs/STRIPE_INTEGRATION.md) - Payment integration documentation

### Deployment
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - General deployment instructions
- [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) - Vercel-specific deployment guidelines

## Development Status

The platform is currently live in production with MVP features complete. Key achievements:

- ✅ Landing page with builder showcase
- ✅ Booking system integration with Stripe
- ✅ Builder profile with appointment scheduling
- ✅ Authentication system with user roles
- ✅ Basic marketplace functionality

See [MVP_COMPONENT_STATUS.md](docs/MVP_COMPONENT_STATUS.md) for detailed status of PRD 2.0 components.

## Future Development

Beyond the MVP, the platform aims to expand with:
- Additional verified builders
- Enhanced community features
- Expanded educational resources
- Advanced marketplace capabilities

See the archived original vision documentation for long-term plans.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
