// Script to debug the API endpoint for a specific builder ID
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Debugging builder ID API endpoint...');
    
    // 1. Get all searchable builders from the database
    const searchableBuilders = await prisma.builderProfile.findMany({
      where: {
        searchable: true,
      },
      include: {
        user: true,
        sessionTypes: true,
      },
      take: 3  // Just get a few for testing
    });
    
    console.log(`Found ${searchableBuilders.length} searchable builders for testing`);
    
    // 2. Test each one against the API
    console.log('\nTesting API endpoints for each builder:');
    for (const builder of searchableBuilders) {
      console.log(`\nTesting builder: ${builder.user.name || 'Unknown'} (ID: ${builder.id})`);
      
      // Test direct database query first to see what it returns
      console.log('Direct database query test:');
      const dbBuilder = await prisma.builderProfile.findUnique({
        where: { id: builder.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            }
          },
          sessionTypes: true,
        }
      });
      
      const hasMissingFields = !dbBuilder.user || 
                              !dbBuilder.user.name ||
                              !dbBuilder.expertiseAreas;
      
      console.log(`Database query result: ${dbBuilder ? 'Found' : 'Not found'}`);
      console.log(`Has missing critical fields: ${hasMissingFields}`);
      
      // Now test API endpoint
      try {
        const apiUrl = `http://localhost:3000/api/marketplace/builders/${builder.id}`;
        console.log(`Testing API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        console.log(`API response status: ${response.status}`);
        
        const responseText = await response.text();
        console.log(`API response length: ${responseText.length} characters`);
        
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(responseText);
          console.log('API returned valid JSON');
          console.log(`Success flag: ${jsonData.success}`);
          console.log(`Has data: ${!!jsonData.data}`);
          
          if (jsonData.data) {
            console.log(`Data preview: ${JSON.stringify(jsonData.data).substring(0, 100)}...`);
          }
        } catch (parseError) {
          console.log('API did not return valid JSON:');
          console.log(responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''));
        }
      } catch (apiError) {
        console.log(`API error: ${apiError.message}`);
      }
    }
    
    // 3. Directly test the marketplace service function
    console.log('\nTesting marketplace service function directly:');
    
    // We need to require the marketplace service
    // This is just an example - actual implementation would need to handle imports
    try {
      // Attempt to dynamically import (might not work in Node.js without special configuration)
      // Test a direct database query instead
      const testBuilderId = searchableBuilders[0].id;
      console.log(`Testing direct Prisma query for ID: ${testBuilderId}`);
      
      const directResult = await prisma.builderProfile.findUnique({
        where: { id: testBuilderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true, 
              imageUrl: true
            }
          },
          sessionTypes: true,
        }
      });
      
      if (directResult) {
        console.log('Direct Prisma query succeeded');
        // Check for undefined fields that might cause errors
        const checkField = (obj, field) => typeof obj[field] === 'undefined' ? 'MISSING' : 'present';
        
        const fieldChecks = {
          id: checkField(directResult, 'id'),
          userId: checkField(directResult, 'userId'),
          user: directResult.user ? 'present' : 'MISSING',
          userName: directResult.user ? checkField(directResult.user, 'name') : 'MISSING',
          userEmail: directResult.user ? checkField(directResult.user, 'email') : 'MISSING',
          userImageUrl: directResult.user ? checkField(directResult.user, 'imageUrl') : 'MISSING',
          expertiseAreas: checkField(directResult, 'expertiseAreas'), 
          sessionTypes: directResult.sessionTypes && directResult.sessionTypes.length > 0 ? 'present' : 'MISSING'
        };
        
        console.log('Field presence check:', fieldChecks);
      } else {
        console.log('Direct Prisma query returned null');
      }
    } catch (importError) {
      console.log(`Error testing marketplace service: ${importError.message}`);
    }
    
  } catch (error) {
    console.error('Error debugging builder ID endpoint:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });