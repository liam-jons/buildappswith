/**
 * Authentication Page Objects
 * 
 * These page objects handle login, signup, and profile management
 */
import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class AuthPage extends BasePage {
  // Selectors
  private emailInputSelector = 'input[type="email"]';
  private passwordInputSelector = 'input[type="password"]';
  private nameInputSelector = 'input[name="name"]';
  private loginButtonSelector = 'button[type="submit"]';
  private signupButtonSelector = 'button[type="submit"]';
  private errorMessageSelector = '[data-testid="auth-error"]';
  private userMenuSelector = '[data-testid="user-menu"]';
  private logoutButtonSelector = '[data-testid="logout-button"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateTo('/login');
  }

  /**
   * Navigate to signup page
   */
  async navigateToSignup(): Promise<void> {
    await this.navigateTo('/signup');
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInputSelector, email);
    await this.fillField(this.passwordInputSelector, password);
    await this.clickElement(this.loginButtonSelector);
    
    // Wait for navigation to dashboard or profile page
    await this.waitForNavigation(/.*\/(dashboard|profile|builder|admin)/);
  }

  /**
   * Sign up with name, email, and password
   */
  async signup(name: string, email: string, password: string): Promise<void> {
    await this.fillField(this.nameInputSelector, name);
    await this.fillField(this.emailInputSelector, email);
    await this.fillField(this.passwordInputSelector, password);
    await this.clickElement(this.signupButtonSelector);
    
    // Wait for navigation to onboarding page
    await this.waitForNavigation(/.*\/onboarding/);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.clickElement(this.userMenuSelector);
    await this.clickElement(this.logoutButtonSelector);
    
    // Wait for logout to complete
    await this.waitForNavigation(/.*\/(login|homepage)/);
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.isElementVisible(this.userMenuSelector);
  }

  /**
   * Get authentication error message
   */
  async getAuthError(): Promise<string | null> {
    return await this.getElementText(this.errorMessageSelector);
  }
}

export class ProfilePage extends BasePage {
  // Selectors
  private profileEditButtonSelector = '[data-testid="edit-profile-button"]';
  private bioInputSelector = 'textarea[name="bio"]';
  private titleInputSelector = 'input[name="title"]';
  private saveButtonSelector = '[data-testid="save-profile-button"]';
  private skillsInputSelector = '[data-testid="skills-input"]';
  private addSkillButtonSelector = '[data-testid="add-skill-button"]';
  private rateInputSelector = 'input[name="hourlyRate"]';
  private availabilitySelector = 'select[name="availability"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to user profile
   */
  async navigateToProfile(): Promise<void> {
    await this.navigateTo('/profile');
  }

  /**
   * Enter edit mode
   */
  async clickEditProfile(): Promise<void> {
    await this.clickElement(this.profileEditButtonSelector);
  }

  /**
   * Update profile fields
   */
  async updateProfile(profileData: {
    bio?: string;
    title?: string;
    hourlyRate?: number;
    availability?: string;
  }): Promise<void> {
    if (profileData.bio) {
      await this.fillField(this.bioInputSelector, profileData.bio);
    }
    
    if (profileData.title) {
      await this.fillField(this.titleInputSelector, profileData.title);
    }
    
    if (profileData.hourlyRate) {
      await this.fillField(this.rateInputSelector, profileData.hourlyRate.toString());
    }
    
    if (profileData.availability) {
      await this.page.selectOption(this.availabilitySelector, profileData.availability);
    }
    
    await this.clickElement(this.saveButtonSelector);
    await this.waitForPageLoad();
  }

  /**
   * Add skills to profile
   */
  async addSkills(skills: string[]): Promise<void> {
    for (const skill of skills) {
      await this.fillField(this.skillsInputSelector, skill);
      await this.clickElement(this.addSkillButtonSelector);
    }
    
    await this.clickElement(this.saveButtonSelector);
    await this.waitForPageLoad();
  }

  /**
   * Check if profile contains specific information
   */
  async profileContains(info: string): Promise<boolean> {
    return await this.isElementVisible(`text="${info}"`);
  }

  /**
   * Get profile data
   */
  async getProfileData(): Promise<{
    bio: string | null;
    title: string | null;
    skills: string[];
  }> {
    const bio = await this.getElementText('[data-testid="profile-bio"]');
    const title = await this.getElementText('[data-testid="profile-title"]');
    
    const skillElements = await this.page.locator('[data-testid="skill-item"]').all();
    const skills = [];
    
    for (const element of skillElements) {
      const text = await element.textContent();
      if (text) {
        skills.push(text.trim());
      }
    }
    
    return { bio, title, skills };
  }
}

export class OnboardingPage extends BasePage {
  // Selectors
  private roleRadioSelector = 'input[name="role"]';
  private continueButtonSelector = '[data-testid="continue-button"]';
  private nameInputSelector = 'input[name="name"]';
  private bioInputSelector = 'textarea[name="bio"]';
  private completeButtonSelector = '[data-testid="complete-onboarding-button"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Select role during onboarding
   */
  async selectRole(role: 'client' | 'builder'): Promise<void> {
    await this.page.check(`${this.roleRadioSelector}[value="${role}"]`);
    await this.clickElement(this.continueButtonSelector);
  }

  /**
   * Complete profile details during onboarding
   */
  async completeProfile(details: {
    name?: string;
    bio?: string;
  } = {}): Promise<void> {
    if (details.name) {
      await this.fillField(this.nameInputSelector, details.name);
    }
    
    if (details.bio) {
      await this.fillField(this.bioInputSelector, details.bio);
    }
    
    await this.clickElement(this.completeButtonSelector);
    await this.waitForNavigation(/.*\/dashboard/);
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/dashboard');
  }
}