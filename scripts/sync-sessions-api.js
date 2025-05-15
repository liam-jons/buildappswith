async function syncSessions() {
  try {
    const response = await fetch('https://buildappswith.ai/api/scheduling/sessions/sync', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('Sync Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error syncing sessions:', error);
  }
}

syncSessions();