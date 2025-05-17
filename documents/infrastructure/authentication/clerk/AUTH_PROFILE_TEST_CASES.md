# Auth-Profile Integration Test Cases

This document outlines comprehensive test scenarios for the integration between Clerk authentication and BuilderProfile/ClientProfile data in the Buildappswith platform.

## Test Categories

1. **User Registration and Profile Creation**
2. **Profile Data Synchronization**
3. **Role-Based Access Control**
4. **Profile Updates and Propagation**
5. **Error Handling and Edge Cases**
6. **Performance and Reliability**
7. **Security Testing**

## 1. User Registration and Profile Creation

### Test Case 1.1: New User Registration

**Description:** Verify that when a user registers through Clerk, a corresponding User record is created in the database.

**Prerequisites:**
- Test environment with Clerk configured
- Webhook endpoint configured

**Steps:**
1. Register a new user in Clerk (UI or API)
2. Wait for webhook to be processed
3. Check database for corresponding User record

**Expected Result:**
- User record created with matching email and clerkId
- Default role (CLIENT) assigned
- Email verification status correctly reflected

### Test Case 1.2: Builder Role Assignment

**Description:** Verify that when a user is assigned the BUILDER role, a BuilderProfile is automatically created.

**Prerequisites:**
- Existing user with CLIENT role only

**Steps:**
1. Assign BUILDER role to user (via admin UI or API)
2. Wait for role update to process
3. Check database for new BuilderProfile

**Expected Result:**
- BuilderProfile record created
- Profile linked to user via userId
- Default builder fields initialized

### Test Case 1.3: Profile Initialization on Multiple Roles

**Description:** Verify that if a user is assigned multiple roles simultaneously, all relevant profiles are created.

**Prerequisites:**
- Newly registered user with no roles

**Steps:**
1. Assign both CLIENT and BUILDER roles simultaneously
2. Wait for updates to process
3. Check database for both profile types

**Expected Result:**
- Both ClientProfile and BuilderProfile created
- Both profiles correctly linked to the user

### Test Case 1.4: Duplicate Profile Prevention

**Description:** Verify that the system prevents duplicate profiles if role assignments are sent multiple times.

**Prerequisites:**
- Existing user with CLIENT role and ClientProfile

**Steps:**
1. Assign CLIENT role again (duplicate assignment)
2. Wait for update to process
3. Check database for ClientProfile count

**Expected Result:**
- No duplicate ClientProfile created
- Log entry indicating duplicate role assignment detected

## 2. Profile Data Synchronization

### Test Case 2.1: Basic User Data Sync

**Description:** Verify that changes to user data in Clerk properly sync to the database User record.

**Prerequisites:**
- Existing user with Clerk account and database record

**Steps:**
1. Update user's name in Clerk
2. Wait for webhook event to process
3. Check database User record

**Expected Result:**
- User record name field updated to match Clerk
- Last updated timestamp updated

### Test Case 2.2: Email Change Sync

**Description:** Verify that email changes in Clerk properly sync to the database.

**Prerequisites:**
- Existing user with Clerk account and database record

**Steps:**
1. Add new email to user's Clerk account and set as primary
2. Wait for webhook event to process
3. Check database User record

**Expected Result:**
- User record email field updated to match new primary email
- Email verification status correctly updated

### Test Case 2.3: Profile Picture Sync

**Description:** Verify that profile picture changes in Clerk sync to the database.

**Prerequisites:**
- Existing user with Clerk account and database record

**Steps:**
1. Update user's profile picture in Clerk
2. Wait for webhook event to process
3. Check database User record

**Expected Result:**
- User record image field updated with new profile picture URL

### Test Case 2.4: Bidirectional Data Sync (App to Clerk)

**Description:** Verify that profile updates made in the application sync back to Clerk metadata.

**Prerequisites:**
- Existing user with BuilderProfile

**Steps:**
1. Update builder's hourly rate via application API
2. Check Clerk publicMetadata for updated hourlyRate value

**Expected Result:**
- Clerk publicMetadata contains updated hourlyRate value

