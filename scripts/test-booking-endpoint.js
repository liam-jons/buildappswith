async function testBookingEndpoint() {
  try {
    // Test if we can fetch builder data and session types
    const builderId = 'cmacaujmz00018oa34hehwic1'; // Liam's builder ID
    
    console.log(`Testing booking endpoint for builder: ${builderId}`);
    
    // Try to fetch the booking page data
    const response = await fetch(`https://buildappswith.ai/api/marketplace/builders/${builderId}/session-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Session types:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Response text:', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBookingEndpoint();