import { Page, Locator, expect } from '@playwright/test';

/**
 * Utility functions for handling asynchronous operations in E2E tests
 */
export class AsyncUtils {
  /**
   * Wait for an element to become stable (not moving) in the UI
   * Useful for waiting for animations to complete
   */
  public static async waitForElementStability(
    locator: Locator,
    options: { timeoutMs?: number; pollIntervalMs?: number } = {}
  ): Promise<void> {
    const { timeoutMs = 5000, pollIntervalMs = 100 } = options;
    const startTime = Date.now();
    
    let previousRect: { x: number; y: number } | null = null;
    
    while (Date.now() - startTime < timeoutMs) {
      // Check if element is visible first
      if (!(await locator.isVisible())) {
        await new Promise(r => setTimeout(r, pollIntervalMs));
        continue;
      }
      
      // Get current position
      const boundingBox = await locator.boundingBox();
      if (!boundingBox) {
        await new Promise(r => setTimeout(r, pollIntervalMs));
        continue;
      }
      
      const currentRect = { x: boundingBox.x, y: boundingBox.y };
      
      // If this is the first check, store the position and continue
      if (!previousRect) {
        previousRect = currentRect;
        await new Promise(r => setTimeout(r, pollIntervalMs));
        continue;
      }
      
      // Check if the element has moved
      if (
        previousRect.x === currentRect.x && 
        previousRect.y === currentRect.y
      ) {
        // Element is stable
        return;
      }
      
      // Update previous position and wait for next check
      previousRect = currentRect;
      await new Promise(r => setTimeout(r, pollIntervalMs));
    }
    
    throw new Error(`Element did not stabilize within ${timeoutMs}ms`);
  }
  
