'use client'

import { useState, useEffect } from 'react'
import { CalendlyEmbed } from '@/components/scheduling/calendly'
import { Button } from '@/components/ui/core/button'

export default function CalendlyTestPage() {
  const [showEmbed, setShowEmbed] = useState(false)
  
  // Test URLs - both direct and with event type
  const testUrls = [
    {
      name: "Direct Calendly URL",
      url: "https://calendly.com/buildappswith/initial-consultation"
    },
    {
      name: "Calendly with Event Type",
      url: "https://calendly.com/buildappswith/1-on-1-consultation"
    }
  ]
  
  const [selectedUrl, setSelectedUrl] = useState(testUrls[0].url)
  
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-2xl font-bold mb-8">Calendly Integration Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Select Test URL:</h2>
        <div className="space-y-2">
          {testUrls.map((test) => (
            <Button
              key={test.url}
              variant={selectedUrl === test.url ? "default" : "outline"}
              onClick={() => {
                setSelectedUrl(test.url)
                setShowEmbed(false)
              }}
              className="mr-2"
            >
              {test.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Selected URL: {selectedUrl}</p>
        <Button 
          onClick={() => setShowEmbed(!showEmbed)}
          variant="default"
        >
          {showEmbed ? 'Hide' : 'Show'} Calendly Embed
        </Button>
      </div>
      
      {showEmbed && (
        <div className="mt-6">
          <CalendlyEmbed
            url={selectedUrl}
            prefill={{
              name: "Test User",
              email: "test@buildappswith.com",
              timezone: "America/New_York"
            }}
            utm={{
              utmSource: 'test',
              utmMedium: 'website',
              utmCampaign: 'testing'
            }}
            className="h-[600px] w-full"
          />
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            showEmbed,
            selectedUrl,
            windowHasCalendly: typeof window !== 'undefined' && 'Calendly' in window
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}