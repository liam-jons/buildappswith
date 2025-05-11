/**
 * Script to check the marketplace API in the production deployment
 */

const fetch = require('node-fetch');

async function checkProductionAPI() {
  const productionURL = 'https://buildappswith.vercel.app'; // Production deployment URL
  
  try {
    console.log('Checking production marketplace API...');
    
    // Check marketplace builders endpoint
    const buildersResponse = await fetch(`${productionURL}/api/marketplace/builders?limit=10`);
    const buildersData = await buildersResponse.json();
    
    console.log('Production Marketplace API Response:');
    console.log(JSON.stringify(buildersData, null, 2));
    
    // Check if there are any builders returned
    if (buildersData.data && buildersData.data.length > 0) {
      console.log(`Success: Found ${buildersData.data.length} builders in production API`);
    } else {
      console.log('Warning: No builders found in production API response');
      
      // Check pagination info
      if (buildersData.pagination) {
        console.log('Pagination info:');
        console.log(buildersData.pagination);
      }
    }
    
    // Check marketplace filters endpoint
    const filtersResponse = await fetch(`${productionURL}/api/marketplace/filters`);
    const filtersData = await filtersResponse.json();
    
    console.log('\nProduction Marketplace Filters:');
    console.log(JSON.stringify(filtersData, null, 2));
    
  } catch (error) {
    console.error('Error checking production API:', error);
  }
}

checkProductionAPI();