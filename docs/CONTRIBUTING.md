# Contributing to Buildappswith

Thank you for your interest in contributing to Buildappswith! We're excited to collaborate with you on democratizing AI application development.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the issue tracker to see if the bug has already been reported
2. Update your code to the latest version to verify the issue persists
3. Collect as much information as possible about the bug

When submitting a bug report, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! When suggesting an enhancement:

1. Use a clear, descriptive title
2. Provide a detailed description of the suggested enhancement
3. Explain why this enhancement would be useful
4. Include any relevant examples or mockups

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure they pass
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Guidelines

### Setting Up the Development Environment

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

### Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **Component Organization**: Group related components in appropriate directories
- **File Naming**:
  - React components: PascalCase (e.g., `ButtonComponent.tsx`)
  - Utility functions: camelCase (e.g., `formatDate.ts`)
  - Constants: UPPER_CASE (e.g., `API_ENDPOINTS.ts`)
- **CSS**: Use Tailwind CSS utility classes
- **Accessibility**: Ensure all components are accessible (WCAG 2.1 AA compliance)

### Component Structure

```tsx
// ComponentName.tsx
"use client"  // Only if needed

import { useState } from "react"
import { cn } from "@/lib/utils"

// Define props interface
interface ComponentNameProps {
  className?: string
  children: React.ReactNode
  // Other props...
}

export function ComponentName({
  className,
  children,
  // Destructure other props...
}: ComponentNameProps) {
  // Component logic...
  
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  )
}
```

### Accessibility Guidelines

- Use semantic HTML elements
- Include proper ARIA attributes when needed
- Ensure keyboard navigation works
- Support screen readers
- Respect reduced motion preferences
- Provide sufficient color contrast
- Test with accessibility tools

### Testing

- Write unit tests for utility functions
- Write component tests for UI components
- Ensure all tests pass before submitting a pull request

### Documentation

- Add JSDoc comments to functions and components
- Update relevant documentation when making changes
- Add to the decision log when making architectural decisions

## Review Process

1. All pull requests require at least one review
2. Automated tests must pass
3. Code must adhere to project standards
4. Documentation must be updated as needed

## License

By contributing to Buildappswith, you agree that your contributions will be licensed under the project's MIT license.
