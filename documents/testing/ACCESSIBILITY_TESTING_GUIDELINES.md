# Accessibility Testing Guidelines

**Version:** 1.0.0
**Date:** May 10, 2025
**Status:** Approved
**Key Stakeholders:** Engineering Team, UX Design, QA

## Overview

This document outlines the accessibility testing approach for the BuildAppsWith platform. It provides guidelines, tools, and best practices to ensure all components meet WCAG 2.1 AA standards for accessibility.

## Key Concepts

- **WCAG Compliance**: Web Content Accessibility Guidelines 2.1 AA standards
- **Automated Testing**: Tools and utilities for automated accessibility checks
- **Manual Testing**: Procedures for manual accessibility verification
- **Assistive Technology**: Testing with screen readers and other assistive tools
- **Keyboard Navigation**: Ensuring all interactions work without a mouse

## Accessibility Testing Framework

Our accessibility testing framework consists of:

1. **Automated Testing Tools**
   - jest-axe for component accessibility testing
   - Lighthouse for page-level accessibility audits
   - ESLint-a11y for static code analysis

2. **Manual Testing Procedures**
   - Keyboard navigation verification
   - Screen reader compatibility testing
   - Color contrast verification
   - Focus management verification

3. **Integration into Development Workflow**
   - Required a11y tests for all components
   - Accessibility checks in CI/CD pipeline
   - Accessibility audits in PR reviews

## Automated Testing Implementation

### Component-Level Testing with jest-axe

All UI components should include accessibility tests using jest-axe:

```typescript
// __tests__/components/ui/button.a11y.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'
import { Button } from '@/components/ui/button'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click Me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Using Accessibility Testing Utilities

Use the provided accessibility testing utilities for consistent testing:

```typescript
// Example using test utilities
import { testAccessibility } from '@/__tests__/utils/a11y-utils'
import { Form } from '@/components/ui/form'

describe('Form Accessibility', () => {
  it('meets accessibility standards', async () => {
    await testAccessibility(
      <Form>
        <FormField>
          <FormLabel htmlFor="name">Name</FormLabel>
          <FormInput id="name" name="name" />
        </FormField>
        <Button type="submit">Submit</Button>
      </Form>,
      {
        // Optional: Specify WCAG level to test against
        wcag: ['wcag2aa'],
        // Optional: Configure specific rules
        rules: {
          'color-contrast': { enabled: true }
        }
      }
    )
  })
})
```

### Page-Level Testing in E2E Tests

Include accessibility checks in E2E tests:

```typescript
// __tests__/e2e/marketplace/browse-experience.test.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('marketplace page meets accessibility standards', async ({ page }) => {
  await page.goto('/marketplace')
  
  // Wait for content to load
  await page.waitForSelector('[data-testid="builder-list"]')
  
  // Run accessibility tests
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  
  // Check for violations
  expect(accessibilityScanResults.violations).toEqual([])
})
```

## Manual Testing Procedures

### Keyboard Navigation Testing

Ensure all interactive elements can be accessed and operated using keyboard alone:

1. **Tab Order**: Verify logical tab order through interactive elements
2. **Focus Indicators**: Check for visible focus styles on interactive elements
3. **Keyboard Shortcuts**: Test any keyboard shortcuts for conflicts
4. **Form Navigation**: Verify form fields can be navigated and submitted with keyboard

**Test Procedure Documentation:**
```
1. Start from the top of the page
2. Press Tab repeatedly to navigate through all interactive elements
3. Verify each element receives visible focus
4. Test operation using Space, Enter, and arrow keys as appropriate
5. Complete the entire user journey using keyboard only
```

### Screen Reader Testing

Test compatibility with screen readers:

1. **Text Alternatives**: All meaningful images have text alternatives
2. **Form Labels**: All form controls have appropriate labels
3. **Headings**: Proper heading structure and hierarchy
4. **Landmarks**: Appropriate ARIA landmarks
5. **Dynamic Content**: Announcements for dynamic content changes

**Supported Screen Readers:**
- NVDA with Firefox (Windows)
- VoiceOver with Safari (macOS)
- TalkBack with Chrome (Android)

### Color and Contrast Testing

Test visual presentation for accessibility:

1. **Color Contrast**: Verify text meets contrast ratios (4.5:1 for normal text, 3:1 for large text)
2. **Color Independence**: Ensure information is not conveyed by color alone
3. **Focus Visibility**: Check that focus indicators have sufficient contrast
4. **Text Resizing**: Verify content is readable when zoomed to 200%

## Accessibility Testing Checklist

Use this checklist when implementing and reviewing components:

### Semantic Structure

- [ ] Proper heading structure (h1-h6)
- [ ] Semantic HTML elements (nav, main, article, etc.)
- [ ] ARIA landmarks where appropriate
- [ ] Lists marked up as list elements

### Keyboard Accessibility

- [ ] All interactive elements are keyboard accessible
- [ ] Logical tab order
- [ ] Visible focus indicators
- [ ] No keyboard traps
- [ ] Custom components have appropriate keyboard interaction

### Forms and Inputs

- [ ] All inputs have associated labels
- [ ] Required fields are indicated
- [ ] Error messages are associated with inputs
- [ ] Form validation errors are announced

### Images and Media

- [ ] Images have appropriate alt text
- [ ] Decorative images have empty alt attributes
- [ ] Videos have captions
- [ ] Audio content has transcripts

### Color and Contrast

- [ ] Text meets contrast requirements
- [ ] Information not conveyed by color alone
- [ ] UI components have sufficient contrast
- [ ] Focus indicators are visible

### Dynamic Content

- [ ] Status updates announced to screen readers
- [ ] Modals and dialogs trap focus appropriately
- [ ] Live regions used for important updates
- [ ] Loading states are accessible

## Component-Specific Guidelines

### Buttons and Interactive Elements

```tsx
// Accessible button examples
<Button aria-label="Close dialog">×</Button>

