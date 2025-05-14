// Test script to check the marketplace API directly from production
// This helps test if the API is working without frontend interference

async function testMarketplaceAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buildappswith.com';
  
  console.log('=== MARKETPLACE API DIRECT TEST ===');
  console.log('Base URL:', baseUrl);
  
  try {
    // Test 1: Basic API call
    console.log('\n1. Testing basic API call:');
    const response1 = await fetch(`${baseUrl}/api/marketplace/builders?limit=5`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log('   Response status:', response1.status);
    console.log('   Response headers:', response1.headers);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('   Success:', data1.success);
      console.log('   Data count:', data1.data?.length || 0);
      console.log('   Total builders:', data1.pagination?.total || 0);
      
      if (data1.data && data1.data.length > 0) {
        console.log('   First builder:', {
          id: data1.data[0].id,
          name: data1.data[0].name,
          displayName: data1.data[0].displayName,
          searchable: data1.data[0].searchable
        });
      }
    } else {
      console.log('   Error response body:', await response1.text());
    }
    
    // Test 2: With search parameter
    console.log('\n2. Testing with search parameter:');
    const response2 = await fetch(`${baseUrl}/api/marketplace/builders?search=Liam`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log('   Response status:', response2.status);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('   Data count:', data2.data?.length || 0);
      console.log('   Total found:', data2.pagination?.total || 0);
    }
    
    // Test 3: With all builders (searchable=true implicit)
    console.log('\n3. Testing all searchable builders:');
    const response3 = await fetch(`${baseUrl}/api/marketplace/builders?page=1&limit=20`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log('   Response status:', response3.status);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('   Total searchable builders:', data3.pagination?.total || 0);
      console.log('   First page count:', data3.data?.length || 0);
    }
    
    // Test 4: Check if the API is properly routed
    console.log('\n4. Testing API routing:');
    const response4 = await fetch(`${baseUrl}/api/marketplace`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log('   Base marketplace API status:', response4.status);
    
  } catch (error) {
    console.error('\nERROR testing API:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n=== API TEST COMPLETE ===');
}

// Run the test
testMarketplaceAPI().catch(console.error);