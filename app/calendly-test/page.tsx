'use client';

import { useState } from 'react';
import CalendlyEmbed from '@/components/scheduling/calendly/calendly-embed';
import CalendlyEmbedSimple from '@/components/scheduling/calendly/calendly-embed-simple';
import CalendlyEmbedNative from '@/components/scheduling/calendly/calendly-embed-native';

export default function CalendlyTestPage() {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [embedType, setEmbedType] = useState<'advanced' | 'simple' | 'native'>('advanced');
  
  // Test URLs from the database - testing both formats
  const testUrls = [
    'liam-buildappswith/getting-started-businesses',
    'liam-buildappswith/getting-started-individuals',
    'liam-buildappswith/back-to-work-session',
    '/getting-started-businesses', // old format
    'https://calendly.com/liam-buildappswith/getting-started-businesses' // full URL
  ];
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Calendly Integration Test (Public)</h1>
      
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
      
      <div className="mb-4">
        <p className="mb-2">Select embed type:</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="embedType"
              value="advanced"
              checked={embedType === 'advanced'}
              onChange={(e) => setEmbedType('advanced')}
            />
            <span>Advanced</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="embedType"
              value="simple"
              checked={embedType === 'simple'}
              onChange={(e) => setEmbedType('simple')}
            />
            <span>Simple</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="embedType"
              value="native"
              checked={embedType === 'native'}
              onChange={(e) => setEmbedType('native')}
            />
            <span>Native</span>
          </label>
        </div>
      </div>
      
      {selectedUrl && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Testing URL: {selectedUrl}</h2>
          <p className="mb-2 text-sm text-gray-600">Using: {embedType} version</p>
          
          {embedType === 'simple' ? (
            <CalendlyEmbedSimple url={selectedUrl} />
          ) : embedType === 'native' ? (
            <CalendlyEmbedNative url={selectedUrl} />
          ) : (
            <CalendlyEmbed
              url={selectedUrl}
              prefill={{
                name: 'Test User',
                email: 'test@example.com',
                customAnswers: {
                  a1: 'test-booking-id',
                  pathway: 'test'
                }
              }}
              onEventScheduled={(event) => {
                console.log('Event scheduled:', event);
                alert('Event scheduled successfully!');
              }}
            />
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <p>Check the browser console for detailed logs.</p>
        <p>Current URL: {selectedUrl || 'None selected'}</p>
        <p className="mt-2 text-sm text-gray-600">
          This is a public test page - no authentication required.
        </p>
      </div>
    </div>
  );
}