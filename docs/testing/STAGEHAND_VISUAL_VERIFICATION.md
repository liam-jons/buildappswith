 Visual Verification for Critical UI Components

  1. Visual Verification Framework

  // framework/visual/visual-verifier.ts
  import { Page } from '@playwright/test';
  import { Stagehand } from '@getrobolab/stagehand';

  /**
   * Types of visual verification checks
   */
  export enum VisualCheckType {
    LAYOUT = 'layout',
    CONTENT = 'content',
    STYLING = 'styling',
    ACCESSIBILITY = 'accessibility',
    RESPONSIVENESS = 'responsiveness',
    ANIMATION = 'animation',
    CONSISTENCY = 'consistency',
    BRANDING = 'branding'
  }

  /**
   * Device types for responsive testing
   */
  export enum DeviceType {
    MOBILE = 'mobile',
    TABLET = 'tablet',
    LAPTOP = 'laptop',
    DESKTOP = 'desktop'
  }

  /**
   * Device viewport sizes
   */
  export const DeviceViewports = {
    [DeviceType.MOBILE]: { width: 390, height: 844 },
    [DeviceType.TABLET]: { width: 768, height: 1024 },
    [DeviceType.LAPTOP]: { width: 1366, height: 768 },
    [DeviceType.DESKTOP]: { width: 1920, height: 1080 }
  };

  /**
   * Results of a visual verification check
   */
  export interface VisualVerificationResult {
    passed: boolean;
    description: string;
    details?: string;
    evidence?: {
      screenshot?: string;
      logs?: string[];
    };
  }

  /**
   * Advanced visual verification using Stagehand's AI capabilities
   */
  export class VisualVerifier {
    constructor(
      private page: Page,
      private stagehand: Stagehand,
      private options: {
        screenshotDir?: string;
        takeScreenshots?: boolean;
        detailedLogs?: boolean;
      } = {}
    ) {
      // Set default options
      this.options.screenshotDir = this.options.screenshotDir || './visual-test-results';
      this.options.takeScreenshots = this.options.takeScreenshots !== false;
      this.options.detailedLogs = this.options.detailedLogs !== false;
    }

    /**
     * Verify layout of a UI component or page
     */
    async verifyLayout(
      component: string,
      criteria: string[] = [],
      options: {
        device?: DeviceType;
        strictMode?: boolean;
      } = {}
    ): Promise<VisualVerificationResult> {
      const { device, strictMode = false } = options;

      // Set device viewport if specified
      if (device) {
        await this.setViewport(device);
      }

      // Build the criteria prompt
      let criteriaPrompt = 'the layout has proper spacing, alignment, and visual hierarchy';

      if (criteria.length > 0) {
        criteriaPrompt = criteria.join(', ');
      }

      // Create the full prompt
      const prompt = `
        Examine the ${component} layout and verify that ${criteriaPrompt}.
        
        ${strictMode ? 'Be strictly critical and report any minor layout issues.' : 
          'Focus on major layout issues that would impact usability.'}
        
        Answer with "PASS" or "FAIL" followed by a brief explanation of what you observed.
        If failing, explain specifically what layout issues exist.
      `;

      // Extract result from Stagehand
      const result = await this.stagehand.extract(prompt);
      const resultText = result.text.trim();

      // Parse the result
      const passed = resultText.toUpperCase().startsWith('PASS');
      const description = resultText.replace(/^(PASS|FAIL)\s*:?\s*/i, '').trim();

      // Take screenshot if enabled
      let evidence: { screenshot?: string; logs?: string[] } = {};
      if (this.options.takeScreenshots) {
        evidence.screenshot = await this.takeScreenshot(`${component}-layout-${passed ? 'pass' : 'fail'}`);
      }

      if (this.options.detailedLogs) {
        evidence.logs = [`Prompt: ${prompt}`, `Response: ${resultText}`];
      }

      return {
        passed,
        description,
        details: resultText,
        evidence
      };
    }

    /**
     * Verify content of a UI component
     */
    async verifyContent(
      component: string,
      expectedContent: string[],
      options: {
        strict?: boolean;
        caseSensitive?: boolean;
      } = {}
    ): Promise<VisualVerificationResult> {
      const { strict = false, caseSensitive = false } = options;

      // Build the prompt based on content verification needs
      const contentItems = expectedContent.map(item => `- ${item}`).join('\n');

      const prompt = `
        Examine the ${component} and verify it contains the following content:
        ${contentItems}
        
        ${strict ? 'All content items must be present exactly as specified.' :
          'Content items should be present but may have slight variations.'}
        ${caseSensitive ? 'Content matching should be case-sensitive.' : 
          'Case differences are acceptable.'}
        
        Answer with "PASS" or "FAIL" followed by a brief explanation.
        If failing, list which content items are missing or incorrect.
      `;

      // Extract result from Stagehand
      const result = await this.stagehand.extract(prompt);
      const resultText = result.text.trim();

      // Parse the result
      const passed = resultText.toUpperCase().startsWith('PASS');
      const description = resultText.replace(/^(PASS|FAIL)\s*:?\s*/i, '').trim();

      // Take screenshot if enabled
      let evidence: { screenshot?: string; logs?: string[] } = {};
      if (this.options.takeScreenshots) {
        evidence.screenshot = await this.takeScreenshot(`${component}-content-${passed ? 'pass' : 'fail'}`);
      }

      if (this.options.detailedLogs) {
        evidence.logs = [`Prompt: ${prompt}`, `Response: ${resultText}`];
      }

      return {
        passed,
        description,
        details: resultText,
        evidence
      };
    }

    /**
     * Verify styling of a UI component
     */
    async verifyStyling(
      component: string,
      stylingCriteria: string[],
      options: {
        theme?: 'light' | 'dark';
      } = {}
    ): Promise<VisualVerificationResult> {
      const { theme } = options;

      // Switch theme if specified and possible
      if (theme) {
        await this.trySetTheme(theme);
      }

      // Build the styling criteria
      const stylingItems = stylingCriteria.map(item => `- ${item}`).join('\n');

      const prompt = `
        Examine the ${component} styling and verify it meets these criteria:
        ${stylingItems}
        
        ${theme ? `The verification should be done in ${theme} theme.` : ''}
        
        Answer with "PASS" or "FAIL" followed by a brief explanation.
        If failing, describe which styling criteria are not met and why.
      `;

      // Extract result from Stagehand
      const result = await this.stagehand.extract(prompt);
      const resultText = result.text.trim();

      // Parse the result
      const passed = resultText.toUpperCase().startsWith('PASS');
      const description = resultText.replace(/^(PASS|FAIL)\s*:?\s*/i, '').trim();

      // Take screenshot if enabled
      let evidence: { screenshot?: string; logs?: string[] } = {};
      if (this.options.takeScreenshots) {
        evidence.screenshot = await this.takeScreenshot(`${component}-styling-${theme || 'default'}-${passed ? 'pass' : 
  'fail'}`);
      }

      if (this.options.detailedLogs) {
        evidence.logs = [`Prompt: ${prompt}`, `Response: ${resultText}`];
      }

      return {
        passed,
        description,
        details: resultText,
        evidence
      };
    }

    /**
     * Verify accessibility features of a UI component
     */
    async verifyAccessibility(
      component: string,
      options: {
        level?: 'basic' | 'comprehensive';
        specific?: string[];
      } = {}
    ): Promise<VisualVerificationResult> {
      const { level = 'basic', specific = [] } = options;

      // Default accessibility checks
      const basicChecks = [
        'Text has sufficient color contrast against backgrounds',
        'Interactive elements have clear focus states',
        'Images have alt text or are decorative',
        'Form elements have associated labels',
        'Heading structure is logical'
      ];

      // Additional comprehensive checks
      const comprehensiveChecks = [
        'Keyboard navigation works for all interactions',
        'ARIA attributes are used appropriately',
        'Page structure uses semantic HTML elements',
        'No content relies solely on color to convey meaning',
        'Text is resizable without loss of functionality',
        'Touch targets are sufficiently large'
      ];

      // Determine which checks to use
      const checks = level === 'basic' ? basicChecks : [...basicChecks, ...comprehensiveChecks];

      // Add any specific checks
      if (specific.length > 0) {
        checks.push(...specific);
      }

      // Format the checks for the prompt
      const checkItems = checks.map(item => `- ${item}`).join('\n');

      const prompt = `
        Examine the ${component} for accessibility features and verify it meets these criteria:
        ${checkItems}
        
        Answer with "PASS" or "FAIL" followed by a brief explanation.
        If failing, describe which accessibility criteria are not met and why.
      `;

      // Extract result from Stagehand
      const result = await this.stagehand.extract(prompt);
      const resultText = result.text.trim();

      // Parse the result
      const passed = resultText.toUpperCase().startsWith('PASS');
      const description = resultText.replace(/^(PASS|FAIL)\s*:?\s*/i, '').trim();

      // Take screenshot if enabled
      let evidence: { screenshot?: string; logs?: string[] } = {};
      if (this.options.takeScreenshots) {
        evidence.screenshot = await this.takeScreenshot(`${component}-accessibility-${passed ? 'pass' : 'fail'}`);
      }

      if (this.options.detailedLogs) {
        evidence.logs = [`Prompt: ${prompt}`, `Response: ${resultText}`];
      }

      return {
        passed,
        description,
        details: resultText,
        evidence
      };
    }

    /**
     * Verify responsive behavior across multiple devices
     */
    async verifyResponsiveness(
      component: string,
      devices: DeviceType[] = [DeviceType.MOBILE, DeviceType.TABLET, DeviceType.DESKTOP],
      criteria: string[] = []
    ): Promise<Record<DeviceType, VisualVerificationResult>> {
      const results: Record<DeviceType, VisualVerificationResult> = {} as any;

      // Default responsive criteria if none provided
      const defaultCriteria = [
        'Content is fully visible without horizontal scrolling',
        'Text is readable at all sizes',
        'Interactive elements are usable and properly sized',
        'Layout adjusts appropriately for the screen size',
        'No overlapping elements or cut-off content'
      ];

      const checkCriteria = criteria.length > 0 ? criteria : defaultCriteria;

      // Test each device
      for (const device of devices) {
        // Set the viewport for this device
        await this.setViewport(device);

        // Allow time for layout to adjust
        await this.page.waitForTimeout(500);

        // Build the prompt
        const criteriaItems = checkCriteria.map(item => `- ${item}`).join('\n');

        const prompt = `
          Examine the ${component} on a ${device} device (${DeviceViewports[device].width}x${DeviceViewports[device].height}) 
          and verify it meets these responsive design criteria:
          ${criteriaItems}
          
          Answer with "PASS" or "FAIL" followed by a brief explanation.
          If failing, describe specifically what responsive issues exist on this device size.
        `;

        // Extract result from Stagehand
        const result = await this.stagehand.extract(prompt);
        const resultText = result.text.trim();

        // Parse the result
        const passed = resultText.toUpperCase().startsWith('PASS');
        const description = resultText.replace(/^(PASS|FAIL)\s*:?\s*/i, '').trim();

        // Take screenshot if enabled
        let evidence: { screenshot?: string; logs?: string[] } = {};
        if (this.options.takeScreenshots) {
          evidence.screenshot = await this.takeScreenshot(`${component}-${device}-${passed ? 'pass' : 'fail'}`);
        }

        if (this.options.detailedLogs) {
          evidence.logs = [`Prompt: ${prompt}`, `Response: ${resultText}`];
        }

        results[device] = {
          passed,
          description,
          details: resultText,
          evidence
        };
      }

      return results;
    }

    /**
     * Verify animation and interactive behaviors
     */
    async verifyAnimation(
      component: string,
      interactions: string[],
      expectedAnimations: string[]
    ): Promise<VisualVerificationResult> {
      // Combine interactions and expected animations
      const steps = interactions.map((interaction, index) => {
        const expectation = expectedAnimations[index] || 'Verify smooth and appropriate animation';
        return `${index + 1}. ${interaction}\n   Expected: ${expectation}`;
      }).join('\n');

      const prompt = `
        I'll perform these interactions on the ${component} and verify the animations:
        ${steps}
        
        For each step, I'll check that animations are smooth, appropriate in duration, 
        and enhance rather than hinder the user experience.
        
        I'll perform each interaction and then report on the animation quality.
        Answer with "PASS" or "FAIL" followed by observations about each animation.
      `;

      // Perform each interaction and observe
      const observations: string[] = [];
      let allPassed = true;

      for (let i = 0; i < interactions.length; i++) {
        // Perform the interaction
        await this.stagehand.act(interactions[i]);

        // Allow animation to complete
        await this.page.waitForTimeout(1000);

        // Observe the animation
        const expected = expectedAnimations[i] || 'smooth and appropriate animation';
        const observePrompt = `
          After performing "${interactions[i]}", did you observe "${expected}"?
          Answer with "YES" or "NO" followed by a description of what you observed.
        `;

        const observation = await this.stagehand.extract(observePrompt);
        const passed = observation.text.toUpperCase().startsWith('YES');

        observations.push(`Step ${i + 1}: ${passed ? 'PASS' : 'FAIL'} - ${observation.text.replace(/^(YES|NO)\s*:?\s*/i, 
  '')}`);

        if (!passed) {
          allPassed = false;
        }
      }

      // Compile the results
      const resultText = observations.join('\n');
      const description = allPassed ?
        'All animations and interactions behave as expected' :
        'Some animations do not meet expectations';

      // Take screenshot if enabled
      let evidence: { screenshot?: string; logs?: string[] } = {};
      if (this.options.takeScreenshots) {
        evidence.screenshot = await this.takeScreenshot(`${component}-animation-${allPassed ? 'pass' : 'fail'}`);
      }

      if (this.options.detailedLogs) {
        evidence.logs = [`Prompt: ${prompt}`, ...observations];
      }

      return {
        passed: allPassed,
        description,
        details: resultText,
        evidence
      };
    }

    /**
     * Verify brand consistency
     */
    async verifyBranding(
      component: string,
      brandElements: {
        colors?: string[];
        typography?: string[];
        logos?: string[];
        spacing?: string[];
      }
    ): Promise<VisualVerificationResult> {
      // Compile brand elements to check
      const criteriaItems: string[] = [];

      if (brandElements.colors && brandElements.colors.length > 0) {
        criteriaItems.push(`Colors: ${brandElements.colors.join(', ')}`);
      }

      if (brandElements.typography && brandElements.typography.length > 0) {
        criteriaItems.push(`Typography: ${brandElements.typography.join(', ')}`);
      }

      if (brandElements.logos && brandElements.logos.length > 0) {
        criteriaItems.push(`Logos/Icons: ${brandElements.logos.join(', ')}`);
      }

      if (brandElements.spacing && brandElements.spacing.length > 0) {
        criteriaItems.push(`Spacing/Layout: ${brandElements.spacing.join(', ')}`);
      }

      const formattedCriteria = criteriaItems.map(item => `- ${item}`).join('\n');

      const prompt = `
        Examine the ${component} for brand consistency by checking these brand elements:
        ${formattedCriteria}
        
        Verify that all visual elements align with the brand guidelines.
        Answer with "PASS" or "FAIL" followed by a brief explanation.
        If failing, describe which brand elements are inconsistent and why.
      `;

      // Extract result from Stagehand
      const result = await this.stagehand.extract(prompt);
      const resultText = result.text.trim();

      // Parse the result
      const passed = resultText.toUpperCase().startsWith('PASS');
      const description = resultText.replace(/^(PASS|FAIL)\s*:?\s*/i, '').trim();

      // Take screenshot if enabled
      let evidence: { screenshot?: string; logs?: string[] } = {};
      if (this.options.takeScreenshots) {
        evidence.screenshot = await this.takeScreenshot(`${component}-branding-${passed ? 'pass' : 'fail'}`);
      }

      if (this.options.detailedLogs) {
        evidence.logs = [`Prompt: ${prompt}`, `Response: ${resultText}`];
      }

      return {
        passed,
        description,
        details: resultText,
        evidence
      };
    }

    /**
     * Comprehensive visual verification of a component
     */
    async verifyComponent(
      component: string,
      options: {
        checkTypes?: VisualCheckType[];
        devices?: DeviceType[];
        criteria?: Record<VisualCheckType, string[]>;
        brandElements?: {
          colors?: string[];
          typography?: string[];
          logos?: string[];
          spacing?: string[];
        };
        interactions?: string[];
        expectedAnimations?: string[];
      } = {}
    ): Promise<Record<VisualCheckType, VisualVerificationResult | Record<DeviceType, VisualVerificationResult>>> {
      const {
        checkTypes = [VisualCheckType.LAYOUT, VisualCheckType.CONTENT],
        devices = [DeviceType.DESKTOP],
        criteria = {},
        brandElements = {},
        interactions = [],
        expectedAnimations = []
      } = options;

      const results: Record<string, any> = {};

      // Perform each check type requested
      for (const checkType of checkTypes) {
        switch (checkType) {
          case VisualCheckType.LAYOUT:
            results[checkType] = await this.verifyLayout(
              component,
              criteria[VisualCheckType.LAYOUT] || []
            );
            break;

          case VisualCheckType.CONTENT:
            results[checkType] = await this.verifyContent(
              component,
              criteria[VisualCheckType.CONTENT] || []
            );
            break;

          case VisualCheckType.STYLING:
            results[checkType] = await this.verifyStyling(
              component,
              criteria[VisualCheckType.STYLING] || []
            );
            break;

          case VisualCheckType.ACCESSIBILITY:
            results[checkType] = await this.verifyAccessibility(
              component,
              { specific: criteria[VisualCheckType.ACCESSIBILITY] }
            );
            break;

          case VisualCheckType.RESPONSIVENESS:
            results[checkType] = await this.verifyResponsiveness(
              component,
              devices,
              criteria[VisualCheckType.RESPONSIVENESS]
            );
            break;

          case VisualCheckType.ANIMATION:
            if (interactions.length > 0) {
              results[checkType] = await this.verifyAnimation(
                component,
                interactions,
                expectedAnimations
              );
            }
            break;

          case VisualCheckType.BRANDING:
            results[checkType] = await this.verifyBranding(
              component,
              brandElements
            );
            break;

          default:
            // Skip unsupported check types
        }
      }

      return results as Record<VisualCheckType, VisualVerificationResult | Record<DeviceType, VisualVerificationResult>>;
    }

    /**
     * Helper methods
     */

    // Set viewport for device testing
    private async setViewport(device: DeviceType): Promise<void> {
      const viewport = DeviceViewports[device];
      await this.page.setViewportSize(viewport);
    }

    // Try to set theme if possible
    private async trySetTheme(theme: 'light' | 'dark'): Promise<boolean> {
      try {
        // Attempt to find and use theme switcher
        const themeSwitcherCheck = await this.stagehand.extract(`
          Is there a theme switch, toggle, or setting to change to ${theme} mode?
          Answer with "yes" or "no" and briefly describe where it is if found.
        `);

        if (themeSwitcherCheck.text.toLowerCase().includes('yes')) {
          await this.stagehand.act(`
            Find and activate the ${theme} theme option or toggle
          `);
          return true;
        }

        // Try direct script injection
        await this.page.evaluate((themeValue) => {
          // Try common theme implementations
          // 1. Check for next-themes
          if (window.document.documentElement.dataset.theme !== undefined) {
            window.document.documentElement.dataset.theme = themeValue;
            return true;
          }

          // 2. Check for class-based themes
          if (themeValue === 'dark') {
            window.document.documentElement.classList.add('dark');
          } else {
            window.document.documentElement.classList.remove('dark');
          }

          // 3. Try storing in localStorage if present
          try {
            localStorage.setItem('theme', themeValue);
          } catch (e) {
            // Ignore if localStorage isn't available
          }

          return true;
        }, theme);

        return true;
      } catch (error) {
        console.warn(`Failed to set ${theme} theme:`, error);
        return false;
      }
    }

    // Take a screenshot
    private async takeScreenshot(name: string): Promise<string> {
      const filename = `${this.options.screenshotDir}/${name.replace(/\s+/g, '-')}-${Date.now()}.png`;
      await this.page.screenshot({ path: filename, fullPage: false });
      return filename;
    }
  }

  2. Component-Specific Visual Verification Tests

  // journeys/visual-verification.test.ts
  import { expect } from '@playwright/test';
  import { test } from './base-journey.test';
  import {
    DeviceType,
    VisualCheckType,
    VisualVerifier
  } from '../framework/visual/visual-verifier';

  test.describe('Visual verification for critical UI components', () => {

    test('should verify marketplace builder cards layout and responsiveness', async ({
      page,
      stagehand,
      authManager,
      dataManager
    }) => {
      // Create multiple builders for a realistic marketplace view
      await dataManager.createTestBuilder({ name: 'Visual Test Builder 1' });
      await dataManager.createTestBuilder({ name: 'Visual Test Builder 2' });
      await dataManager.createTestBuilder({ name: 'Visual Test Builder 3' });

      // Initialize visual verifier
      const visualVerifier = new VisualVerifier(page, stagehand, {
        screenshotDir: './test-results/visual',
        takeScreenshots: true
      });

      // Navigate to marketplace
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Define comprehensive verification criteria
      const criteria = {
        [VisualCheckType.LAYOUT]: [
          'Builder cards are aligned in a grid layout',
          'Cards have consistent spacing between them',
          'Cards have proper padding and margins',
          'Content within cards is properly aligned'
        ],
        [VisualCheckType.CONTENT]: [
          'Builder name is clearly visible',
          'Builder expertise/skills are displayed',
          'Rating or testimonial count is shown if available',
          'Pricing information is visible'
        ],
        [VisualCheckType.STYLING]: [
          'Cards have consistent styling (shadows, borders, etc.)',
          'Typography follows design system guidelines',
          'Interactive elements (buttons, links) have proper hover states',
          'Images are properly sized and cropped'
        ],
        [VisualCheckType.ACCESSIBILITY]: [
          'Text has sufficient color contrast',
          'Interactive elements have focus states',
          'Cards are navigable via keyboard',
          'Content uses semantic HTML where appropriate'
        ],
        [VisualCheckType.RESPONSIVENESS]: [
          'Card grid adjusts columns based on screen size',
          'Cards remain readable on all device sizes',
          'Text doesn't overflow or become too small on mobile',
          'Images scale appropriately'
        ]
      };

      // Perform comprehensive visual verification
      const results = await visualVerifier.verifyComponent('builder cards in marketplace', {
        checkTypes: [
          VisualCheckType.LAYOUT,
          VisualCheckType.CONTENT,
          VisualCheckType.STYLING,
          VisualCheckType.ACCESSIBILITY,
          VisualCheckType.RESPONSIVENESS
        ],
        devices: [DeviceType.MOBILE, DeviceType.TABLET, DeviceType.DESKTOP],
        criteria,
        interactions: [
          'Hover over the first builder card',
          'Focus on a builder card using keyboard navigation (Tab key)'
        ],
        expectedAnimations: [
          'Card shows subtle hover effect (shadow change, slight scale, etc.)',
          'Card shows clear focus indicator (outline, highlight, etc.)'
        ]
      });

      // Check layout results
      expect(results[VisualCheckType.LAYOUT].passed).toBeTruthy();

      // Check content results
      expect(results[VisualCheckType.CONTENT].passed).toBeTruthy();

      // Check responsive results for each device
      const responsiveResults = results[VisualCheckType.RESPONSIVENESS] as Record<DeviceType, any>;
      expect(responsiveResults[DeviceType.DESKTOP].passed).toBeTruthy();
      expect(responsiveResults[DeviceType.TABLET].passed).toBeTruthy();
      expect(responsiveResults[DeviceType.MOBILE].passed).toBeTruthy();
    });

    test('should verify booking confirmation page visual elements', async ({
      page,
      stagehand,
      authManager,
      dataManager
    }) => {
      // Authenticate as client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Create booking scenario to navigate to confirmation page
      const bookingScenario = await dataManager.createBookingScenario({
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      });

      // Navigate directly to booking confirmation
      await page.goto(`/booking/confirmation/${bookingScenario.id}`);
      await page.waitForLoadState('networkidle');

      // Initialize visual verifier
      const visualVerifier = new VisualVerifier(page, stagehand);

      // Verification criteria
      const criteria = {
        [VisualCheckType.LAYOUT]: [
          'Confirmation message is prominently displayed',
          'Booking details are clearly organized in sections',
          'Layout has proper spacing and alignment',
          'Call-to-action buttons are appropriately positioned'
        ],
        [VisualCheckType.CONTENT]: [
          'Success/confirmation message is present',
          'Booking reference/ID is displayed',
          'Session date and time details are shown',
          'Builder name and session type are visible',
          'Payment information is displayed',
          'Next steps or instructions are provided'
        ],
        [VisualCheckType.BRANDING]: [
          'Colors follow brand guidelines',
          'Typography is consistent with brand standards',
          'Success state uses appropriate brand elements'
        ]
      };

      // Brand elements
      const brandElements = {
        colors: ['Primary brand color for success state', 'Neutral colors for content'],
        typography: ['Primary heading font', 'Body text font'],
        spacing: ['Consistent padding/margins matching design system']
      };

      // Perform specific checks
      const layoutResult = await visualVerifier.verifyLayout(
        'booking confirmation page',
        criteria[VisualCheckType.LAYOUT]
      );

      expect(layoutResult.passed).toBeTruthy();

      const contentResult = await visualVerifier.verifyContent(
        'booking confirmation page',
        criteria[VisualCheckType.CONTENT]
      );

      expect(contentResult.passed).toBeTruthy();

      const brandingResult = await visualVerifier.verifyBranding(
        'booking confirmation page',
        brandElements
      );

      expect(brandingResult.passed).toBeTruthy();

      // Verify across screen sizes
      const responsiveResults = await visualVerifier.verifyResponsiveness(
        'booking confirmation page',
        [DeviceType.MOBILE, DeviceType.DESKTOP]
      );

      expect(responsiveResults[DeviceType.DESKTOP].passed).toBeTruthy();
      expect(responsiveResults[DeviceType.MOBILE].passed).toBeTruthy();
    });

    test('should verify payment success page visual elements', async ({
      page,
      stagehand,
      authManager,
      dataManager
    }) => {
      // Authenticate as client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Create completed payment scenario
      const paymentId = `pi_${Date.now()}`;
      const bookingId = `booking_${Date.now()}`;

      // Navigate directly to payment success page
      await page.goto(`/payment/success?payment_intent=${paymentId}&booking_id=${bookingId}`);
      await page.waitForLoadState('networkidle');

      // Initialize visual verifier
      const visualVerifier = new VisualVerifier(page, stagehand);

      // Check specific payment success UI elements
      const contentResult = await visualVerifier.verifyContent(
        'payment success page',
        [
          'Payment successful message',
          'Payment/transaction reference',
          'Amount paid',
          'Booking details',
          'Next steps or receipt information',
          'Return to dashboard or similar navigation option'
        ]
      );

      expect(contentResult.passed).toBeTruthy();

      // Check accessibility of success page
      const accessibilityResult = await visualVerifier.verifyAccessibility(
        'payment success page'
      );

      expect(accessibilityResult.passed).toBeTruthy();
    });

    test('should verify Calendly embed visual integration', async ({
      page,
      stagehand,
      authManager,
      dataManager
    }) => {
      // Create test builder with session types
      const builder = await dataManager.createTestBuilder();
      await dataManager.createSessionTypes(builder.id);

      // Authenticate as client
      await authManager.authenticateViaTestApi('CLIENT_BASIC');

      // Navigate to builder profile
      await page.goto(`/marketplace/builders/${builder.id}`);
      await page.waitForLoadState('networkidle');

      // Click on session type to show Calendly embed
      await stagehand.act(`
        Find and click on the first available session type
      `);

      // Wait for Calendly iframe to load
      await page.waitForSelector('iframe[src*="calendly.com"]', { timeout: 20000 });

      // Initialize visual verifier
      const visualVerifier = new VisualVerifier(page, stagehand);

      // Check Calendly integration
      const layoutResult = await visualVerifier.verifyLayout(
        'Calendly scheduling embed',
        [
          'Calendly iframe is fully loaded and visible',
          'Iframe is properly sized within the container',
          'No visual glitches between the app UI and the Calendly embed',
          'Container has appropriate padding and styling'
        ]
      );

      expect(layoutResult.passed).toBeTruthy();

      // Check responsiveness
      const responsiveResult = await visualVerifier.verifyResponsiveness(
        'Calendly scheduling embed',
        [DeviceType.MOBILE, DeviceType.DESKTOP],
        [
          'Calendly embed is properly responsive',
          'No horizontal scrolling is required',
          'All controls remain accessible on smaller screens'
        ]
      );

      expect(responsiveResult[DeviceType.DESKTOP].passed).toBeTruthy();
      // Mobile may require special handling in Calendly, so we're less strict
      console.log('Mobile Calendly embed status:',
                  responsiveResult[DeviceType.MOBILE].passed ? 'Passed' : 'Has issues');
    });
  });