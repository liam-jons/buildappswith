/**
 * Marketplace Page Objects
 * 
 * These page objects handle marketplace browsing, filtering, and builder profiles
 */
import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class MarketplacePage extends BasePage {
  // Selectors
  private builderCardSelector = '[data-testid="builder-card"]';
  private searchInputSelector = '[data-testid="marketplace-search"]';
  private searchButtonSelector = '[data-testid="search-button"]';
  private filterPanelSelector = '[data-testid="filter-panel"]';
  private filterToggleSelector = '[data-testid="filter-toggle"]';
  private expertiseFilterSelector = '[data-testid="expertise-filter"]';
  private rateFilterSelector = '[data-testid="rate-filter"]';
  private sortDropdownSelector = '[data-testid="sort-dropdown"]';
  private noResultsSelector = '[data-testid="no-results"]';
  private paginationSelector = '[data-testid="pagination"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to marketplace
   */
  async navigate(): Promise<void> {
    await this.navigateTo('/marketplace');
  }

  /**
   * Search for builders by keyword
   */
  async search(keyword: string): Promise<void> {
    await this.fillField(this.searchInputSelector, keyword);
    await this.clickElement(this.searchButtonSelector);
    await this.waitForPageLoad();
  }

  /**
   * Toggle filter panel
   */
  async toggleFilterPanel(): Promise<void> {
    await this.clickElement(this.filterToggleSelector);
  }

  /**
   * Filter builders by expertise
   */
  async filterByExpertise(expertise: string): Promise<void> {
    if (!(await this.isElementVisible(`${this.filterPanelSelector}:visible`))) {
      await this.toggleFilterPanel();
    }
    
    await this.page.check(`${this.expertiseFilterSelector} input[value="${expertise}"]`);
    await this.waitForPageLoad();
  }

  /**
   * Filter builders by rate range
   */
  async filterByRate(min: number, max: number): Promise<void> {
    if (!(await this.isElementVisible(`${this.filterPanelSelector}:visible`))) {
      await this.toggleFilterPanel();
    }
    
    // Assuming there are min and max range inputs
    await this.fillField(`${this.rateFilterSelector} input[name="minRate"]`, min.toString());
    await this.fillField(`${this.rateFilterSelector} input[name="maxRate"]`, max.toString());
    await this.clickElement(`${this.rateFilterSelector} button[type="submit"]`);
    await this.waitForPageLoad();
  }

  /**
   * Sort builders by criteria
   */
  async sortBy(criteria: 'rating-desc' | 'price-asc' | 'price-desc' | 'newest'): Promise<void> {
    await this.page.selectOption(this.sortDropdownSelector, criteria);
    await this.waitForPageLoad();
  }

  /**
   * Count builder cards
   */
  async getBuilderCount(): Promise<number> {
    return await this.page.locator(this.builderCardSelector).count();
  }

  /**
   * Check if builder exists in results
   */
  async builderExists(name: string): Promise<boolean> {
    return await this.isElementVisible(`${this.builderCardSelector}:has-text("${name}")`);
  }

  /**
   * Navigate to a builder profile by index
   */
  async clickOnBuilderCard(index: number = 0): Promise<void> {
    await this.page.locator(this.builderCardSelector).nth(index).click();
    await this.waitForNavigation(/.*\/(marketplace\/builders|profile)\/[\w-]+/);
  }

  /**
   * Navigate to a specific builder profile by name
   */
  async navigateToBuilderProfile(name: string): Promise<void> {
    // First search for the builder
    await this.search(name);
    
    // Click on the builder card if found
    const builderCard = this.page.locator(`${this.builderCardSelector}:has-text("${name}")`);
    
    if (await builderCard.isVisible()) {
      await builderCard.click();
      await this.waitForNavigation(/.*\/(marketplace\/builders|profile)\/[\w-]+/);
    } else {
      throw new Error(`Builder with name "${name}" not found in marketplace results`);
    }
  }

  /**
   * Navigate to next page of results
   */
  async goToNextPage(): Promise<boolean> {
    const nextButton = this.page.locator(`${this.paginationSelector} [data-testid="next-page"]`);
    
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await this.waitForPageLoad();
      return true;
    }
    
    return false; // No next page available
  }

  /**
   * Check if there are no search results
   */
  async hasNoResults(): Promise<boolean> {
    return await this.isElementVisible(this.noResultsSelector);
  }
}

export class BuilderProfilePage extends BasePage {
  // Selectors
  private builderNameSelector = '[data-testid="builder-name"]';
  private bioSelector = '[data-testid="builder-bio"]';
  private skillsSelector = '[data-testid="builder-skills"]';
  private rateSelector = '[data-testid="hourly-rate"]';
  private sessionTypeCardSelector = '[data-testid="session-type-card"]';
  private bookingButtonSelector = '[data-testid="booking-button"]';
  private projectGallerySelector = '[data-testid="project-gallery"]';
  private contactButtonSelector = '[data-testid="contact-button"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to a specific builder profile
   */
  async navigateToBuilder(builderId: string): Promise<void> {
    await this.navigateTo(`/marketplace/builders/${builderId}`);
  }

  /**
   * Get builder name
   */
  async getBuilderName(): Promise<string | null> {
    return await this.getElementText(this.builderNameSelector);
  }

  /**
   * Get builder bio
   */
  async getBuilderBio(): Promise<string | null> {
    return await this.getElementText(this.bioSelector);
  }

  /**
   * Get builder skills
   */
  async getBuilderSkills(): Promise<string[]> {
    const skillElements = await this.page.locator(`${this.skillsSelector} [data-testid="skill-item"]`).all();
    const skills = [];
    
    for (const element of skillElements) {
      const text = await element.textContent();
      if (text) {
        skills.push(text.trim());
      }
    }
    
    return skills;
  }

  /**
   * Get session type count
   */
  async getSessionTypeCount(): Promise<number> {
    return await this.page.locator(this.sessionTypeCardSelector).count();
  }

  /**
   * Select a session type by index
   */
  async selectSessionType(index: number = 0): Promise<void> {
    await this.page.locator(this.sessionTypeCardSelector).nth(index).click();
  }

  /**
   * Select a session type by name
   */
  async selectSessionTypeByName(name: string): Promise<void> {
    await this.page.locator(`${this.sessionTypeCardSelector}:has-text("${name}")`).click();
  }

  /**
   * Click book session button
   */
  async clickBookSession(): Promise<void> {
    await this.clickElement(this.bookingButtonSelector);
    await this.waitForNavigation(/.*\/book\//);
  }

  /**
   * Check if projects are displayed
   */
  async hasProjects(): Promise<boolean> {
    return await this.isElementVisible(this.projectGallerySelector);
  }

  /**
   * Click contact button
   */
  async clickContact(): Promise<void> {
    await this.clickElement(this.contactButtonSelector);
  }
}