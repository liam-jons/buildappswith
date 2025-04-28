# Buildappswith Architecture Documentation

This document provides an overview of the Buildappswith platform architecture, our approach to architecture documentation, and guides for working with our architectural models.

## Architecture Overview

Buildappswith is a platform designed to democratize AI application development through a marketplace connecting clients with validated builders, combined with practical AI education resources. 

### Core Platform Components

1. **Builder Marketplace**: Central hub where clients discover builders based on validation metrics
2. **AI Learning Hub**: Educational resources for developing AI and app development skills
3. **"What AI Can/Can't Do" Living Timeline**: Interactive visualization of AI capabilities
4. **Builder Profiles & Validation System**: Comprehensive profiles with transparent validation metrics
5. **Community Exchange**: Collaborative environment for knowledge sharing
6. **Ecosystem Integration Hub**: Connects users with existing tools and services
7. **Skill Evolution Tracking System**: Visualizes skill evolution over time
8. **Sustainability Framework**: Promotes and tracks environmental responsibility

### Technical Stack

- **Frontend**: Next.js 15.3.1 with App Router, React 19.1.0, TypeScript
- **UI**: Tailwind CSS 3.4.17 with Magic UI components
- **Database**: PostgreSQL with Prisma ORM v6.6.0
- **Authentication**: Clerk (migration completed)
- **Payment**: Stripe integration
- **Deployment**: Vercel with GitHub integration
- **Testing**: Vitest configured

## Architecture Documentation Approach

We use [Structurizr](https://structurizr.com/) with the [C4 model](https://c4model.com/) to document our architecture. This approach provides multiple levels of abstraction:

1. **System Context**: Shows Buildappswith and its relationships with users and external systems
2. **Containers**: Zooms into Buildappswith to show the high-level technical building blocks
3. **Components**: Details the components inside each container
4. **Code**: Links to actual implementation (via source code)

### Using Structurizr

We've implemented Structurizr Lite as a Docker container for local development. To view and edit the architecture:

1. Navigate to the `/docs/architecture/structurizr` directory
2. Run `docker-compose up`
3. Open `http://localhost:8080` in your browser

The architecture is defined using the Structurizr DSL in the `workspace.dsl` file. This file and all related documentation are version-controlled alongside the codebase.

### Architecture Decision Records (ADRs)

We document significant architectural decisions using Architecture Decision Records (ADRs) stored in `/docs/architecture/decisions`. These provide context, rationale, and consequences for important architectural choices.

## Current Architecture

### System Context

The System Context diagram shows the Buildappswith platform in its environment, including:

- **Users**: Clients, Learners, Builders, and Administrators
- **External Systems**: Third-party AI tools, email systems
- **Key Relationships**: How users interact with Buildappswith and how Buildappswith interacts with external systems

### Container Architecture

The Container diagram shows the high-level technical building blocks of Buildappswith:

- **Single Page Application**: The frontend application (Next.js)
- **API Application**: Server-side application logic (Next.js API routes)
- **Database**: Persistence layer (PostgreSQL)
- **External Services**: Authentication, payment processing, content delivery

### Current Focus Areas

1. **Folder Structure Standardization**: Implementing domain-first organization pattern
2. **Code Structure Optimization**: Improving modularity and maintainability
3. **Testing Implementation**: Enhancing test coverage

## Maintaining Architecture Documentation

To keep architecture documentation current:

1. Update the `workspace.dsl` file when making significant architectural changes
2. Create ADRs for important architectural decisions
3. Regularly review and refine the architecture model

## Future Plans

1. **Storybook Integration**: Implementing Storybook for UI component documentation
2. **CI/CD Integration**: Automating architecture diagram generation in the CI/CD pipeline
3. **Component-Level Documentation**: Adding more detailed component diagrams

## Code Organization

### Folder Structure

The Buildappswith codebase follows a domain-first organization pattern. See the [Folder Structure Guide](/docs/engineering/FOLDER_STRUCTURE_GUIDE.md) for detailed patterns.

```
/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Auth-related pages
│   ├── (marketing)/         # Marketing pages
│   ├── (platform)/          # Platform pages
│   ├── api/                 # API routes
│   └── ...                  # Other app directories
├── components/              # Shared components
│   ├── [domain]/            # Domain-specific components
│   ├── ui/                  # UI components
│   ├── providers/           # Context providers
│   └── ...                  # Other global components
├── hooks/                   # Custom React hooks
├── lib/                     # Non-React code
│   ├── [domain]/            # Domain business logic
│   ├── utils/               # Shared utilities
│   └── ...                  # Other non-React code
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # Global TypeScript types
```

### Component Organization

Components are organized following a hierarchy:

- **Core UI**: Foundational UI components (buttons, inputs, etc.)
- **Composite UI**: Combinations of core components for reuse
- **Domain UI**: Specialized components for specific domains

See the [Components README](/components/README.md) for detailed patterns.

## References

- [C4 Model](https://c4model.com/)
- [Structurizr](https://structurizr.com/)
- [Architecture Decision Records](https://adr.github.io/)
