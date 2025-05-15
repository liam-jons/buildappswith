'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/core/card'
import { LoadingSpinner } from '@/components/ui/core/loading-spinner'
import Script from 'next/script'

interface CalendlyEmbedOptimizedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    timezone?: string;
    customAnswers?: {
      a1?: string; // Booking ID
      pathway?: string; // Selected pathway
      [key: string]: string | undefined;
    };
  };
  utm?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  };
  height?: string;
  className?: string;
  onEventScheduled?: (event: any) => void;
}

declare global {
  interface Window {
    Calendly: any;
  }
}

export function CalendlyEmbedOptimized({
  url,
  prefill,
  utm,
  height = "600px",
  className,
  onEventScheduled
}: CalendlyEmbedOptimizedProps) {
  const embedRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const initCalendly = () => {
      if (!window.Calendly || !embedRef.current || !url) {
        console.error('Missing required elements for Calendly initialization')
        setHasError(true)
        return
      }

      // Clear any existing content
      embedRef.current.innerHTML = ''

      // Prepare prefill data
      const prefillData: any = {}
      if (prefill?.name) prefillData.name = prefill.name
      if (prefill?.email) prefillData.email = prefill.email
      if (prefill?.timezone) prefillData.timezone = prefill.timezone
      
      // Add custom answers
      if (prefill?.customAnswers) {
        Object.entries(prefill.customAnswers).forEach(([key, value]) => {
          if (value !== undefined) {
            prefillData[key] = value
          }
        })
      }

      // Prepare UTM parameters
      const utmParams: any = {}
      if (utm?.utmSource) utmParams.utm_source = utm.utmSource
      if (utm?.utmMedium) utmParams.utm_medium = utm.utmMedium
      if (utm?.utmCampaign) utmParams.utm_campaign = utm.utmCampaign
      if (utm?.utmContent) utmParams.utm_content = utm.utmContent
      if (utm?.utmTerm) utmParams.utm_term = utm.utmTerm

      // Format URL correctly
      let formattedUrl = url
      if (!url.startsWith('http')) {
        // If it's just the slug, construct full URL
        formattedUrl = url.startsWith('/')
          ? `https://calendly.com/liam-buildappswith${url}`
          : `https://calendly.com/liam-buildappswith/${url}`
      }

      try {
        // Initialize Calendly widget with optimized parameters
        window.Calendly.initInlineWidget({
          url: formattedUrl,
          parentElement: embedRef.current,
          prefill: prefillData,
          utm: utmParams,
          // This is the key to avoid showing the full Calendly site
          // Use inline parameters instead of popup parameters
          embedType: 'Inline',
          hideEventTypeDetails: false,
          hideLandingPageDetails: true,
          hideGdprBanner: true,
          // Style parameters
          primaryColor: '1e3a8a', // Blue-900 to match our theme
          textColor: '1f2937', // Gray-800
          backgroundColor: 'ffffff',
          // Ensure proper sizing
          height,
          // Disable Calendly's own resize listener to prevent conflicts
          resize: false
        })

        setIsLoading(false)
        console.log('Calendly widget initialized successfully')
      } catch (error) {
        console.error('Error initializing Calendly:', error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    // Listen for event scheduled messages
    const handleMessage = (e: MessageEvent) => {
      if (e.data.event === 'calendly.event_scheduled' && onEventScheduled) {
        onEventScheduled(e.data.payload)
      }
    }

    // Wait for script to load
    const checkAndInit = () => {
      if (window.Calendly) {
        initCalendly()
        window.addEventListener('message', handleMessage)
      } else {
        // Retry after a short delay
        setTimeout(checkAndInit, 100)
      }
    }

    checkAndInit()

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [url, prefill, utm, height, onEventScheduled])

  if (hasError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load scheduling calendar</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onError={() => setHasError(true)}
      />
      
      <Card className={className}>
        <CardContent className="p-0 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <LoadingSpinner className="h-8 w-8" />
              <span className="ml-2">Loading calendar...</span>
            </div>
          )}
          
          <div 
            ref={embedRef}
            className="calendly-inline-widget"
            style={{ 
              width: '100%',
              height,
              // Ensure the iframe fills the container properly
              position: 'relative'
            }}
            data-auto-load="false"
          />
        </CardContent>
      </Card>

      <style jsx global>{`
        /* Ensure Calendly iframe fills container */
        .calendly-inline-widget iframe {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Hide any Calendly branding if needed */
        .calendly-badge-widget {
          display: none !important;
        }
      `}</style>
    </>
  )
}