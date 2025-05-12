# Comprehensive E2E testing strategy using Stagehand

## Critical User Flow Journey Maps

  1. Marketplace Builder Discovery Flow

  Steps:
  1. Navigate to the marketplace page
  2. Browse available builders
  3. Apply expertise filters (e.g., React, Node.js)
  4. Apply rate/price filters
  5. Sort results (by rating, price, etc.)
  6. Search for specific skills/keywords
  7. Verify filtered results accuracy
  8. Navigate through pagination
  9. Clear filters and verify reset

  Assertions:
  - Correct builders display based on filters
  - Search results match keywords
  - Empty state appears for no results
  - Pagination works correctly

  2. Builder Profile Viewing Flow

  Steps:
  1. Navigate to marketplace
  2. Select a builder card
  3. View complete builder profile
  4. Check skills, expertise, testimonials
  5. View portfolio projects
  6. Check session types and availability
  7. View pricing information
  8. Use contact/book options

  Assertions:
  - Profile displays all required information
  - Skills and expertise are correctly presented
  - Session types show with accurate pricing
  - Booking options are accessible

  3. Booking Flow with Calendly

  Steps:
  1. Navigate to builder profile
  2. Select session type
  3. Click "Book Session" button
  4. Interact with Calendly embed
  5. Select available date/time
  6. Fill booking details form
  7. Confirm booking
  8. Process payment (if applicable)
  9. View booking confirmation
  10. Receive confirmation email

  Assertions:
  - Calendly integration loads correctly
  - Time slots reflect builder availability
  - Booking confirmation displays session details
  - Webhooks process correctly

  4. Payment Processing Flow

  Steps:
  1. Complete booking selection
  2. Navigate to payment page
  3. Enter payment details (test card)
  4. Submit payment form
  5. Process Stripe payment
  6. Handle success or failure states
  7. View payment confirmation
  8. Verify booking status update

  Assertions:
  - Stripe elements load correctly
  - Payment processing succeeds with valid card
  - Error handling works for invalid cards
  - Booking status updates after payment

## Test Architecture Design

