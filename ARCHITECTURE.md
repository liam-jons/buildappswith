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
- **Authentication**: Clerk (migration from NextAuth.js completed)
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
2. Run `docker-compose up` (created automatically by our extraction scripts)
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

### Authentication Architecture

The authentication system uses Clerk for user management, authentication, and authorization. Key components include:

- **Clerk Provider**: Global authentication state provider
- **Middleware**: Route protection and authorization enforcement
- **Webhook Handlers**: Process authentication events
- **Database Synchronization**: Keeps user data in sync with Clerk

### Current Focus Areas

1. **Architecture Extraction Automation**: Reliable documentation of actual codebase structure
2. **Code Structure Optimization**: Improving modularity and maintainability
3. **Testing Implementation**: Enhancing test coverage

## Maintaining Architecture Documentation

To keep architecture documentation current:

1. Update the `workspace.dsl` file when making significant architectural changes
2. Create ADRs for important architectural decisions
3. Regularly review and refine the architecture model
4. Run the architecture extraction scripts to ensure documentation matches implementation

## Automatic Architecture Extraction

We use automatic architecture extraction to keep our architecture documentation up-to-date with the actual codebase. This helps identify technical debt, legacy components, and ensures that our documentation reflects the system as built, not as planned.

### How to Use Architecture Extraction

Run the following npm scripts to extract and visualize the architecture:

```bash
# Install necessary dependencies
npm run arch:install

# Run general architecture extraction
npm run arch:extract

# Run authentication-specific architecture extraction
npm run arch:extract:auth

# Run both general and authentication extraction
npm run arch:extract:all

# Generate comprehensive architecture report
npm run arch:report
```

The extraction process:

1. Analyzes TypeScript/Next.js codebase to identify components and relationships
2. Detects technical debt and legacy code based on predefined patterns
3. Creates specialized views for authentication components
4. Updates Structurizr workspace with extracted components
5. Generates comprehensive reports and visualizations

### Architecture Reports and Visualizations

Extraction results are saved in the `/docs/architecture/extraction` directory and include:

- **JSON Model**: Complete data about components and relationships
- **Mermaid Diagrams**: Visual representations of architecture and dependencies
- **HTML/Markdown Reports**: User-friendly documentation of findings
- **Authentication Flow Documentation**: Detailed descriptions of authentication processes
- **Technical Debt Analysis**: Identification of areas needing attention

### Viewing Extracted Architecture

There are several ways to view the extracted architecture:

1. **Structurizr Lite**: Visual C4 model diagrams
2. **HTML Reports**: Browser-viewable documentation
3. **Mermaid Diagrams**: Visual graphs viewable in any Mermaid-compatible tool
4. **Markdown Documentation**: Text-based descriptions for version control

## Future Plans

1. **Automated Integration**: Adding architecture extraction to CI/CD pipeline
2. **Architecture Metrics Dashboard**: Creating a dashboard for tracking architecture quality metrics
3. **Dependency Evolution Tracking**: Monitoring how architecture changes over time
4. **Storybook Integration**: Implementing Storybook for UI component documentation

## References

- [C4 Model](https://c4model.com/)
- [Structurizr](https://structurizr.com/)
- [Architecture Decision Records](https://adr.github.io/)
- [Mermaid Diagramming](https://mermaid.js.org/)
