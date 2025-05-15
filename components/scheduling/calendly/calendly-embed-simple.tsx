'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { Card, CardContent } from '@/components/ui/core/card'
import { LoadingSpinner } from '@/components/ui/core/loading-spinner'

interface CalendlyEmbedSimpleProps {
  url: string;
  className?: string;
}

/**
 * Simplified Calendly embed using data-url approach
 */
export default function CalendlyEmbedSimple({ url, className = '' }: CalendlyEmbedSimpleProps) {
  // Ensure URL has correct format
  const fullUrl = url.startsWith('http') 
    ? url 
    : url.startsWith('/')
      ? `https://calendly.com/liam-buildappswith${url}`
      : `https://calendly.com/${url}`;
  
  useEffect(() => {
    console.log('CalendlyEmbedSimple mounting with URL:', fullUrl);
  }, [fullUrl]);

  return (
    <>
      {/* Load Calendly script */}
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Calendly script loaded (simple)')}
        onError={(e) => console.error('Failed to load Calendly script (simple):', e)}
      />
      
      {/* Widget container using data-url */}
      <Card className={className}>
        <CardContent className="p-0 min-h-[600px] relative">
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <LoadingSpinner className="h-8 w-8" />
            <span className="ml-2">Loading calendar...</span>
          </div>
          
          <div 
            className="calendly-inline-widget" 
            data-url={fullUrl}
            style={{ minHeight: '600px', height: '100%', width: '100%' }}
          />
        </CardContent>
      </Card>
    </>
  )
}