1. Framework Structure

  stagehand-tests/
  ├── config/
  │   ├── stagehand.config.ts       # Main configuration
  │   └── environment.ts            # Environment-specific settings
  ├── page-objects/
  │   ├── base-page.ts              # Base page with Stagehand extensions
  │   ├── marketplace-page.ts       # Marketplace page actions
  │   ├── builder-profile-page.ts   # Builder profile interactions
  │   ├── booking-page.ts           # Booking flow interactions
  │   └── payment-page.ts           # Payment processing
  ├── test-data/
  │   ├── test-users.ts             # User personas
  │   ├── test-builders.ts          # Builder data
  │   └── session-types.ts          # Session configurations
  ├── utils/
  │   ├── auth-utils.ts             # Authentication helpers
  │   ├── visual-utils.ts           # Visual verification helpers
  │   ├── database-utils.ts         # Database isolation
  │   └── webhooks.ts               # Webhook simulators
  ├── tests/
  │   ├── marketplace/              # Marketplace tests
  │   ├── booking/                  # Booking flow tests
  │   ├── auth/                     # Authentication tests
  │   └── payment/                  # Payment processing tests
  └── common/
      ├── prompts.ts                # Reusable AI prompts
      └── actions.ts                # Common actions

  2. Core Architecture Components

  Stagehand Extended Page Objects

  // Base Stagehand Page
  export class StagehandBasePage {
    constructor(protected page: Page, protected stagehand: Stagehand) {}

    // AI-assisted element location
    async findElement(description: string): Promise<Locator> {
      const results = await this.page.observe(description);
      if (results.length === 0) {
        throw new Error(`Could not find element matching description: ${description}`);
      }
      return this.page.locator(results[0].selector);
    }

    // AI-assisted action
    async performAction(instruction: string): Promise<void> {
      await this.page.act(instruction);
    }

    // AI-assisted extraction
    async extractData(description: string): Promise<string> {
      const data = await this.page.extract(description);
      return data.text;
    }

    // Navigation with waiting
    async navigateTo(path: string): Promise<void> {
      await this.page.goto(path);
      await this.page.waitForLoadState('networkidle');
    }
  }

  Journey-Based Test Structure

  // Example of a marketplace journey test
  async function marketplaceJourneyTest({
    page,
    stagehand
  }: StagehandContext) {
    const marketplacePage = new MarketplacePage(page, stagehand);

    // Navigate to marketplace using existing URL patterns
    await marketplacePage.navigateTo('/marketplace');

    // AI-assisted verification that page loaded correctly
    await page.act('Verify that the marketplace page has loaded with a list of builders');

    // Extract data about builders
    const builderCount = await marketplacePage.extractBuilderCount();
    console.log(`Found ${builderCount} builders`);

    // Filter by expertise using AI
    await page.act('Filter the builders to show only those with React expertise');

    // Verify filtering worked
    const hasReactBuilders = await page.extract('Check if there are builders with React skills visible');
    console.log(`React builders found: ${hasReactBuilders.text.includes('yes')}`);

    // Select a builder profile
    await page.act('Click on the first builder card to view their profile');

    // Verify correct page loaded
    await page.act('Verify that the builder profile page has loaded');
  }

  3. Stagehand-Specific Capabilities

  AI-Driven Visual Verification

  // Visual verification helper
  export async function verifyVisualAppearance(
    page: Page,
    description: string
  ): Promise<boolean> {
    const visualCheck = await page.extract(`
      Examine the page and tell me if ${description}.
      Respond with "yes" or "no" and provide a brief explanation.
    `);

    return visualCheck.text.toLowerCase().includes('yes');
  }

  // Example usage
  await verifyVisualAppearance(
    page,
    'the builder cards are displayed in a responsive grid layout with consistent spacing'
  );

  Dynamic Element Finding

  // Dynamic element location using AI context
  async function findElementWithContext(
    page: Page,
    description: string,
    context: string
  ): Promise<Locator> {
    const results = await page.observe(`
      Find the element that ${description}.
      Context: ${context}
    `);

    return page.locator(results[0].selector);
  }

  // Example usage
  const rateSlider = await findElementWithContext(
    page,
    'is the slider for setting the maximum hourly rate',
    'I am on the marketplace page with the filters panel open'
  );

  Resilient Test Actions

  // Resilient action that retries with different approaches
  async function resilientAction(
    page: Page,
    instruction: string,
    fallbackInstructions: string[] = []
  ): Promise<void> {
    try {
      await page.act(instruction);
    } catch (error) {
      console.log(`Primary action failed: ${error.message}`);

      for (const fallback of fallbackInstructions) {
        try {
          console.log(`Trying fallback: ${fallback}`);
          await page.act(fallback);
          return; // Successful fallback
        } catch (fallbackError) {
          console.log(`Fallback failed: ${fallbackError.message}`);
        }
      }

      throw new Error(`All action attempts failed for: ${instruction}`);
    }
  }

  // Example usage
  await resilientAction(
    page,
    'Click the Book Session button',
    [
      'Click the button that allows booking a session with this builder',
      'Find and click the primary call-to-action button on this profile page'
    ]
  );

  4. Data Management Design

  // Test data manager
  export class TestDataManager {
    constructor(private baseUrl: string) {}

    async setupTestData(dataType: string, options: any = {}): Promise<any> {
      // Make API call to data setup endpoint
      const response = await fetch(`${this.baseUrl}/api/test/setup-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataType,
          options
        })
      });

      return await response.json();
    }

    async cleanupTestData(testId: string): Promise<void> {
      await fetch(`${this.baseUrl}/api/test/cleanup-data?testId=${testId}`, {
        method: 'DELETE'
      });
    }
  }

  // Example usage
  const dataManager = new TestDataManager('http://localhost:3000');
  const testData = await dataManager.setupTestData('marketplace-journey', {
    builderCount: 10,
    withSessionTypes: true
  });

  5. Authentication Strategy

  // Authentication manager
  export class AuthManager {
    constructor(private page: Page) {}

    async loginAs(role: string): Promise<void> {
      // Navigate to auth-test endpoint with role
      await this.page.goto(`/auth-test?role=${role}`);

      // Wait for auth to complete
      await this.page.waitForSelector('[data-testid="auth-success"]');

      // Verify authentication
      const authStatus = await this.page.textContent('[data-testid="auth-status"]');
      if (!authStatus?.includes('authenticated')) {
        throw new Error(`Failed to authenticate as ${role}`);
      }
    }

    async verifyCurrentRole(expectedRole: string): Promise<boolean> {
      const roleText = await this.page.extract('What is the current user role displayed on this page?');
      return roleText.text.toLowerCase().includes(expectedRole.toLowerCase());
    }
  }

## Test Data Strategy and Seeding Approach

For effective Stagehand E2E testing, we need a robust and reliable approach to test data management. Based on the
   existing codebase patterns and Stagehand's needs, here's a comprehensive test data strategy:

  1. Test Data Principles

  - Isolation: Each test should run with isolated data
  - Determinism: Tests should have predictable, consistent data
  - Realism: Data should reflect realistic user scenarios
  - Independence: Tests should not depend on each other's data
  - Cleanup: All test data should be properly cleaned up after tests

  2. Database Isolation Approach

  // Enhanced database isolation for Stagehand tests
  export class DatabaseIsolation {
    private testId: string;
    private baseUrl: string;

    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
      this.testId = `stagehand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Initialize isolated database context
    async initialize(): Promise<void> {
      await fetch(`${this.baseUrl}/api/test/db-isolation/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testId: this.testId })
      });
    }

    // Run function within isolated transaction
    async withIsolation<T>(fn: () => Promise<T>): Promise<T> {
      try {
        await this.initialize();
        return await fn();
      } finally {
        await this.cleanup();
      }
    }

    // Clean up database isolation
    async cleanup(): Promise<void> {
      await fetch(`${this.baseUrl}/api/test/db-isolation/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testId: this.testId })
      });
    }
  }

  3. Test Data Factory System

  // Enhanced data factory for Stagehand tests
  export class TestDataFactory {
    private baseUrl: string;
    private testId: string;

    constructor(baseUrl: string, testId: string) {
      this.baseUrl = baseUrl;
      this.testId = testId;
    }

    // Create builder with required data
    async createBuilder(options: BuilderOptions = {}): Promise<BuilderData> {
      const defaultOptions = {
        name: `Test Builder ${Date.now()}`,
        expertise: ['React', 'Node.js'],
        hourlyRate: 75,
        availability: true,
        withSessionTypes: true,
        testId: this.testId
      };

      const mergedOptions = { ...defaultOptions, ...options };

      const response = await fetch(`${this.baseUrl}/api/test/factory/builders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mergedOptions)
      });

      return await response.json();
    }

    // Create client with required data
    async createClient(options: ClientOptions = {}): Promise<ClientData> {
      const defaultOptions = {
        name: `Test Client ${Date.now()}`,
        testId: this.testId
      };

      const mergedOptions = { ...defaultOptions, ...options };

      const response = await fetch(`${this.baseUrl}/api/test/factory/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mergedOptions)
      });

      return await response.json();
    }

    // Create booking scenario with all required data
    async createBookingScenario(options: BookingScenarioOptions = {}): Promise<BookingScenarioData> {
      const defaultOptions = {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        testId: this.testId
      };

      const mergedOptions = { ...defaultOptions, ...options };

      const response = await fetch(`${this.baseUrl}/api/test/factory/booking-scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mergedOptions)
      });

      return await response.json();
    }
  }

  4. Test Data Presets

  // Test data presets for common scenarios
  export const TestDataPresets = {
    // Marketplace testing preset
    marketplace: {
      builders: [
        {
          name: "Frontend Specialist",
          expertise: ["React", "Vue", "TypeScript"],
          hourlyRate: 85,
          availability: true,
          sessionTypes: [
            { name: "Frontend Consultation", duration: 60, price: 75 },
            { name: "Code Review", duration: 30, price: 45 }
          ]
        },
        {
          name: "Backend Developer",
          expertise: ["Node.js", "Python", "AWS"],
          hourlyRate: 95,
          availability: true,
          sessionTypes: [
            { name: "Architecture Review", duration: 60, price: 95 },
            { name: "Performance Optimization", duration: 90, price: 140 }
          ]
        },
        {
          name: "Full Stack Engineer",
          expertise: ["React", "Node.js", "AWS", "MongoDB"],
          hourlyRate: 110,
          availability: true,
          sessionTypes: [
            { name: "Project Planning", duration: 60, price: 110 },
            { name: "Technical Consultation", duration: 30, price: 60 }
          ]
        }
      ]
    },

    // Booking flow testing preset
    booking: {
      builder: {
        name: "Booking Test Builder",
        expertise: ["React", "Node.js"],
        hourlyRate: 85,
        availability: true,
        sessionTypes: [
          { name: "Initial Consultation", duration: 60, price: 75, calendlyUrl: "https://calendly.com/test/60min"
  },
          { name: "Technical Deep Dive", duration: 90, price: 120, calendlyUrl: "https://calendly.com/test/90min" }
        ]
      },
      client: {
        name: "Booking Test Client",
        email: "client@example.com"
      }
    },

    // Payment testing preset
    payment: {
      successCard: "4242424242424242",
      declineCard: "4000000000000002",
      authenticationRequiredCard: "4000002500003155",
      bookingScenario: {
        status: "PENDING",
        paymentStatus: "PENDING",
        amount: 85.00
      }
    }
  };

  5. API-Based Seeding Approach

  // API-based data seeding for Stagehand tests
  export class TestDataSeeder {
    private baseUrl: string;

    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }

    // Seed data from preset
    async seedFromPreset(presetName: keyof typeof TestDataPresets): Promise<SeedResult> {
      if (!TestDataPresets[presetName]) {
        throw new Error(`Preset "${presetName}" not found`);
      }

      const response = await fetch(`${this.baseUrl}/api/test/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preset: presetName
        })
      });

      return await response.json();
    }

    // Seed custom data
    async seedCustomData(data: any): Promise<SeedResult> {
      const response = await fetch(`${this.baseUrl}/api/test/seed-custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      return await response.json();
    }

    // Clean up seeded data
    async cleanup(seedId: string): Promise<void> {
      await fetch(`${this.baseUrl}/api/test/seed-cleanup?seedId=${seedId}`, {
        method: 'DELETE'
      });
    }
  }

  6. Test API Route Implementation

  We'll need to implement the following API routes to support this strategy:

  1. /api/test/db-isolation/initialize - Creates isolated database context
  2. /api/test/db-isolation/cleanup - Cleans up isolated database context
  3. /api/test/factory/builders - Creates builder test data
  4. /api/test/factory/clients - Creates client test data
  5. /api/test/factory/booking-scenarios - Creates booking scenarios
  6. /api/test/seed - Seeds data from predefined presets
  7. /api/test/seed-custom - Seeds custom test data
  8. /api/test/seed-cleanup - Cleans up seeded test data

  7. Integration with Stagehand Tests

  // Example of a test using the data strategy
  async function bookingFlowTest({
    page,
    stagehand
  }: StagehandContext) {
    const baseUrl = 'http://localhost:3000';
    const dbIsolation = new DatabaseIsolation(baseUrl);

    await dbIsolation.withIsolation(async () => {
      // Create test data factory
      const factory = new TestDataFactory(baseUrl, dbIsolation.testId);

      // Seed test data for booking flow
      const seeder = new TestDataSeeder(baseUrl);
      const seedResult = await seeder.seedFromPreset('booking');

      try {
        // Get builder and session type IDs from seed result
        const builderId = seedResult.data.builder.id;
        const sessionTypeId = seedResult.data.builder.sessionTypes[0].id;

        // Navigate to builder profile
        await page.goto(`${baseUrl}/marketplace/builders/${builderId}`);

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Use AI to select the session type
        await page.act(`Select the session type called "Initial Consultation"`);

        // Click book button
        await page.act(`Click the book session button`);

        // Rest of the test...

      } finally {
        // Clean up seeded data
        await seeder.cleanup(seedResult.seedId);
      }
    });
  }

  8. Mocking External Services

  // Webhook simulator for external services
  export class WebhookSimulator {
    private baseUrl: string;

    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }

    // Simulate Calendly webhook
    async simulateCalendlyWebhook(event: string, payload: any): Promise<Response> {
      return await fetch(`${this.baseUrl}/api/webhooks/calendly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Calendly-Webhook-Signature': this.generateCalendlySignature(payload)
        },
        body: JSON.stringify({
          event,
          payload
        })
      });
    }

    // Simulate Stripe webhook
    async simulateStripeWebhook(eventType: string, data: any): Promise<Response> {
      const payload = {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2022-11-15',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: data
        },
        type: eventType
      };

      return await fetch(`${this.baseUrl}/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': this.generateStripeSignature(payload)
        },
        body: JSON.stringify(payload)
      });
    }

    // Generate Calendly signature
    private generateCalendlySignature(payload: any): string {
      // Implementation would use crypto library
      return 'test-signature';
    }

    // Generate Stripe signature
    private generateStripeSignature(payload: any): string {
      // Implementation would use crypto library
      return `t=${Date.now()},v1=test-signature`;
    }
  }

## Authentication Testing for Different User Roles

Based on the existing authentication system and test infrastructure, I'll now design the authentication strategy
  for Stagehand E2E tests.

  1. Authentication Approach

  // Authentication utility for Stagehand tests
  export class StagehandAuth {
    private page: Page;
    private baseUrl: string;
    private testUsers: Record<string, TestUser>;

    constructor(page: Page, baseUrl: string) {
      this.page = page;
      this.baseUrl = baseUrl;
      this.testUsers = TEST_USER_MATRIX;
    }

    // Authenticate using direct API-based approach
    async authenticateViaApi(role: UserRole): Promise<void> {
      const user = this.testUsers[role];
      if (!user) {
        throw new Error(`No test user found for role: ${role}`);
      }

      // Use the auth-test endpoint to bypass UI-based login
      await this.page.goto(`${this.baseUrl}/auth-test?role=${role}&userId=${user.id}`);

      // Wait for auth to complete
      await this.page.waitForSelector('[data-testid="auth-success"]', { timeout: 10000 });

      // Extract and store the auth state
      const authState = await this.page.evaluate(() => {
        return JSON.parse(localStorage.getItem('clerk.auth') || '{}');
      });

      // Verify authentication succeeded
      if (!authState.token) {
        throw new Error(`Authentication failed for role: ${role}`);
      }

      console.log(`Successfully authenticated as ${role}`);
    }

    // Authenticate using UI-based approach (helpful for testing auth flows directly)
    async authenticateViaUi(role: UserRole): Promise<void> {
      const user = this.testUsers[role];
      if (!user) {
        throw new Error(`No test user found for role: ${role}`);
      }

      // Navigate to login page
      await this.page.goto(`${this.baseUrl}/login`);

      // Use AI to fill in the login form
      await this.page.act(`Enter ${user.email} into the email field`);
      await this.page.act(`Click the continue button`);

      // Handle possible password screen
      const passwordVisible = await this.page.extract(`Is there a password field visible?`);
      if (passwordVisible.text.toLowerCase().includes('yes')) {
        await this.page.act(`Enter ${user.password} into the password field`);
        await this.page.act(`Click the sign in button`);
      }

      // Wait for redirect to dashboard or home page
      await this.page.waitForURL(/.*\/(dashboard|profile|marketplace).*/);

      // Verify authentication
      const isAuthenticated = await this.verifyAuthentication();
      if (!isAuthenticated) {
        throw new Error(`Authentication verification failed for role: ${role}`);
      }

      console.log(`Successfully authenticated as ${role} via UI`);
    }

    // Verify the user is authenticated
    async verifyAuthentication(): Promise<boolean> {
      // Use extract to check for authenticated state
      const authState = await this.page.extract(`
        Determine if the user is currently authenticated on this page.
        Look for user-specific UI elements like profile pictures, account menus, 
        or personalized content. Respond with "yes" or "no" and explain why.
      `);

      return authState.text.toLowerCase().includes('yes');
    }

    // Verify specific user role
    async verifyUserRole(expectedRole: UserRole): Promise<boolean> {
      // Use extract to check for role-specific UI elements
      const roleCheck = await this.page.extract(`
        Determine if the page shows that the user has the role of ${expectedRole}.
        Look for role-specific UI elements or content that would only be shown to a ${expectedRole}.
        Respond with "yes" or "no" and explain why.
      `);

      return roleCheck.text.toLowerCase().includes('yes');
    }

    // Switch roles for multi-role users
    async switchRole(fromRole: UserRole, toRole: UserRole): Promise<void> {
      // Navigate to profile/settings
      await this.page.act(`Navigate to the user profile or settings page`);

      // Use AI to find and activate role switcher
      await this.page.act(`Look for a role switcher or switching control and select the ${toRole} role`);

      // Verify the role switch was successful
      const isRoleSwitched = await this.verifyUserRole(toRole);
      if (!isRoleSwitched) {
        throw new Error(`Failed to switch from ${fromRole} to ${toRole}`);
      }

      console.log(`Successfully switched from ${fromRole} to ${toRole}`);
    }

    // Save authentication state for reuse
    async saveAuthState(role: UserRole): Promise<AuthState> {
      // Extract storage state for reuse
      const storageState = await this.page.context().storageState();

      // Save to file for future tests
      const statePath = path.join(process.cwd(), 'auth-states', `${role.toLowerCase()}.json`);
      await fs.promises.mkdir(path.dirname(statePath), { recursive: true });
      await fs.promises.writeFile(statePath, JSON.stringify(storageState));

      console.log(`Saved auth state for ${role} to ${statePath}`);
      return storageState;
    }

    // Load pre-saved authentication state
    async loadAuthState(role: UserRole): Promise<void> {
      const statePath = path.join(process.cwd(), 'auth-states', `${role.toLowerCase()}.json`);

      try {
        const stateExists = await fs.promises.access(statePath)
          .then(() => true)
          .catch(() => false);

        if (!stateExists) {
          throw new Error(`Auth state file not found for role: ${role}`);
        }

        const storageState = JSON.parse(await fs.promises.readFile(statePath, 'utf-8'));
        await this.page.context().addCookies(storageState.cookies);

        // Apply localStorage and sessionStorage
        await this.page.goto(this.baseUrl);
        await this.page.evaluate((state) => {
          for (const [key, value] of Object.entries(state.origins[0].localStorage)) {
            localStorage.setItem(key, value as string);
          }

          for (const [key, value] of Object.entries(state.origins[0].sessionStorage)) {
            sessionStorage.setItem(key, value as string);
          }
        }, storageState);

        console.log(`Loaded auth state for ${role}`);
      } catch (error) {
        console.error(`Failed to load auth state for ${role}:`, error);
        throw error;
      }
    }
  }

  2. Test User Matrix

  // Test user matrix for Stagehand tests
  export const TEST_USER_MATRIX: Record<UserRole, TestUser> = {
    CLIENT_BASIC: {
      id: '1',
      email: 'client-test1@buildappswith.com',
      password: 'TestClient123!',
      name: 'Client One',
      role: 'CLIENT',
      testData: {
        companyName: 'Test Company One',
        industry: 'Technology'
      }
    },
    CLIENT_PREMIUM: {
      id: '2',
      email: 'premium-client-test1@buildappswith.com',
      password: 'PremiumClient123!',
      name: 'Premium One',
      role: 'CLIENT',
      testData: {
        companyName: 'Premium Ventures One',
        industry: 'Finance',
        premium: true
      }
    },
    BUILDER_NEW: {
      id: '3',
      email: 'new-builder1@buildappswith.com',
      password: 'NewBuilder123!',
      name: 'New Builder1',
      role: 'BUILDER',
      testData: {
        headline: 'Junior Front-End Developer',
        validationTier: 1
      }
    },
    BUILDER_ESTABLISHED: {
      id: '4',
      email: 'established-builder1@buildappswith.com',
      password: 'EstablishedBuilder123!',
      name: 'Established Builder1',
      role: 'BUILDER',
      testData: {
        headline: 'Senior Full Stack AI Developer',
        validationTier: 3,
        featured: true
      }
    },
    ADMIN: {
      id: '5',
      email: 'admin-test1@buildappswith.com',
      password: 'AdminUser123!',
      name: 'Admin One',
      role: 'ADMIN',
      testData: {
        adminLevel: 'super',
        isFounder: true
      }
    },
    DUAL_ROLE: {
      id: '6',
      email: 'client.builder-test1@buildappswith.com',
      password: 'MultiRole123!',
      name: 'Dual Role1',
      role: 'CLIENT',
      alternateRoles: ['BUILDER'],
      testData: {
        companyName: 'Dual Ventures One',
        headline: 'Full Stack Developer & Consultant'
      }
    },
    TRIPLE_ROLE: {
      id: '7',
      email: 'client.builder.admin-test1@buildappswith.com',
      password: 'TripleRole123!',
      name: 'Triple Role1',
      role: 'CLIENT',
      alternateRoles: ['BUILDER', 'ADMIN'],
      testData: {
        companyName: 'Triple Ventures One',
        headline: 'Full Stack Platform Architect',
        adminLevel: 'super'
      }
    }
  };

  3. Role-Based Test Example

  // Example of role-based test for marketplace
  async function testMarketplaceAsClient({
    page,
    stagehand
  }: StagehandContext) {
    const auth = new StagehandAuth(page, 'http://localhost:3000');

    // Authenticate as a client
    await auth.authenticateViaApi('CLIENT_BASIC');

    // Navigate to marketplace
    await page.goto('http://localhost:3000/marketplace');

    // Use AI to find and click a builder card
    await page.act('Find a builder card and click it to view their profile');

    // Verify client-specific UI elements (book button etc.)
    const hasBookingOption = await page.extract(`
      Check if there are booking options available on this page, 
      such as "Book a Session" buttons or session type selection.
      Respond with "yes" or "no" and explain why.
    `);

    console.log(`Client can see booking options: ${hasBookingOption.text.includes('yes')}`);

    // Save authentication state for future tests
    await auth.saveAuthState('CLIENT_BASIC');
  }

  // Example of role-based test for builder dashboard
  async function testBuilderDashboard({
    page,
    stagehand
  }: StagehandContext) {
    const auth = new StagehandAuth(page, 'http://localhost:3000');

    // Authenticate as a builder
    await auth.authenticateViaApi('BUILDER_ESTABLISHED');

    // Navigate to builder dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Verify builder-specific UI elements
    const hasBuilderControls = await page.extract(`
      Check if there are builder-specific controls on this dashboard,
      such as "Manage Sessions", "Update Availability", or "Portfolio".
      Respond with "yes" or "no" and explain why.
    `);

    console.log(`Builder sees dashboard controls: ${hasBuilderControls.text.includes('yes')}`);

    // Save authentication state for future tests
    await auth.saveAuthState('BUILDER_ESTABLISHED');
  }

  // Example of multi-role test
  async function testRoleSwitching({
    page,
    stagehand
  }: StagehandContext) {
    const auth = new StagehandAuth(page, 'http://localhost:3000');

    // Authenticate as a dual-role user
    await auth.authenticateViaApi('DUAL_ROLE');

    // Verify initial role (CLIENT)
    const initialRole = await auth.verifyUserRole('CLIENT');
    console.log(`Initial role is CLIENT: ${initialRole}`);

    // Switch to BUILDER role
    await auth.switchRole('CLIENT', 'BUILDER');

    // Verify new role
    const newRole = await auth.verifyUserRole('BUILDER');
    console.log(`New role is BUILDER: ${newRole}`);

    // Test builder-specific functionality
    await page.goto('http://localhost:3000/dashboard');

    // Verify builder dashboard
    const hasBuilderDashboard = await page.extract(`
      Check if this is a builder dashboard with builder-specific controls.
      Respond with "yes" or "no" and explain why.
    `);

    console.log(`Builder dashboard confirmed: ${hasBuilderDashboard.text.includes('yes')}`);
  }

  4. Authentication Test Strategy

  For testing authentication and user roles with Stagehand, the strategy follows these principles:

  1. Test full UI-based authentication flows through Clerk
  2. Role-Based Visual Verification: Use AI-based verification to check that the correct UI elements are visible
  based on roles.
  3. Auth State Persistence: Store authentication states between test runs to avoid repetitive logins.
  4. Role Switching: Test multi-role users by verifying role switching functionality.
  5. Specialized Tests: For each user role, test:
    - Navigation permissions (can/cannot access specific areas)
    - UI element visibility (role-specific controls)
    - Functional permissions (can/cannot perform specific actions)
  6. Edge Cases:
    - Session expiration handling
    - Permissions boundary testing
    - Authentication error recovery
