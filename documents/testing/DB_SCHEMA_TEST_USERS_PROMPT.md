# Database Schema Alignment and Test User Creation Prompt

## Session Context

- Session Type: Configuration & Testing Setup
- Component Focus: Database Schema Validation and Test User Provisioning
- Current Branch: feature/testing-implementation
- Related Documentation: /docs/testing/TESTING_IMPLEMENTATION_SUMMARY.md, /docs/DATABASE_EXAMPLES.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

## Implementation Objectives

- Validate database schema alignment across development and test environments
- Create standardized test users in Clerk for comprehensive testing
- Ensure consistent user data between database and authentication provider
- Document test user credentials for future testing
- Establish a pattern for maintaining test data consistency

## Implementation Plan

### 1. Database Schema Validation

- Confirm Prisma schema matches current database structure
- Verify required fields for user profiles are consistent
- Ensure foreign key relationships are properly defined
- Document schema differences between environments
- Create migration plan for any required schema changes

### 2. Test User Creation in Clerk

- Define standard test user roles and attributes
- Create test users in Clerk development environment
- Set appropriate permission levels for each test user
- Document test user credentials securely
- Configure test user profiles with sample data

### 3. User-Database Synchronization

- Ensure Clerk user IDs are properly synced to database records
- Verify webhook integration for user profile updates
- Test user creation and profile synchronization flow
- Document the user data flow between Clerk and database
- Implement monitoring for synchronization issues

### 4. Test Data Seeding

- Create reproducible test data for each user role
- Define seeding scripts for various testing scenarios
- Document test data schema and expected state
- Implement tools for test environment reset
- Ensure consistency between seeded data and test cases

### 5. Testing Configuration

- Configure test environment variables for Clerk integration
- Document authentication workflows for automated testing
- Establish patterns for testing authenticated endpoints
- Update test utilities to support authentication contexts
- Create examples of authenticated test patterns

## Technical Specifications

### User Role Matrix

The following user roles should be created in Clerk:

| Role | Description | Permissions | Testing Focus |
|------|-------------|-------------|--------------|
| Client | Standard client user | Browse marketplace, book sessions | Booking flow, payments |
| Premium Client | Client with premium features | All client + premium features | Subscription features |
| New Builder | Recently joined builder | Create profile, set availability | Onboarding flow |
| Established Builder | Builder with complete profile | Manage bookings, earnings | Builder dashboard |
| Admin | System administrator | Access admin panel, manage users | Admin features |
| Multi-Role | User with multiple roles | Switch between roles | Role switching, permissions |

### User Profile Data Structure

Each test user should have the following profile data:

```typescript
interface TestUserProfile {
  name: string;
  email: string;
  password: string; // For documentation only, never store
  role: string[];
  metadata: {
    verified: boolean;
    onboardingComplete: boolean;
    profileCompleteness: number;
  };
  databaseFields: {
    // Fields that should exist in the database
    id: string;
    clerkId: string;
    profileData: Record<string, any>;
  };
}
```

### Database-Auth Provider Mapping

Ensure the following mappings between Clerk and database:

1. Clerk `user.id` → Database `User.clerkId`
2. Clerk `user.primaryEmailAddress` → Database `User.email`
3. Clerk `user.firstName + lastName` → Database `User.name`
4. Clerk `user.publicMetadata.roles` → Database `UserRole` records

### Test Data Seeding Pattern

Use the following pattern for test data seeding:

```typescript
// Test seeding function
async function seedTestUser(user: TestUserProfile) {
  // 1. Create or find Clerk user
  // 2. Create or update database user record
  // 3. Generate associated test data
  //    - Profiles
  //    - Bookings
  //    - SessionTypes
  //    - Payments
  // 4. Return references to created entities
}
```

## Implementation Notes

1. **Environment Separation**: Ensure clear separation between development, testing, and production environments in Clerk
2. **Credentials Security**: Store test credentials securely, never in version control
3. **Idempotent Operations**: Make seeding scripts re-runnable without duplication
4. **Cleanup Procedures**: Include methods to clean up test data
5. **Webhook Testing**: Verify Clerk webhooks for profile synchronization
6. **Migration Safety**: Ensure schema changes don't affect production data

## Expected Outputs

- Validated database schema with any needed migrations
- Complete set of test users created in Clerk development environment
- Documented test user credentials and attributes
- Test data seeding scripts for various scenarios
- Updated test utilities supporting authenticated testing
- Documentation of auth-database synchronization patterns
- Configuration guide for setting up new test environments

## Success Criteria

1. All test users can successfully authenticate in test environment
2. User profile data is correctly synchronized between Clerk and database
3. Test data seeding scripts consistently create expected state
4. Test suites can run using the created test users
5. Documentation enables any team member to understand test user setup
6. Schema validation confirms consistent structure across environments

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance.