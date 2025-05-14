# Database Migration and Synchronization Planning Session

- Session Type: Planning
- Component Focus: Production Database Migration & Synchronization Strategy
- Current Branch: feature/marketplace-setup
- Related Documentation: /docs/MARKETPLACE_VISIBILITY_INVESTIGATION.md, /scripts/debug-production-marketplace.js, /scripts/check-marketplace-visibility.js
- Project root directory: /Users/liamj/Documents/development/buildappswith

## Critical Issue Summary

The production marketplace is showing "0 of 1 builders" despite profiles existing in the database. Investigation revealed a **Prisma schema mismatch** where production database is missing columns that the local schema expects:
- Error: `The column BuilderProfile.completedProjects does not exist in the current database`
- Affected fields: `completedProjects`, `responseRate`, potentially others
- Root cause: Development and production databases are out of sync

## Planning Objectives

1. **Complete Database Audit**
   - Identify ALL schema differences between development and production
   - Document any orphaned migrations or inconsistent states
   - Catalog any scripts that bypass proper migration processes

2. **Clean Slate Strategy**
   - Evaluate wiping production database and replicating development
   - Document exact steps for data preservation (if needed)
   - Plan for proper seeding of demo accounts with Builder profiles

3. **Migration Infrastructure**
   - Design automated migration strategy for ongoing synchronization
   - Implement checks to prevent future dev/prod drift
   - Establish proper CI/CD pipeline for database changes

4. **Verification Framework**
   - Create automated verification scripts
   - Implement pre-deployment checks
   - Design monitoring for schema consistency

## Current State Analysis

### Development Environment
- 18 Builder profiles (including demo accounts)
- All required fields present in schema
- Marketplace functioning correctly

### Production Environment
- 1 Builder profile (Liam)
- Missing critical schema fields
- Marketplace queries failing due to schema mismatch

### Existing Issues
- Migrations applied to dev but not production
- Manual SQL scripts creating drift
- No automated verification of schema consistency
- Prisma schema doesn't match actual database structure

## Planning Requirements

### 1. Database Reset Strategy

Since production only has one real user (Liam), consider:
- Complete production database reset
- Full schema replication from development
- Proper data migration for essential records
- Automated seeding of demo accounts

### 2. Migration Management

Establish proper migration workflow:
- Single source of truth for schema (Prisma)
- Automated migration application
- Version control for all database changes
- Rollback procedures

### 3. Synchronization Tools

Evaluate and implement:
- Neon branch management for staging
- Automated schema comparison tools
- CI/CD integration for database changes
- Monitoring and alerting for drift

### 4. Demo Account Management

Plan for proper demo accounts:
- User records with `isDemo: true`
- Associated BuilderProfile records
- Clerk authentication for demo accounts
- Proper marketplace visibility

## Technical Considerations

### Schema Management
```prisma
// Example of fields causing issues
model BuilderProfile {
  // ... existing fields ...
  completedProjects Int @default(0)
  responseRate      Decimal?
  slug              String?
  clerkUserId       String?
}
```

### Migration Scripts to Remove/Update
- `/scripts/add-marketplace-fields.js`
- `/scripts/fix-builder-visibility.js`
- Any manual SQL scripts bypassing Prisma

### Automated Verification
```javascript
// Example verification script structure
async function verifySchemaConsistency() {
  const devSchema = await getDevSchema();
  const prodSchema = await getProdSchema();
  const differences = compareSchemas(devSchema, prodSchema);
  
  if (differences.length > 0) {
    throw new Error('Schema mismatch detected');
  }
}
```

## Key Questions for Implementation

1. **Data Preservation**
   - Do we need to preserve any production data besides Liam's account?
   - Can we use Neon's branching for safe testing?

2. **Migration Strategy**
   - Should we use Prisma migrations exclusively going forward?
   - How do we handle environment-specific configurations?

3. **Automation Level**
   - What level of automation is appropriate for a 2-person team?
   - Which third-party tools best support our needs?

4. **Verification Process**
   - How often should we verify schema consistency?
   - What alerts should trigger on drift detection?

## Expected Outcomes

1. **Immediate Actions**
   - Production database matches development exactly
   - All Builder profiles visible in marketplace
   - No schema-related errors

2. **Long-term Infrastructure**
   - Automated migration pipeline
   - Schema consistency monitoring
   - Proper version control for database changes
   - Clear documentation for database operations

3. **Process Improvements**
   - No manual SQL scripts
   - All changes through Prisma migrations
   - Automated verification before deployments
   - Clear rollback procedures

## Implementation Notes

**CRITICAL**: This is pre-launch preparation - NO WORKAROUNDS ALLOWED. We need:
- Complete schema synchronization
- Proper migration infrastructure
- Automated verification processes
- Clear operational procedures

Rule #1: Check what exists first, then implement proper solutions. The error is definitively a schema mismatch, not related to data values (searchable, isDemo, etc.).

## Resources and Examples

### Current Debug Scripts
- `/scripts/check-marketplace-visibility.js` - Shows data exists
- `/scripts/debug-production-marketplace.js` - Revealed schema error
- `/scripts/investigate-marketplace-api.js` - Confirmed API issues

### Error Example
```
PrismaClientKnownRequestError: 
The column `BuilderProfile.completedProjects` does not exist in the current database.
```

### Successful Query Pattern
```javascript
// This works in development but fails in production
const builders = await prisma.builderProfile.findMany({
  where: { searchable: true },
  include: { user: true }
});
```

## Next Session Requirements

The implementation session should:
1. Execute the complete database synchronization
2. Implement automated migration processes
3. Establish monitoring and verification
4. Document all procedures clearly
5. Test marketplace functionality thoroughly

Remember: We're building for a 2-person team. Solutions should be automated, maintainable, and focused on preventing future issues rather than fixing them after they occur.