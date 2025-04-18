# Project Structure Overview

This document provides a comprehensive overview of the Buildappswith project structure, designed to help both human developers and AI assistants understand the codebase organization.

## Root Directory

The project root contains configuration files, documentation, and top-level directories:

```
buildappswith/
├── .next/                  # Next.js build output (gitignored)
├── .github/                # GitHub workflows and CI/CD configuration
├── app/                    # Next.js App Router pages and routes
├── components/             # Shared React components used throughout the app
├── docs/                   # Project documentation
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and shared code
├── public/                 # Static assets (images, fonts, etc.)
├── tests/                  # Testing infrastructure
│   └── stagehand-tests/    # Stagehand automated testing
├── node_modules/           # Dependencies (gitignored)
├── Magic UI templates/     # Reference templates (explained below)
├── CHANGELOG.md            # Version history and changes
├── COMPONENT_STATUS.md     # Implementation status of components
├── DECISIONS.md            # Architecture and design decisions
├── README.md               # Project overview and getting started guide
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── repomix-output.xml      # Context retention for AI assistants
```

## Key Directories Explained

### `/app` - Next.js Application

Contains the main application files using the Next.js App Router pattern:

```
app/
├── (auth)/                 # Authentication-related routes
├── (dashboard)/            # Dashboard and authenticated user routes
├── (platform)/             # Platform routes and features
│   ├── marketplace/        # Builder marketplace pages
│   ├── profile/            # User profile pages
│   ├── payment/            # Payment processing pages
│   │   ├── success/        # Payment success handling
│   │   └── cancel/         # Payment cancellation handling
├── api/                    # API endpoints
│   ├── stripe/             # Stripe payment processing endpoints
│   │   ├── checkout/       # Checkout session creation
│   │   ├── webhook/        # Webhook event handling
│   │   └── sessions/       # Session information retrieval
├── globals.css             # Global CSS styles
├── layout.tsx              # Root layout component
└── page.tsx                # Homepage component
```

### `/components` - React Components

Reusable UI components organized by purpose:

```
components/
├── ui/                     # Basic UI components (buttons, inputs, etc.)
├── layout/                 # Layout components (headers, footers, etc.)
├── marketplace/            # Components specific to the Builder Marketplace
├── learning/               # Components for the AI Learning Hub
├── timeline/               # Components for the "What AI Can/Can't Do" Timeline
├── profiles/               # Components for Builder Profiles
├── community/              # Components for Community Exchange
├── magicui/                # Enhanced visual components using Magic UI
└── [component-name]/       # Complex components with multiple sub-components
```

### `/lib` - Utility Functions

Contains shared utilities and helper functions used throughout the application:

```
lib/
├── scheduling/            # Scheduling system utilities
│   ├── types.ts           # Scheduling data types
│   ├── utils.ts           # Helper functions
│   └── mock.ts            # Mock data (to be replaced with API)
├── stripe/                # Stripe payment processing utilities
│   └── index.ts           # Stripe helper functions
├── utils.ts               # General utility functions
├── validation.ts          # Validation system functions
└── marketplace.ts         # Marketplace utility functions
```

### `/docs` - Documentation

Project documentation files:

```
docs/
├── CONTRIBUTING.md         # Contribution guidelines
├── ROADMAP.md              # Development roadmap
├── COMPONENT_STATUS.md     # Component implementation status
├── DECISIONS.md            # Architecture and design decisions
├── DEPLOYMENT.md           # Deployment instructions
├── MAGIC_UI_TESTING_PLAN.md # Testing plan for Magic UI components
└── components/             # Component-specific documentation
```

### `/tests` - Testing Infrastructure

Testing tools and test files:

```
tests/
└── stagehand-tests/        # Stagehand automated browser testing
```

## Magic UI Templates

The repository includes several Magic UI template directories that serve as reference implementations. These are not part of the main application code but provide examples and patterns for implementing Magic UI components.

Each template directory contains a standalone Next.js application with Magic UI components:

```
magicuidesign-[template-name]/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   └── lib/                # Utility functions
├── README.md               # Template documentation
└── package.json            # Template dependencies
```

The templates include:

1. **magicuidesign-devtool-template**: Developer tools and utilities
2. **magicuidesign-dillionverma-startup-template**: Startup landing page components
3. **magicuidesign-mobile-template**: Mobile-responsive design patterns
4. **magicuidesign-saas-template**: SaaS application UI components

These templates serve as inspiration and reference for implementing Magic UI components in the main application. They are not actively developed as part of the main codebase but are kept as references.

## Special Files

### `repomix-output.xml`

This file contains a structured export of the repository's content, designed to help AI assistants maintain context between sessions. It includes:

- File paths and contents
- Directory structures
- Commit history
- Documentation text

The file is automatically generated and should not be manually edited. It's used by AI assistants to understand the project structure and quickly access information without needing to scan the entire codebase in each session.

### `COMPONENT_STATUS.md`

Tracks the implementation status of each platform component:

- Builder Marketplace
- AI Learning Hub
- "What AI Can/Can't Do" Timeline
- Builder Profiles & Validation System
- Community Exchange
- Ecosystem Integration Hub
- Skill Evolution Tracking System
- Sustainability Framework

### `DECISIONS.md`

Documents architectural and design decisions made during development, including rationales and alternatives considered.

## Development Workflow

The project uses a structured development workflow:

1. All feature development happens in the `develop` branch
2. Production deployments are made from the `main` branch
3. Documentation is updated alongside code changes
4. Version numbers are incremented with each change (current: 0.1.60)

## Accessibility

The entire application is built with accessibility as a priority:

- WCAG 2.1 AA compliance
- Dark mode and high contrast options
- Reduced motion settings
- Keyboard navigation support
- Screen reader compatibility

## AI Assistant Context Retention

For AI assistants working on the project, the following files provide important context:

1. `README.md` - Project overview
2. `docs/PROJECT_STRUCTURE.md` - This file, explaining codebase organization
3. `COMPONENT_STATUS.md` - Current implementation status
4. `DECISIONS.md` - Architecture and design decisions
5. `docs/CONTRIBUTING.md` - Development guidelines
6. `docs/ROADMAP.md` - Development plan and timeline
7. `repomix-output.xml` - Structured repository content
