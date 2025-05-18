  Production Test Data Management Strategy

  1. Test Data Principles

  // production-test-data.ts
  export const TestDataPrinciples = {
    // Key principles for production test data
    ISOLATED: "Test data must be isolated from real user data",
    IDENTIFIABLE: "Test data must be clearly identifiable with test prefixes/flags",
    CLEAN_UP: "All test data must be cleaned up after test completion",
    DETERMINISTIC: "Tests should create deterministic, reproducible data",
    MINIMAL_DEPENDENCIES: "Minimize external dependencies for test data"
  };

  // Test data scopes
  export enum TestDataScope {
    EPHEMERAL = "ephemeral", // Exists only during test execution (preferred)
    PERSISTENT_SESSION = "persistent_session", // Persists for the test session
    PERSISTENT_ENVIRONMENT = "persistent_environment" // Long-lived test fixtures
  }

  2. Production-Safe Test Data Manager

  /**
   * Production-safe test data manager
   * 
   * This implementation ensures test data safety in production by:
   * 1. Applying clear test prefixes to all created data
   * 2. Using feature-flag protected API endpoints
   * 3. Implementing strict timeouts for ephemeral data
   * 4. Supporting test data shadowing to avoid modifying production data
   */
  export class ProductionTestDataManager {
    private testId: string;
    private testPrefix: string = "stagehand_test_";
    private testCreationTime = Date.now();
    private createdData: Array<{
      type: string;
      id: string;
      scope: TestDataScope;
    }> = [];

    constructor(private baseUrl: string, private options: {
      scope?: TestDataScope;
      maxAgeMinutes?: number;
      testUserEmail?: string;
    } = {}) {
      // Generate a unique test ID
      this.testId = `${this.testPrefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.options.scope = this.options.scope || TestDataScope.EPHEMERAL;
      this.options.maxAgeMinutes = this.options.maxAgeMinutes || 60; // Default 1 hour max age
    }

    /**
     * Initializes the test environment
     */
    async initialize(): Promise<void> {
      // Verify test API endpoint access
      const response = await fetch(`${this.baseUrl}/api/test/verify-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-ID': this.testId
        },
        body: JSON.stringify({
          testId: this.testId,
          scope: this.options.scope,
          maxAgeMinutes: this.options.maxAgeMinutes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Test environment initialization failed: ${error.message}`);
      }

      // Register cleanup hook for ephemeral data
      if (this.options.scope === TestDataScope.EPHEMERAL) {
        // Set timeout to ensure cleanup even if tests fail
        setTimeout(() => this.cleanup(), this.options.maxAgeMinutes! * 60 * 1000);
      }
    }

    /**
     * Creates a test builder with necessary production configuration
     */
    async createTestBuilder(options: Partial<BuilderProfile> = {}): Promise<BuilderProfile> {
      const testName = options.name || `Test Builder ${Date.now()}`;

      const response = await fetch(`${this.baseUrl}/api/test/builders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-ID': this.testId
        },
        body: JSON.stringify({
          testId: this.testId,
          name: `${this.testPrefix}${testName}`,
          email: options.email || `${this.testId.toLowerCase()}@example.com`,
          expertise: options.expertise || ['React', 'Node.js'],
          hourlyRate: options.hourlyRate || 85,
          availability: options.availability !== undefined ? options.availability : true,
          isTest: true, // Explicit test flag
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create test builder: ${error.message}`);
      }

      const createdBuilder = await response.json();

      // Register for cleanup
      this.createdData.push({
        type: 'builder',
        id: createdBuilder.id,
        scope: this.options.scope!
      });

      return createdBuilder;
    }

    /**
     * Creates session types for a builder with production-safe settings
     */
    async createSessionTypes(builderId: string, options: Partial<SessionTypeOptions>[] = []): Promise<SessionType[]> {
      if (options.length === 0) {
        options = [{
          name: 'Initial Consultation',
          duration: 60,
          price: 75,
          calendlyUrl: 'https://calendly.com/test/60min',
          isTest: true
        }];
      }

      // Ensure all session types have test markers
      const testSessionTypes = options.map(type => ({
        ...type,
        name: type.name?.includes(this.testPrefix) ? type.name : `${this.testPrefix}${type.name}`,
        isTest: true
      }));

      const response = await fetch(`${this.baseUrl}/api/test/session-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-ID': this.testId
        },
        body: JSON.stringify({
          testId: this.testId,
          builderId,
          sessionTypes: testSessionTypes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create test session types: ${error.message}`);
      }

      const createdSessionTypes = await response.json();

      // Register for cleanup
      createdSessionTypes.forEach((sessionType: any) => {
        this.createdData.push({
          type: 'sessionType',
          id: sessionType.id,
          scope: this.options.scope!
        });
      });

      return createdSessionTypes;
    }

    /**
     * Creates a complete booking scenario with all required entities
     */
    async createBookingScenario(options: Partial<BookingScenarioOptions> = {}): Promise<BookingScenario> {
      const response = await fetch(`${this.baseUrl}/api/test/booking-scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-ID': this.testId
        },
        body: JSON.stringify({
          testId: this.testId,
          status: options.status || 'PENDING',
          paymentStatus: options.paymentStatus || 'PENDING',
          includeDependencies: true,
          isTest: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create test booking scenario: ${error.message}`);
      }

      const scenario = await response.json();

      // Register all created entities for cleanup
      Object.entries(scenario.entities).forEach(([type, entities]: [string, any[]]) => {
        entities.forEach(entity => {
          this.createdData.push({
            type,
            id: entity.id,
            scope: this.options.scope!
          });
        });
      });

      return scenario;
    }

    /**
     * Creates a test client user with Clerk integration
     */
    async createTestClient(options: Partial<ClientProfile> = {}): Promise<ClientProfile> {
      const testName = options.name || `Test Client ${Date.now()}`;
      const testEmail = options.email || `${this.testId.toLowerCase()}_client@example.com`;

      const response = await fetch(`${this.baseUrl}/api/test/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-ID': this.testId
        },
        body: JSON.stringify({
          testId: this.testId,
          name: `${this.testPrefix}${testName}`,
          email: testEmail,
          isTest: true,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create test client: ${error.message}`);
      }

      const createdClient = await response.json();

      // Register for cleanup
      this.createdData.push({
        type: 'client',
        id: createdClient.id,
        scope: this.options.scope!
      });

      return createdClient;
    }

    /**
     * Safely clean up all test data created during this test session
     */
    async cleanup(): Promise<void> {
      if (this.createdData.length === 0) {
        return;
      }

      try {
        const response = await fetch(`${this.baseUrl}/api/test/cleanup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true',
            'X-Test-ID': this.testId
          },
          body: JSON.stringify({
            testId: this.testId,
            createdData: this.createdData,
            // Only allow cleanup of data created in the last maxAgeMinutes
            maxAgeMinutes: this.options.maxAgeMinutes,
            testCreationTime: this.testCreationTime
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`Warning: Failed to clean up some test data: ${error.message}`);
        } else {
          this.createdData = [];
        }
      } catch (error) {
        console.error('Failed to clean up test data:', error);
      }
    }

    /**
     * Get test ID for correlation
     */
    getTestId(): string {
      return this.testId;
    }
  }

  3. Production API Implementation

  // api/test/route.ts
  import { NextRequest, NextResponse } from 'next/server';
  import prisma from '@/lib/db';
  import { getServerAuth } from '@/lib/auth/express/server-auth';
  import { isTestEnvironmentAllowed } from '@/lib/feature-flags';

  const TEST_PREFIX = 'stagehand_test_';
  const MAX_TEST_AGE_HOURS = 24; // Maximum age for any test data

  export async function POST(request: NextRequest) {
    // Verify test mode is enabled via feature flag
    if (!isTestEnvironmentAllowed()) {
      return NextResponse.json(
        { error: 'Test mode is not enabled in this environment' },
        { status: 403 }
      );
    }

    const testId = request.headers.get('X-Test-ID');
    if (!testId || !testId.startsWith(TEST_PREFIX)) {
      return NextResponse.json(
        { error: 'Invalid or missing test ID' },
        { status: 400 }
      );
    }

    // Get request info
    const data = await request.json();

    // Ensure test data is properly marked and limited
    const maxAgeMinutes = Math.min(data.maxAgeMinutes || 60, MAX_TEST_AGE_HOURS * 60);
    const testCreationTime = data.testCreationTime || Date.now();

    // Verify test is not too old
    const testAgeMs = Date.now() - testCreationTime;
    if (testAgeMs > maxAgeMinutes * 60 * 1000) {
      return NextResponse.json(
        { error: 'Test data is too old to modify' },
        { status: 400 }
      );
    }

    // Handle specific test operations
    const operation = request.nextUrl.pathname.split('/').pop();

    switch (operation) {
      case 'verify-access':
        return NextResponse.json({ success: true, testId });

      case 'builders':
        return handleBuilderCreation(data, testId);

      case 'session-types':
        return handleSessionTypeCreation(data, testId);

      case 'booking-scenarios':
        return handleBookingScenarioCreation(data, testId);

      case 'clients':
        return handleClientCreation(data, testId);

      case 'cleanup':
        return handleCleanup(data, testId);

      default:
        return NextResponse.json(
          { error: 'Unknown test operation' },
          { status: 400 }
        );
    }
  }

  // Implement specific handler functions...

  4. CI/CD Integration for Test Data Management

  // ci-cd-integration.ts
  export class CiCdIntegration {
    /**
     * Set up test data for CI/CD pipeline
     */
    static async prepareCiCdTestData(
      environment: 'development' | 'staging' | 'production',
      buildId: string
    ): Promise<void> {
      // Create test data manager specifically for CI/CD
      const baseUrl = getEnvironmentUrl(environment);
      const testDataManager = new ProductionTestDataManager(baseUrl, {
        scope: TestDataScope.PERSISTENT_ENVIRONMENT,
        maxAgeMinutes: 60 * 24, // 24 hours max for CI/CD test data
        testUserEmail: `ci-${buildId}@example.com`
      });

      try {
        // Initialize test environment
        await testDataManager.initialize();

        // Set up test user accounts if needed
        if (environment !== 'production') {
          // Create test users for all roles
          const builder = await testDataManager.createTestBuilder({
            name: `CI Builder ${buildId}`,
            email: `ci-builder-${buildId}@example.com`
          });

          await testDataManager.createSessionTypes(builder.id);

          const client = await testDataManager.createTestClient({
            name: `CI Client ${buildId}`,
            email: `ci-client-${buildId}@example.com`
          });

          console.log(`Created CI test accounts for build ${buildId}`);
        } else {
          // In production, use shadow test mode that doesn't create actual accounts
          console.log(`Set up production shadow test mode for build ${buildId}`);
        }

        // Save test IDs to environment variables for test runs
        await writeEnvironmentFile(environment, {
          TEST_ID: testDataManager.getTestId(),
          TEST_BUILD_ID: buildId
        });

      } catch (error) {
        console.error(`Failed to set up CI/CD test data: ${error.message}`);
        throw error;
      }
    }

    /**
     * Clean up test data after CI/CD pipeline completes
     */
    static async cleanupCiCdTestData(
      environment: 'development' | 'staging' | 'production',
      buildId: string
    ): Promise<void> {
      // Load test IDs from environment
      const envVars = await readEnvironmentFile(environment);

      if (!envVars.TEST_ID) {
        console.log('No test data to clean up');
        return;
      }

      const baseUrl = getEnvironmentUrl(environment);

      try {
        // Explicitly clean up CI/CD test data
        await fetch(`${baseUrl}/api/test/cleanup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true',
            'X-Test-ID': envVars.TEST_ID
          },
          body: JSON.stringify({
            testId: envVars.TEST_ID,
            buildId
          })
        });

        console.log(`Cleaned up CI/CD test data for build ${buildId}`);
      } catch (error) {
        console.error(`Failed to clean up CI/CD test data: ${error.message}`);
      }
    }
  }