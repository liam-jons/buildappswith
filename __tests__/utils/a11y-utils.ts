import { axe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

// Extend expect with axe
expect.extend(toHaveNoViolations);

/**
 * Test for accessibility violations using jest-axe
 * 
 * @param ui The React component to test
 * @param options Optional axe configuration options
 * @returns Promise with axe results
 */
export async function checkA11y(
  ui: ReactElement | HTMLElement | RenderResult,
  options?: axe.RunOptions
): Promise<axe.AxeResults> {
  let container: HTMLElement;
  
  // Handle different input types
  if ('container' in ui && ui.container instanceof HTMLElement) {
    // RenderResult from testing-library
    container = ui.container;
  } else if (ui instanceof HTMLElement) {
    // Direct HTML element
    container = ui;
  } else {
    // React element that needs to be rendered
    const { container: renderedContainer } = render(ui);
    container = renderedContainer;
  }
  
  // Run axe on the container
  const results = await axe(container, options);
  
  // Test for violations and return results
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Verify component meets WCAG 2.1 standards
 * 
 * @param ui The React component to test
 * @param level The WCAG conformance level to test (A, AA, AAA)
 */
export async function checkWCAG(
  ui: ReactElement | HTMLElement | RenderResult,
  level: 'A' | 'AA' | 'AAA' = 'AA'
): Promise<void> {
  // Configure axe options based on WCAG level
  const options: axe.RunOptions = {
    rules: {
      // WCAG 2.1 A level rules
      'color-contrast': { enabled: true },
      'frame-title': { enabled: true },
      'image-alt': { enabled: true },
      'input-image-alt': { enabled: true },
      'link-name': { enabled: true },
      'region': { enabled: true },
      
      // Additional AA level rules
      ...(level === 'AA' || level === 'AAA' ? {
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-required-children': { enabled: true },
        'aria-required-parent': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
      } : {}),
      
      // Additional AAA level rules
      ...(level === 'AAA' ? {
        'landmark-one-main': { enabled: true },
        'landmark-complementary-is-top-level': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'scrollable-region-focusable': { enabled: true },
      } : {})
    }
  };
  
  // Run the accessibility check with specific WCAG level config
  await checkA11y(ui, options);
}

// Common a11y test helpers
export const a11yTests = {
  // Test keyboard navigation
  keyboard: async (ui: ReactElement, selectors: string[]) => {
    const { container } = render(ui);
    
    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    // Check that we have at least the expected number of focusable elements
    expect(focusableElements.length).toBeGreaterThanOrEqual(selectors.length);
    
    // Verify each specified selector has a focusable element
    for (const selector of selectors) {
      const element = container.querySelector(selector);
      expect(element).not.toBeNull();
      
      // Check if it's focusable or has a focusable child
      const isFocusable = 
        element?.matches('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ||
        element?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') !== null;
      
      expect(isFocusable).toBe(true);
    }
  },
  
  // Test for proper heading structure
  headings: (ui: ReactElement) => {
    const { container } = render(ui);
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    // Get heading levels
    const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
    
    // Check if heading levels are in proper order (no skipping levels)
    for (let i = 0; i < headingLevels.length - 1; i++) {
      const current = headingLevels[i];
      const next = headingLevels[i + 1];
      
      // Next heading level should not be more than one level deeper
      expect(next - current).toBeLessThanOrEqual(1);
    }
  },
  
  // Test for proper aria-labels on interactive elements
  ariaLabels: (ui: ReactElement) => {
    const { container } = render(ui);
    
    // Check buttons
    const buttons = container.querySelectorAll('button:not([aria-hidden="true"])');
    buttons.forEach(button => {
      expect(
        button.hasAttribute('aria-label') || 
        button.textContent?.trim().length > 0 ||
        button.querySelector('[aria-label]') !== null
      ).toBe(true);
    });
    
    // Check inputs
    const inputs = container.querySelectorAll('input:not([type="hidden"]):not([aria-hidden="true"])');
    inputs.forEach(input => {
      const inputEl = input as HTMLInputElement;
      const id = inputEl.id;
      
      expect(
        inputEl.hasAttribute('aria-label') || 
        (id && container.querySelector(`label[for="${id}"]`) !== null) ||
        inputEl.closest('label') !== null
      ).toBe(true);
    });
  }
};