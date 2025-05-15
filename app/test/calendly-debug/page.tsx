'use client';

import { useState } from 'react';
import CalendlyEmbed from '@/components/scheduling/calendly/calendly-embed';

export default function CalendlyDebugPage() {
  const [selectedUrl, setSelectedUrl] = useState('');
  
  // Test URLs from the database
  const testUrls = [
    'https://calendly.com/liam-buildappswith/getting-started-businesses',
    'https://calendly.com/liam-buildappswith/getting-started-individuals',
    'https://calendly.com/liam-buildappswith/back-to-work-session'
  ];
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Calendly Integration Debug</h1>
      
      <div className="mb-6">
        <p className="mb-2">Select a test URL:</p>
        <select 
          className="border p-2 rounded w-full max-w-md"
          value={selectedUrl}
          onChange={(e) => setSelectedUrl(e.target.value)}
        >
          <option value="">Select a session type</option>
          {testUrls.map((url) => (
            <option key={url} value={url}>
              {url.split('/').pop()}
            </option>
          ))}
        </select>
      </div>
      
      {selectedUrl && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Testing URL: {selectedUrl}</h2>
          <CalendlyEmbed
            url={selectedUrl}
            prefill={{
              name: 'Test User',
              email: 'test@example.com',
              customAnswers: {
                a1: 'test-booking-id'
              }
            }}
            onEventScheduled={(event) => {
              console.log('Event scheduled:', event);
              alert('Event scheduled successfully!');
            }}
          />
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <p>Check the browser console for detailed logs.</p>
        <p>Current URL: {selectedUrl || 'None selected'}</p>
      </div>
    </div>
  );
}