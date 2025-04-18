# Buildappswith Platform

The Buildappswith platform democratizes AI application development through an innovative marketplace connecting clients with validated builders, combined with practical AI education resources.

## Project Overview

Buildappswith is a platform designed to bridge the gap between AI's advanced capabilities and practical implementation. It offers:

1. **Builder Marketplace** - Connect with validated AI app developers
2. **AI Learning Hub** - Learn practical AI skills through gamified paths
3. **"What AI Can/Can't Do" Timeline** - Explore AI capabilities and limitations
4. **Builder Profiles** - Transparent metrics for builder selection
5. **Community Exchange** - Knowledge sharing among users

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

## Project Structure

The Buildappswith project is organized with the following directory structure:

- `/app` - Next.js application files (pages, routes, etc.)
- `/components` - Reusable React components
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/prisma` - Database schema and migrations
- `/tests` - Testing infrastructure
  - `/tests/stagehand-tests` - Stagehand automated testing
- `/docs` - Project documentation
- `/scripts` - Utility scripts for environment setup and database management

For a comprehensive guide to the project structure, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## Key Documentation

### Project Overview and Structure
- [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Comprehensive codebase organization
- [COMPONENT_STATUS.md](COMPONENT_STATUS.md) - Implementation status of platform components
- [DECISIONS.md](DECISIONS.md) - Architecture and design decisions with rationales

### Development Guidelines
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Guidelines for contributing to the project
- [ROADMAP.md](docs/ROADMAP.md) - Planned features and development timeline
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes

### Technical Resources
- [DATABASE_SETUP.md](docs/DATABASE_SETUP.md) - Database setup and migration guide
- [ENVIRONMENT_MANAGEMENT.md](docs/ENVIRONMENT_MANAGEMENT.md) - Environment variable management
- [MAGIC_UI_TEMPLATES.md](docs/MAGIC_UI_TEMPLATES.md) - Documentation for Magic UI reference templates
- [REPOMIX_XML.md](docs/REPOMIX_XML.md) - Information about the repomix-output.xml context file
- [MAGIC_UI_TESTING_PLAN.md](docs/MAGIC_UI_TESTING_PLAN.md) - Testing plan for Magic UI components

### Deployment
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - General deployment instructions
- [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) - Vercel-specific deployment guidelines
- [VERCEL_ENV_SETUP.md](docs/VERCEL_ENV_SETUP.md) - Environment setup for Vercel deployments

## Technology Stack

- **Frontend**: Next.js with App Router, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with database adapter
- **Components**: Shadcn/ui components enhanced with Magic UI for improved visuals
- **Accessibility**: Full WCAG 2.1 AA compliance with dark mode, high contrast, reduced motion options
- **Animation**: Framer Motion with accessibility considerations
- **Payment Processing**: Stripe integration
- **Deployment**: GitHub-based workflow with Vercel integration

## Database Setup

The platform uses PostgreSQL with Prisma ORM. To set up the database:

1. Configure your database connection in `.env.local`:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

2. Generate the Prisma client:
   ```bash
   pnpm prisma:generate
   ```

3. Run migrations:
   ```bash
   pnpm prisma:migrate:dev
   ```

4. Seed the database:
   ```bash
   pnpm db:seed
   ```

For complete details, see [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md).

## Environment Management

Buildappswith uses a hierarchical environment variable system. You can check your environment configuration with:

```bash
pnpm env:check
```

For complete details, see [docs/ENVIRONMENT_MANAGEMENT.md](docs/ENVIRONMENT_MANAGEMENT.md).

## Magic UI Templates

The project includes several Magic UI template directories that serve as reference implementations:

- `magicuidesign-devtool-template-*` - Developer tools and utilities
- `magicuidesign-dillionverma-startup-template-*` - Startup landing page components
- `magicuidesign-mobile-template-*` - Mobile-responsive design patterns
- `magicuidesign-saas-template-*` - SaaS application UI components

These are not part of the main application code. See [docs/MAGIC_UI_TEMPLATES.md](docs/MAGIC_UI_TEMPLATES.md) for detailed information.

## AI Context Retention

For AI assistants working on the project, we maintain a special file:

- `repomix-output.xml` - Structured repository content for AI context retention

This file should never be manually edited. See [docs/REPOMIX_XML.md](docs/REPOMIX_XML.md) for details.

## Testing

### Running Automated Tests

We use Stagehand for automated browser testing. To run these tests:

1. Navigate to the Stagehand tests directory:
   ```bash
   cd tests/stagehand-tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Run the tests:
   ```bash
   npm start
   ```

## Development Workflow

1. All feature development happens in the `develop` branch
2. Production deployments are made from the `main` branch
3. Documentation is updated alongside code changes
4. Version numbers are incremented with each change (current: 0.1.62)

## Project Status

Buildappswith is currently in Phase 1 (Foundation) of development. See the `COMPONENT_STATUS.md` file for details on the implementation status of specific components.

## License

This project is licensed under the MIT License - see the LICENSE file for details.