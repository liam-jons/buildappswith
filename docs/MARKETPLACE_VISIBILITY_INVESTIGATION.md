# Marketplace Visibility Investigation - Critical Production Issue

## Issue Summary
Builders exist in production database but don't appear in the marketplace UI, showing "0 of 1 builders".

## Investigation Findings

### 1. Code Analysis Summary

#### API Flow:
1. **Client**: `useBuilderSearch` hook → `fetchBuilders` (marketplace/api.ts)
2. **API**: `/api/marketplace/builders` route → `fetchBuilders` (marketplace-service.ts)
3. **Database**: Prisma query with `searchable: true` filter

#### Debug Logging Already Present:
The marketplace-service.ts file contains extensive debug logging:
- Line 28-30: Environment and database URL logging
- Line 166-167: Count query debugging
- Line 169-176: Schema field inspection
- Line 195-196: Full query debugging
- Line 199-203: Profile existence checks
- Line 206-220: Specific Liam profile check

### 2. Key Observations

1. **UI Shows "0 of 1 builders"**: This indicates:
   - The API is responding (no error state)
   - The total count returns 1
   - But the data array is empty

2. **Middleware Not Blocking**: 
   - Marketplace API routes are properly marked as public
   - Routes `/api/marketplace/builders` are in publicRoutes array

3. **Client-Side No Filtering**:
   - BuilderListClient simply displays what it receives
   - No additional client-side filtering that would hide results

### 3. Root Cause Analysis

The most likely issue is **Inconsistent Query Results** where:
- The COUNT query returns 1 (line 177 in marketplace-service.ts)
- But the findMany query returns empty array (line 222)

This could happen if:
1. The `searchable` field is `false` but count doesn't check it properly
2. The User relationship fails to load in findMany but not in count
3. Permission/visibility logic differs between count and findMany

### 4. Debug Scripts Created

1. **check-marketplace-visibility.js**: Basic database check
2. **investigate-marketplace-api.js**: API endpoint testing  
3. **debug-production-marketplace.js**: Comprehensive production debug

### 5. Critical Issue Found

The issue appears to be in the pagination response structure. The service returns:
```javascript
{
  data: builderListings,  // This is empty
  pagination: {
    total: total,         // This shows 1
    // ...
  }
}
```

The count query might be counting all profiles while the findMany query filters by `searchable: true`.

## Immediate Action Items

1. **Run debug scripts in production** to verify:
   - Value of `searchable` field for all profiles
   - Whether count and findMany return same results
   - API response structure

2. **Check Production Logs** for the debug output already in the code

3. **Quick Fix Options**:
   ```javascript
   // Option 1: Update searchable field
   UPDATE "BuilderProfile" SET searchable = true WHERE "userId" = 'liam-user-id';
   
   // Option 2: Modify query to match count behavior
   where: {
     // Remove or make searchable optional
     searchable: true // This might be the issue
   }
   ```

## Debug Scripts

### 1. Basic Visibility Check (check-marketplace-visibility.js)
```javascript
// Run this to check database state
node scripts/check-marketplace-visibility.js
```

### 2. API Endpoint Test (investigate-marketplace-api.js)
```javascript
// Run this to test API directly
node scripts/investigate-marketplace-api.js
```

### 3. Comprehensive Debug (debug-production-marketplace.js)
```javascript
// Run this for full diagnosis
node scripts/debug-production-marketplace.js
```

## Long-term Recommendations

1. **Add Monitoring**: Track when builders appear in count but not in data
2. **Improve Error Handling**: Make inconsistent results more visible
3. **Add Health Check**: Endpoint to verify marketplace query consistency
4. **Schema Validation**: Ensure all required fields have proper defaults

## Conclusion

The issue is likely a data inconsistency where the `searchable` field is `false` for profiles, causing them to appear in counts but not in the actual query results. The existing debug logs should provide immediate insights, and running the debug scripts will confirm this hypothesis and provide the exact fix needed.