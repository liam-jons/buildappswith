/**
 * Async utilities for E2E testing
 */
import { Page } from '@playwright/test';

/**
 * Wait for a condition to be true with timeout and periodic checks
 * @param predicate Function that returns true when condition is met
 * @param options Wait options
 * @returns Promise that resolves when condition is met
 */
export async function waitForCondition(
  predicate: () => Promise<boolean> | boolean,
  options: {
    timeout?: number;
    pollInterval?: number;
    message?: string;
  } = {}
): Promise<void> {
  const {
    timeout = 30000,
    pollInterval = 500,
    message = 'Condition not met within timeout period'
  } = options;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await predicate()) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(message);
}

/**
 * Wait for element to be stable (not moving) in the viewport
 * @param page Playwright page
 * @param selector Element selector
 * @param options Stability options
 */
export async function waitForElementStability(
  page: Page,
  selector: string,
  options: {
    timeout?: number;
    stabilityDuration?: number;
    positionTolerance?: number;
  } = {}
): Promise<void> {
  const {
    timeout = 10000,
    stabilityDuration = 500,
    positionTolerance = 2
  } = options;
  
  let lastRect: { x: number; y: number } | null = null;
  let stabilityStartTime: number | null = null;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    // Get current position
    const currentRect = await page.$eval(
      selector,
      el => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      }
    ).catch(() => null);
    
    if (!currentRect) {
      // Element is not visible or doesn't exist
      await page.waitForTimeout(100);
      continue;
    }
    
    if (!lastRect) {
      // First measurement
      lastRect = currentRect;
      await page.waitForTimeout(100);
      continue;
    }
    
    // Check if position changed significantly
    const xDiff = Math.abs(currentRect.x - lastRect.x);
    const yDiff = Math.abs(currentRect.y - lastRect.y);
    
    if (xDiff <= positionTolerance && yDiff <= positionTolerance) {
      // Position is stable
      if (!stabilityStartTime) {
        stabilityStartTime = Date.now();
      } else if (Date.now() - stabilityStartTime >= stabilityDuration) {
        // Position has been stable for required duration
        return;
      }
    } else {
      // Position changed, reset stability timer
      stabilityStartTime = null;
      lastRect = currentRect;
    }
    
    await page.waitForTimeout(100);
  }
  
  throw new Error(`Element ${selector} did not stabilize within ${timeout}ms`);
}

/**
 * Retry an async function multiple times until it succeeds
 * @param fn Function to retry
 * @param options Retry options
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    interval?: number;
    onError?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    interval = 1000,
    onError = () => {}
  } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      onError(lastError, attempt);
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }
  
  throw lastError;
}

/**
 * Wait for all network requests to complete
 * @param page Playwright page
 * @param options Wait options
 */
export async function waitForNetworkIdle(
  page: Page,
  options: {
    timeout?: number;
    idleTime?: number;
    maxInflightRequests?: number;
  } = {}
): Promise<void> {
  const {
    timeout = 30000,
    idleTime = 500,
    maxInflightRequests = 0
  } = options;
  
  let inflightRequests = 0;
  let idleStartTime: number | null = null;
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const onRequest = () => {
      inflightRequests++;
      idleStartTime = null;
    };
    
    const onRequestFinished = () => {
      inflightRequests = Math.max(0, inflightRequests - 1);
      if (inflightRequests <= maxInflightRequests) {
        idleStartTime = Date.now();
      }
    };
    
    // Set up listeners
    page.on('request', onRequest);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);
    
    // Initial state might already be idle
    if (inflightRequests <= maxInflightRequests) {
      idleStartTime = Date.now();
    }
    
    // Check if we've reached our idle time
    const checkIdle = () => {
      if (
        idleStartTime && 
        Date.now() - idleStartTime >= idleTime
      ) {
        cleanup();
        resolve();
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        cleanup();
        reject(new Error(`Network did not become idle within ${timeout}ms`));
        return;
      }
      
      setTimeout(checkIdle, 100);
    };
    
    // Clean up listeners
    const cleanup = () => {
      page.off('request', onRequest);
      page.off('requestfinished', onRequestFinished);
      page.off('requestfailed', onRequestFinished);
    };
    
    // Start checking
    checkIdle();
  });
}