  /**
   * Wait for network to be idle (no requests for a certain period)
   */
  public static async waitForNetworkIdle(
    page: Page,
    options: { idleTimeMs?: number; timeoutMs?: number } = {}
  ): Promise<void> {
    const { idleTimeMs = 500, timeoutMs = 15000 } = options;
    
    await page.waitForFunction(
      ({ idleTime }) => {
        return new Promise(resolve => {
          let lastRequestTime = Date.now();
          const requestHandler = () => {
            lastRequestTime = Date.now();
          };
          
          // Listen for any network requests
          window.addEventListener('fetch', requestHandler);
          
          // Check if network has been idle for the specified time
          const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastRequestTime >= idleTime) {
              clearInterval(interval);
              window.removeEventListener('fetch', requestHandler);
              resolve(true);
            }
          }, Math.min(100, idleTime));
        });
      },
      { idleTime: idleTimeMs },
      { timeout: timeoutMs }
    );
  }
  
  /**
   * Wait for any CSS animations to complete on an element
   */
  public static async waitForAnimationComplete(
    locator: Locator,
    options: { timeoutMs?: number } = {}
  ): Promise<void> {
    const { timeoutMs = 5000 } = options;
    
    // Check if element exists
    await locator.waitFor({ timeout: timeoutMs });
    
    // Wait for animations to complete
    await locator.evaluate(
      element => {
        return new Promise<void>(resolve => {
          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (
                mutation.attributeName === 'class' ||
                mutation.attributeName === 'style'
              ) {
                // Continue observing as class or style changed
                return;
              }
            }
            
            // Check for ongoing animations
            const computedStyle = window.getComputedStyle(element);
            if (
              computedStyle.animationPlayState === 'running' ||
              computedStyle.transitionProperty !== 'none'
            ) {
              return;
            }
            
            // No more animations/transitions detected
            observer.disconnect();
            resolve();
          });
          
          // Observe changes to the element
          observer.observe(element, {
            attributes: true,
            attributeFilter: ['class', 'style'],
          });
          
          // Also resolve after a small delay in case there are no animations
          setTimeout(() => {
            observer.disconnect();
            resolve();
          }, 100);
        });
      },
      { timeout: timeoutMs }
    );
  }
  
  /**
   * Wait for an API response matching a specific URL pattern
   */
  public static async waitForApiResponse(
    page: Page,
    urlPattern: RegExp | string,
    options: { timeoutMs?: number; statusCode?: number } = {}
  ): Promise<any> {
    const { timeoutMs = 10000, statusCode } = options;
    
    const response = await page.waitForResponse(
      response => {
        const matches = response.url().match(urlPattern);
        if (!matches) return false;
        
        if (statusCode !== undefined) {
          return response.status() === statusCode;
        }
        
        return true;
      },
      { timeout: timeoutMs }
    );
    
    try {
      return await response.json();
    } catch (e) {
      // If not JSON, return the text
      return await response.text();
    }
  }
  
  /**
   * Check if an element is in viewport and scroll it into view if needed
   */
  public static async ensureElementInView(
    locator: Locator,
    options: { behavior?: ScrollBehavior } = {}
  ): Promise<void> {
    const { behavior = 'smooth' } = options;
    
    const isInViewport = await locator.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    });
    
    if (!isInViewport) {
      await locator.scrollIntoViewIfNeeded({ behavior });
      
      // Wait a moment for the scroll to complete
      if (behavior === 'smooth') {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }
  
  /**
   * Wait for a form to be submittable (all required fields filled)
   */
  public static async waitForFormValidity(
    page: Page,
    formSelector: string,
    options: { timeoutMs?: number } = {}
  ): Promise<boolean> {
    const { timeoutMs = 5000 } = options;
    
    try {
      return await page.waitForFunction(
        selector => {
          const form = document.querySelector(selector) as HTMLFormElement;
          if (!form) return false;
          
          // Check if the form is valid
          return form.checkValidity();
        },
        formSelector,
        { timeout: timeoutMs }
      );
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Wait for a toast notification with specific text
   */
  public static async waitForToast(
    page: Page,
    textPattern: RegExp | string,
    options: { timeoutMs?: number } = {}
  ): Promise<void> {
    const { timeoutMs = 5000 } = options;
    
    const pattern = typeof textPattern === 'string' 
      ? new RegExp(textPattern, 'i')
      : textPattern;
    
    // Common toast selectors in UI libraries
    const toastSelectors = [
      '[role="alert"]',
      '.toast',
      '.notification',
      '.message',
      '.alert',
    ];
    
    // Wait for any toast with matching text
    await Promise.race(
      toastSelectors.map(selector => 
        page.waitForFunction(
          ({ selector, pattern }) => {
            const elements = Array.from(document.querySelectorAll(selector));
            return elements.some(el => pattern.test(el.textContent || ''));
          },
          { selector, pattern: pattern.toString() },
          { timeout: timeoutMs }
        ).catch(() => false)
      )
    );
  }
  
  /**
   * Wait for page load state to be complete
   */
  public static async waitForPageLoad(
    page: Page,
    options: { state?: 'load' | 'domcontentloaded' | 'networkidle' } = {}
  ): Promise<void> {
    const { state = 'networkidle' } = options;
    await page.waitForLoadState(state);
  }
  
  /**
   * Retry an action until it succeeds or times out
   */
  public static async retryAction<T>(
    action: () => Promise<T>,
    options: { 
      maxAttempts?: number; 
      intervalMs?: number; 
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const { 
      maxAttempts = 3, 
      intervalMs = 1000, 
      shouldRetry = () => true 
    } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          throw lastError;
        }
        
        await new Promise(r => setTimeout(r, intervalMs));
      }
    }
    
    // This should never happen due to the throw above
    throw lastError || new Error('Unknown error in retryAction');
  }
}

/**
 * Expect helpers for common test patterns
 */
export const asyncExpect = {
  /**
   * Expect that an element becomes stable (not moving) within a timeout
   */
  toEventuallyStabilize: async (
    locator: Locator,
    options: { timeout?: number } = {}
  ) => {
    const { timeout = 5000 } = options;
    await AsyncUtils.waitForElementStability(locator, { timeoutMs: timeout });
    return { pass: true };
  },
  
  /**
   * Expect that a toast with specific text appears
   */
  toastToAppear: async (
    page: Page,
    text: string | RegExp,
    options: { timeout?: number } = {}
  ) => {
    const { timeout = 5000 } = options;
    await AsyncUtils.waitForToast(page, text, { timeoutMs: timeout });
    return { pass: true };
  },
  
  /**
   * Expect network to become idle
   */
  networkToBeIdle: async (
    page: Page,
    options: { idleTime?: number; timeout?: number } = {}
  ) => {
    const { idleTime = 500, timeout = 10000 } = options;
    await AsyncUtils.waitForNetworkIdle(page, { 
      idleTimeMs: idleTime, 
      timeoutMs: timeout 
    });
    return { pass: true };
  },
  
  /**
   * Expect an API call to be made and return a specific status
   */
  apiCallToSucceed: async (
    page: Page,
    urlPattern: string | RegExp,
    options: { statusCode?: number; timeout?: number } = {}
  ) => {
    const { statusCode = 200, timeout = 10000 } = options;
    const response = await AsyncUtils.waitForApiResponse(page, urlPattern, {
      statusCode,
      timeoutMs: timeout,
    });
    return { pass: !!response };
  },
};