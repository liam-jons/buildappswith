# Marketplace Module

## Overview

This directory contains components and services related to the marketplace functionality of the buildappswith platform, following our domain-based architecture pattern. The marketplace is a key feature that allows users to discover builders and their services.

## ⚠️ Important Architecture Rules ⚠️

**CRITICAL: To prevent code duplication and architectural issues:**

1. **ALWAYS check if a component already exists before creating a new one**
2. **NEVER create components directly in the root `/components/marketplace/` directory**
3. **ALWAYS follow the domain-based architecture pattern outlined below**
4. **When in doubt, check the [COMPONENT_STYLE_GUIDE.md](/docs/engineering/COMPONENT_STYLE_GUIDE.md) and [FOLDER_STRUCTURE_GUIDE.md](/docs/engineering/FOLDER_STRUCTURE_GUIDE.md)**

## Official Directory Structure

```
marketplace/
├── components/               # Component implementations
│   ├── [component-name]/     # Each component gets its own directory
│   │   ├── [component-name].tsx   # Main component implementation
│   │   ├── index.ts               # Barrel exports
│   │   └── [other support files]  # Tests, types, helpers
│   ├── index.ts              # Barrel exports for all components
│   └── types.ts              # Component-specific types
├── hooks/                    # Custom React hooks
│   ├── use-[hook-name].ts    # Individual hook files
│   └── index.ts              # Barrel exports for hooks
├── utils/                    # Utility functions
│   ├── [util-name].ts        # Individual utility files 
│   └── index.ts              # Barrel exports for utils
└── index.ts                  # Main barrel exports for marketplace module
```

## Component Structure Pattern

Each component MUST follow this structure:

```
components/
└── [component-name]/            # e.g., builder-card/
    ├── [component-name].tsx     # e.g., builder-card.tsx
    ├── index.ts                 # Exports the component
    └── [optional other files]   # Tests, types, variants
```

## Importing Components

**ALWAYS** import components using the barrel exports:

```typescript
// ✅ CORRECT - Use barrel exports
import { BuilderCard, BuilderImage } from "@/components/marketplace";

// ❌ WRONG - Don't import directly from component files
import BuilderCard from "@/components/marketplace/builder-card";
// ❌ WRONG - Don't use relative imports in most cases
import { BuilderCard } from "../builder-card";
```

## Human + AI Development Guidelines

To avoid duplication when working with AI assistants:

1. **The AI assistant MUST ALWAYS review the existing folder structure** before creating new components
2. **Review documentation** such as COMPONENT_STYLE_GUIDE.md before making changes
3. **ALWAYS check for existing implementations** before creating similar components
5. **Be explicit about file paths** rather than using relative references

See [CLAUDE.MD](/CLAUDE.MD) for more guidance.

## Domain Integration

The marketplace module integrates with these other domains:

- **Profile** for builder information
- **Scheduling** for session availability
- **Trust** for validation tiers and verification
- **Payment** for pricing and transactions

## Documentation

- Detailed architecture: [MARKETPLACE_CONSOLIDATED_ARCHITECTURE.md](/docs/engineering/MARKETPLACE_CONSOLIDATED_ARCHITECTURE.md)
- Component usage examples: [Mintlify Documentation](https://mintlify.com/docs/components/example-markdown)
- Guidelines: [COMPONENT_STYLE_GUIDE.md](/docs/engineering/COMPONENT_STYLE_GUIDE.md)

## Styling

Marketplace components use Tailwind CSS with the following guidelines:

- Use the `cn()` utility for conditional classes
- Follow responsive design patterns for all screen sizes
- Use the shadcn/ui component system when applicable
- Maintain accessibility compliance for all interactive elements