<Button disabled aria-disabled="true">Cannot proceed</Button>

<Button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Custom action
</Button>
```

### Forms and Inputs

```tsx
// Accessible form examples
<FormField>
  <FormLabel htmlFor="email">Email address</FormLabel>
  <FormInput 
    id="email" 
    name="email" 
    type="email" 
    aria-required="true"
    aria-describedby="email-hint email-error"
  />
  <FormHint id="email-hint">We'll never share your email</FormHint>
  {error && <FormError id="email-error">{error}</FormError>}
</FormField>
```

### Modals and Dialogs

```tsx
// Accessible modal example
<Dialog
  open={isOpen}
  onClose={handleClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">Confirmation</DialogTitle>
  <DialogContent>
    <p id="dialog-description">Are you sure you want to proceed?</p>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </DialogActions>
</Dialog>
```

## Testing Tools Reference

| Tool | Purpose | Usage |
|------|---------|-------|
| jest-axe | Component-level a11y testing | Used in component tests |
| Lighthouse | Page-level a11y audits | Used in E2E tests and manual checks |
| ESLint-a11y | Static code analysis | Integrated in linting process |
| NVDA | Screen reader for Windows | Manual testing |
| VoiceOver | Screen reader for macOS | Manual testing |
| Contrast Checker | Color contrast verification | Design review and manual testing |
| axe DevTools | Browser extension for a11y testing | Development and debugging |

## Accessibility Violations Severity Levels

| Level | Description | Examples | Action |
|-------|-------------|----------|--------|
| Critical | Makes content completely inaccessible | Missing alt text on functional images, keyboard traps | Must be fixed before merge |
| Serious | Significantly impacts accessibility | Low contrast text, missing form labels | Must be fixed before merge |
| Moderate | Creates barriers for some users | Improper heading structure, duplicate IDs | Should be fixed before merge |
| Minor | Affects small number of users | Redundant alt text, small UI issues | Fix when time permits |

## Implementation Process

1. **Development Phase**
   - Run ESLint with a11y rules enabled
   - Include jest-axe tests for all components
   - Follow accessibility checklist

2. **PR Review Phase**
   - Review a11y test results
   - Check for a11y testing coverage
   - Verify no critical or serious issues

3. **QA Phase**
   - Run automated a11y audits
   - Perform manual a11y testing
   - Test with assistive technologies

4. **Production Monitoring**
   - Regular automated a11y scans
   - User feedback monitoring
   - Periodic expert review

## Related Documents

- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md) - Master testing document
- [Testing Implementation Summary](./TESTING_IMPLEMENTATION_SUMMARY.md) - Current implementation status
- [Visual Regression Testing](./VISUAL_REGRESSION_TESTING.md) - Visual testing approach
- [Component-Level Test Guidelines](./TEST_PATTERN_LIBRARIES.md) - Component testing patterns

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | May 10, 2025 | Initial accessibility guidelines | BuildAppsWith Team |