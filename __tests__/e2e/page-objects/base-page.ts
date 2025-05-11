/**
 * Base Page Object for all page objects
 * Provides common functionality for all page objects
 */
import { Page, Locator, expect } from '@playwright/test';
import { waitForNetworkIdle } from '../../utils/e2e/async-utils';

export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await waitForNetworkIdle(this.page);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.isVisible();
  }

  /**
   * Wait for element to be visible with custom timeout
   */
  async waitForElement(selector: string, timeout?: number): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Click on element
   */
  async clickElement(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.click();
  }

  /**
   * Fill form field
   */
  async fillField(selector: string, value: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.fill(value);
  }

  /**
   * Get text from element
   */
  async getElementText(selector: string): Promise<string | null> {
    const element = this.page.locator(selector);
    return await element.textContent();
  }

  /**
   * Check if page contains text
   */
  async pageContainsText(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.getByRole('alert');
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./test-results/screenshots/${name}.png` });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(urlPattern?: RegExp | string): Promise<void> {
    if (urlPattern) {
      await this.page.waitForURL(urlPattern);
    } else {
      await this.page.waitForLoadState('networkidle');
    }
  }
}