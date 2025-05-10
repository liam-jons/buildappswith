# Database Field Discrepancy Resolution Implementation Prompt

## Context

I'm working on the "buildappswith" application that uses Next.js, Prisma ORM, and a Neon PostgreSQL database. The application currently experiences critical errors when accessing the Marketplace page, resulting in an infinite loop and `PrismaClientValidationError`. Initial analysis indicates a mismatch between field names expected in the codebase (`imageUrl`) and actual database schema (`image`).

## Request

Please help me implement a comprehensive solution to resolve these database field discrepancies, specifically focusing on the `image` vs `imageUrl` issue in the User model that's causing errors in the Marketplace page.

## Project Structure

- `/prisma/schema.prisma`: Database schema definition
- `/lib/db.ts`: Database client configuration
- `/lib/marketplace/data/marketplace-service.ts`: Service with the problematic queries
- `/app/(platform)/marketplace/page.tsx`: Page experiencing the errors
- `/components/marketplace/builder-list.tsx`: Component rendering the data

## Current Error

When accessing the Marketplace page, the application enters an infinite loop, with console errors showing:

```
PrismaClientValidationError: Unknown field `imageUrl` for select on the `User` model.
```

The issue appears to be that the code is trying to query a field named `imageUrl` in the User model, but the actual field in the database schema is named `image`.

## Detailed Implementation Tasks

Please follow this implementation plan:

1. **Diagnosis and Validation**
   - Create a diagnostic script to verify database connection and introspect schema
   - Examine the current prisma schema and compare with the actual database structure
   - Search for all occurrences of the problematic field name in the codebase

2. **Field Mapper Implementation**
   - Create a field mapper utility to maintain compatibility between code expectations and database schema
   - The utility should handle transformation of `image` to `imageUrl` fields
   - Ensure robust error handling in the mapper

3. **Service Layer Updates**
   - Modify the marketplace service to use the field mapper 
   - Update queries to use the correct field names from the database
   - Add comprehensive error handling with fallback strategies

4. **Testing and Validation**
   - Create utility to verify the solution works correctly
   - Test the Marketplace page to ensure it loads without errors

## Example Implementation Ideas

Here are some examples of what I'm looking for:

1. A field mapper utility like:
   ```typescript
   // Field mapper function for user records
   export function mapUserFields(user) {
     if (!user) return user;
     
     const mappedUser = {...user};
     
     // Map image field to imageUrl for compatibility
     if ('image' in user && !('imageUrl' in user)) {
       mappedUser.imageUrl = user.image;
     }
     
     return mappedUser;
   }
   ```

2. Updated marketplace service:
   ```typescript
   // Modified query to use correct field name
   const users = await db.user.findMany({
     select: {
       id: true,
       name: true,
       image: true, // Using correct field from database
     }
   });
   
   // Apply mapper to align with code expectations
   return users.map(mapUserFields);
   ```

3. Diagnostic script:
   ```javascript
   // Script to verify database schema
   async function validateSchema() {
     const userFields = await prisma.$queryRaw`
       SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'User'
     `;
     
     console.log('User fields in database:', userFields);
   }
   ```

## Specific Questions to Address

1. What is the exact schema discrepancy between the codebase and database?
2. What's the most robust approach to handle the field name mismatch?
3. Should we update the database schema or adapt the code to match the schema?
4. How can we prevent similar issues in the future?
5. What error handling strategies should we implement for resiliency?

## Desired Outcome

1. Marketplace page loads successfully without errors
2. A robust field mapping solution that handles discrepancies 
3. Comprehensive error handling for database operations
4. Documentation for the solution and approach to prevent future issues

## Technical Requirements

- TypeScript-based solution with proper typing
- Prisma-compatible approach 
- Next.js App Router compatibility
- Production-ready error handling
- Low-overhead solution that doesn't impact performance

Thank you for your assistance with this implementation!