### Test Case 2.5: Liam's Email Discrepancy Resolution

**Description:** Test the specific case mentioned where Liam's email differs between systems.

**Prerequisites:**
- Liam's account with email discrepancy (liam@buildappswith.com vs liam@buildappswith.ai)

**Steps:**
1. Trigger email synchronization process
2. Observe resolution behavior
3. Check final state in both systems

**Expected Result:**
- Email addresses reconciled (primary system's email wins)
- Log entry documenting the reconciliation

## 3. Role-Based Access Control

### Test Case 3.1: Builder-Only Features

**Description:** Verify that builder-specific features are only accessible to users with BUILDER role.

**Prerequisites:**
- User with CLIENT role only
- User with BUILDER role

**Steps:**
1. Attempt to access builder dashboard with both users
2. Attempt to perform builder-only actions with both users

**Expected Results:**
- CLIENT user receives access denied / redirect
- BUILDER user can access the dashboard and features

### Test Case 3.2: Admin Controls

**Description:** Verify that admin controls for profiles are only accessible to ADMIN users.

**Prerequisites:**
- Regular user (CLIENT/BUILDER)
- Admin user (with ADMIN role)

**Steps:**
1. Attempt to access profile verification controls with both users
2. Attempt to modify validation tier with both users

**Expected Results:**
- Regular user cannot access admin controls
- Admin user can access and use the controls

### Test Case 3.3: Profile Ownership Restrictions

**Description:** Verify that users can only edit their own profiles (unless admin).

**Prerequisites:**
- Two regular users with profiles
- Admin user

**Steps:**
1. Each user attempts to edit their own profile
2. Each user attempts to edit the other user's profile
3. Admin attempts to edit both profiles

**Expected Results:**
- Users can edit their own profiles
- Users cannot edit other users' profiles
- Admin can edit any profile

### Test Case 3.4: Role Claims in JWT

**Description:** Verify that user roles stored in Clerk are correctly included in the session JWT.

**Prerequisites:**
- Users with various role combinations

**Steps:**
1. Generate session tokens for different users
2. Decode and examine the JWT payload

**Expected Results:**
- JWT claims include the correct user roles
- Role information is accessible to protected API routes

## 4. Profile Updates and Propagation

### Test Case 4.1: Profile Update via API

**Description:** Verify that updates to profile via API are saved and reflected in the UI.

**Prerequisites:**
- Existing BuilderProfile

**Steps:**
1. Send API request to update profile
2. Load profile in UI

**Expected Results:**
- Profile updated in database
- Updated data displayed in UI

### Test Case 4.2: Profile Update Propagation Delay

**Description:** Measure and verify acceptable latency for profile update propagation.

**Prerequisites:**
- Test environment with monitoring

**Steps:**
1. Update profile via API
2. Measure time until changes are visible in UI
3. Test with different update types (text, image, etc.)

**Expected Results:**
- Updates propagate within acceptable timeframe (< 1 second)
- No significant difference between update types

### Test Case 4.3: Concurrent Profile Updates

**Description:** Verify correct handling of concurrent profile updates from different sources.

**Prerequisites:**
- Test environment with capability for concurrent requests

**Steps:**
1. Initiate profile update via web UI
2. Simultaneously update the same profile via API
3. Check final profile state

**Expected Results:**
- No data corruption
- Last write wins or merge strategy applied correctly
- Appropriate error/warning if conflict detected

### Test Case 4.4: Clerk Profile Update Webhook

**Description:** Verify that profile updates via Clerk trigger appropriate webhooks and updates.

**Prerequisites:**
- Existing user with profiles

**Steps:**
1. Update user data in Clerk admin dashboard
2. Check webhook logs for triggered events
3. Verify database updates

**Expected Results:**
- Webhook triggered with correct event type
- Database updated with new information
- No unnecessary updates for unchanged fields

## 5. Error Handling and Edge Cases

### Test Case 5.1: Missing Profile Handling

**Description:** Verify system behavior when a user exists but profile is missing.

**Prerequisites:**
- User record without corresponding profile

**Steps:**
1. Attempt to load profile page for user
2. Check error handling and UI response

**Expected Results:**
- Graceful error handling
- Profile creation prompt if appropriate
- Error logged for investigation

### Test Case 5.2: Clerk Outage Handling

**Description:** Verify system behavior during a Clerk service outage.

**Prerequisites:**
- Test environment with ability to simulate Clerk outage

**Steps:**
1. Simulate Clerk API outage
2. Attempt to access authenticated pages
3. Attempt to update profiles

**Expected Results:**
- Appropriate error messages
- Degraded functionality clearly communicated
- No data loss during outage

### Test Case 5.3: Database Outage Handling

**Description:** Verify system behavior during a database outage.

**Prerequisites:**
- Test environment with ability to simulate database outage

**Steps:**
1. Simulate database outage
2. Attempt to access authenticated pages
3. Observe authentication behavior

**Expected Results:**
- Authentication still functions
- Profile data marked as temporarily unavailable
- Retry mechanisms in place for webhook processing

### Test Case 5.4: WebhookEvent Duplicate Handling

**Description:** Verify system correctly handles duplicate webhook events.

**Prerequisites:**
- Test environment with webhook simulation capability

**Steps:**
1. Simulate a user.updated webhook event
2. Process the event normally
3. Send identical webhook event again
4. Check database for duplicate updates

**Expected Results:**
- Duplicate webhook detected and skipped
- No duplicate database updates
- Event logged for monitoring

### Test Case 5.5: User Deletion Handling

**Description:** Verify proper handling of user deletion in Clerk.

**Prerequisites:**
- User with profiles in database

**Steps:**
1. Delete user in Clerk
2. Observe webhook processing
3. Check database state

**Expected Results:**
- User marked as deleted in database (not hard deleted)
- Associated profiles marked as inactive
- User content preserved but no longer publicly accessible

## 6. Performance and Reliability

### Test Case 6.1: High Volume Registration

**Description:** Verify system handles high volume of simultaneous user registrations.

**Prerequisites:**
- Load testing environment

**Steps:**
1. Simulate 100+ user registrations in a short period
2. Monitor webhook processing
3. Check database for complete and accurate user records

**Expected Results:**
- All registrations processed correctly
- No webhook events missed
- Database consistency maintained

### Test Case 6.2: Webhook Processing Latency

**Description:** Measure and verify webhook processing latency under various loads.

**Prerequisites:**
- Test environment with monitoring

**Steps:**
1. Send webhook events at different volumes (1, 10, 50 per minute)
2. Measure time from event to database update
3. Chart performance degradation

**Expected Results:**
- Webhook processing completes within acceptable timeframe (< 2 seconds)
- Linear or sub-linear degradation under load
- No webhook failures due to timeout

### Test Case 6.3: Profile Data Load Performance

**Description:** Verify profile data loading performance with authentication integration.

**Prerequisites:**
- Profiles with various data volumes

**Steps:**
1. Measure time to load profiles with authentication data
2. Test with various profile complexities
3. Test with different authenticated and non-authenticated states

**Expected Results:**
- Profile load time within acceptable limits (< 500ms)
- Authenticated and non-authenticated load times comparable
- Performance scales reasonably with profile complexity

### Test Case 6.4: Long-term Webhook Reliability

**Description:** Verify webhook processing reliability over extended periods.

**Prerequisites:**
- Test environment running for 24+ hours

**Steps:**
1. Monitor webhook processing for 24+ hour period
2. Randomly introduce network hiccups
3. Check for missed events or processing errors

**Expected Results:**
- No webhook events lost during extended operation
- Recovery after network interruptions
- Consistent processing times throughout testing period

## 7. Security Testing

### Test Case 7.1: Webhook Signature Verification

**Description:** Verify webhook endpoint properly validates signatures.

**Prerequisites:**
- Test environment with webhook simulation capability

**Steps:**
1. Send valid webhook with proper signature
2. Send webhook with invalid/tampered signature
3. Send webhook with missing signature headers

**Expected Results:**
- Valid webhook accepted and processed
- Invalid signature webhook rejected
- Missing signature webhook rejected

### Test Case 7.2: Profile Access Control

**Description:** Verify proper access controls for profile data.

**Prerequisites:**
- Users with different roles and permissions

**Steps:**
1. Attempt to access profiles with various authentication states
2. Attempt to edit profiles with various authentication states
3. Attempt to access admin features with various roles

**Expected Results:**
- Public profile data accessible to all
- Private profile data protected
- Edit functionality restricted to owners and admins
- Admin features restricted to admins only

### Test Case 7.3: API Authentication Headers

**Description:** Verify API routes properly validate authentication headers.

**Prerequisites:**
- Test environment with API testing capability

**Steps:**
1. Send API requests with valid auth headers
2. Send API requests with invalid auth headers
3. Send API requests with missing auth headers

**Expected Results:**
- Valid auth headers accepted
- Invalid auth headers rejected
- Missing auth headers rejected for protected routes

### Test Case 7.4: Sensitive Data Exposure

**Description:** Verify no sensitive user data is exposed in responses.

**Prerequisites:**
- User with complete profile including private data

**Steps:**
1. Fetch profile data via public API
2. Examine response for sensitive data fields
3. Check client-side rendered profile for data leakage

**Expected Results:**
- No sensitive data exposed in responses
- Private fields properly filtered based on viewer permission
- No PII in client-side source code

## Implementation Plan

### Phase 1: Core Authentication Tests

1. Implement test cases 1.1-1.4 (Registration and Profile Creation)
2. Implement test cases 3.1-3.4 (Role-Based Access Control)
3. Implement test cases 7.1-7.4 (Security)

### Phase 2: Data Synchronization Tests

1. Implement test cases 2.1-2.5 (Profile Data Synchronization)
2. Implement test cases 4.1-4.4 (Profile Updates and Propagation)

### Phase 3: Reliability and Edge Cases

1. Implement test cases 5.1-5.5 (Error Handling and Edge Cases)
2. Implement test cases 6.1-6.4 (Performance and Reliability)

## Test Environment Requirements

1. **Development Environment:**
   - Local Clerk application instance
   - Local database
   - Webhook simulation capability

2. **Integration Test Environment:**
   - Dedicated Clerk test instance
   - Test database instance
   - Mocked external services

3. **Tools and Frameworks:**
   - Vitest for unit and integration tests
   - Playwright for E2E testing
   - Custom webhook simulation utility
   - Load testing framework

## Specific Email Discrepancy Test Case

Since there's a specific mention of email discrepancy between Clerk and the database for Liam's account, here's a detailed test case:

### Test Case: Liam's Email Synchronization

**Description:** Test the synchronization between different email addresses for Liam's account.

**Prerequisites:**
- Liam's account exists in Clerk with email liam@buildappswith.ai
- Liam's account exists in database with email liam@buildappswith.com
- Both accounts linked via clerkId

**Steps:**
1. Trigger the email synchronization process (can be automated or manual)
2. Monitor the webhook processing logs
3. Check the final state in both Clerk and the database
4. Verify user sessions and logins continue to work

**Expected Results (Based on Designed Priority):**
- If Clerk is authoritative for email: Database updated to liam@buildappswith.ai
- If Database is authoritative for email: Clerk updated to liam@buildappswith.com
- If newest timestamp wins: Email with most recent verification/update becomes primary
- All user data remains properly associated
- User can log in with the synchronized email

**Validation:**
- Check database User record email field
- Check Clerk user primary email
- Attempt login with the surviving email address
- Verify profiles and associated data are accessible

## Conclusion

These test cases provide a comprehensive approach to validating the integration between Clerk authentication and profile data in the Buildappswith platform. By systematically testing these scenarios, we can ensure a reliable, secure, and performant user experience that maintains data consistency across systems.

The test plan should be executed in phases, starting with core functionality and expanding to edge cases and performance testing. Special attention should be paid to the specific email discrepancy case mentioned for Liam's account, as this provides a real-world example of the synchronization challenges that need to be addressed.