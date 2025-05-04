# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test/Lint Commands
- Build: `pnpm build` (generates Prisma client and builds Next.js)
- Dev: `pnpm dev` (starts development server)
- Lint: `pnpm lint` (runs ESLint)
- Type check: `pnpm type-check` (runs TypeScript type checking)
- Test (all): `pnpm test` (runs Vitest tests)
- Test (single file): `pnpm test path/to/test.test.tsx` (runs specific test file)
- Test (specific pattern): `pnpm test -t "pattern"` (runs tests matching pattern)
- Test coverage: `pnpm test:coverage` (generates test coverage report)

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

Always refer to `/docs/engineering/COMPONENT_STYLE_GUIDE.md` and `/docs/engineering/FOLDER_STRUCTURE_GUIDE.md` for detailed guidelines.