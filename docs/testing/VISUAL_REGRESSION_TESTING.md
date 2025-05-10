# Visual Regression Testing

This document outlines the implementation of visual regression testing for the BuildAppsWith platform using Playwright's built-in visual comparison capabilities.

## Overview

Visual regression testing ensures that UI changes do not unintentionally impact the appearance of the application. This testing approach complements functional testing by capturing visual issues that might not be detected by traditional tests.

## Implementation Approach

We've implemented visual regression testing using Playwright's native `toHaveScreenshot()` functionality, which:

1. Captures screenshots of key pages across different browsers and devices
2. Compares new screenshots against stored baselines
3. Highlights visual differences between versions
4. Allows for intentional updates to baselines when UI changes are expected

## Directory Structure

```
buildappswith/
├── __tests__/
│   ├── e2e/
│   │   ├── visual/
│   │   │   ├── visual-regression.test.ts             # Visual test definitions
│   │   │   └── visual-regression.test.ts-snapshots/  # Baseline screenshots
│   │   │       ├── homepage-chromium-darwin.png
│   │   │       ├── homepage-firefox-darwin.png
│   │   │       ├── homepage-webkit-darwin.png
│   │   │       ├── homepage-mobile-chrome-darwin.png
│   │   │       ├── homepage-mobile-safari-darwin.png
│   │   │       ├── marketplace-chromium-darwin.png
│   │   │       └── ... (other snapshots for each page/browser combination)
├── playwright.visual.config.ts                       # Visual testing configuration
```

## Visual Test Configuration

The `playwright.visual.config.ts` file contains specialized configuration for visual testing:

```typescript
// playwright.visual.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e/visual',
  // Visual test specific settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,  // Allow small differences (e.g., for animations)
      threshold: 0.2,      // 20% threshold for pixel comparison
    }
  },
  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

## Pages Under Visual Testing

The current implementation tests the following key pages:

1. **Homepage**: The main landing page of the application
2. **Marketplace**: The builder discovery page
3. **Login Page**: The authentication entry point
4. **Signup Page**: The registration entry point

Each page is tested across multiple browsers and device sizes to ensure consistent appearance.

## Running Visual Tests

To run the visual regression tests:

```bash
# Run all visual tests
pnpm exec playwright test --config=playwright.visual.config.ts

# Run tests for specific files
pnpm exec playwright test --config=playwright.visual.config.ts visual-regression.test.ts
```

## Updating Visual Baselines

When intentional UI changes are made, the baseline screenshots need to be updated:

```bash
# Update all baselines
pnpm exec playwright test --config=playwright.visual.config.ts --update-snapshots

# Update specific test baselines
pnpm exec playwright test --config=playwright.visual.config.ts visual-regression.test.ts --update-snapshots
```

## Best Practices

1. **Review Visual Differences Carefully**: When tests fail, review the visual differences to determine if they represent bugs or intentional changes.

2. **Update Baselines Intentionally**: Only update baselines when UI changes are expected and approved.

3. **Test Responsiveness**: Run tests across multiple browser sizes to catch responsive design issues.

4. **Exclude Dynamic Content**: Configure tests to ignore or mask dynamic content that changes between runs.

5. **Version Control Baselines**: Commit baseline screenshots to version control to track UI evolution.

6. **Test Key User Flows**: Focus visual testing on critical pages and user interactions.

## CI Integration

Visual regression tests should be integrated into CI workflows:

```yaml
# Example GitHub Actions step
- name: Run visual tests
  run: pnpm exec playwright test --config=playwright.visual.config.ts

# Artifact storage for failed tests
- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-visual-test-results
    path: test-results/
```

## Chromatic Integration

For more advanced visual testing, Chromatic integration was explored to provide:

1. Visual review workflow with approval process
2. Component-level visual testing
3. Cross-team visual collaboration
4. Historical visual inventory

While we've implemented native Playwright visual testing as a foundation, future integration with Chromatic remains an option for more comprehensive visual testing capabilities.

## Next Steps

1. **Expand Coverage**: Add visual tests for additional key pages and components
2. **Dynamic Content Handling**: Implement strategies for handling dynamic content in visual tests
3. **Responsive Testing Matrix**: Create a comprehensive testing matrix for responsive breakpoints
4. **Visual Test Reporting**: Enhance reporting of visual differences
5. **Component-Level Testing**: Consider adding visual tests for individual components