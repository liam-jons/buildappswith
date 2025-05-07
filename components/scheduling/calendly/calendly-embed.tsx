'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/core/card'
import { LoadingSpinner } from '@/components/ui/core/loading-spinner'
import Script from 'next/script'

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    timezone?: string;
  };
  utm?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  };
  className?: string;
  onEventScheduled?: (event: any) => void;
}

/**
 * Calendly embed component that loads and displays the Calendly scheduling widget
 */
const CalendlyEmbed: React.FC<CalendlyEmbedProps> = ({
  url,
  prefill,
  utm,
  className = '',
  onEventScheduled
}) => {
  const embedRef = useRef<HTMLDivElement>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false)
  
  // Function to initialize Calendly widget
  const initCalendly = () => {
    if (!embedRef.current || !window.Calendly || !isScriptLoaded) return
    
    // Clear any existing widget
    embedRef.current.innerHTML = ''
    
    // Get prefill data
    const prefillData: { [key: string]: string } = {}
    
    if (prefill?.name) prefillData.name = prefill.name
    if (prefill?.email) prefillData.email = prefill.email
    if (prefill?.timezone) prefillData.timezone = prefill.timezone
    
    // Get UTM data
    const utmParams: { [key: string]: string } = {}
    
    if (utm?.utmSource) utmParams.utm_source = utm.utmSource
    if (utm?.utmMedium) utmParams.utm_medium = utm.utmMedium
    if (utm?.utmCampaign) utmParams.utm_campaign = utm.utmCampaign
    if (utm?.utmContent) utmParams.utm_content = utm.utmContent
    if (utm?.utmTerm) utmParams.utm_term = utm.utmTerm
    
    // Initialize the widget
    window.Calendly.initInlineWidget({
      url: url,
      parentElement: embedRef.current,
      prefill: prefillData,
      utm: utmParams
    })
    
    // Set loaded state
    setIsWidgetLoaded(true)
  }
  
  // Register event listener for event scheduled
  useEffect(() => {
    if (!isScriptLoaded || !onEventScheduled) return
    
    const handleEventScheduled = (e: any) => {
      if (e.data.event === 'calendly:event_scheduled') {
        onEventScheduled(e.data)
      }
    }
    
    window.addEventListener('message', handleEventScheduled)
    
    return () => {
      window.removeEventListener('message', handleEventScheduled)
    }
  }, [isScriptLoaded, onEventScheduled])
  
  // Initialize widget when script loads or URL changes
  useEffect(() => {
    if (isScriptLoaded) {
      initCalendly()
    }
  }, [isScriptLoaded, url])

  return (
    <>
      {/* Load Calendly script */}
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js" 
        onLoad={() => setIsScriptLoaded(true)}
      />
      
      {/* Widget container */}
      <Card className={className}>
        <CardContent className="p-0 min-h-[600px] relative">
          {!isWidgetLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <LoadingSpinner className="h-8 w-8" />
              <span className="ml-2">Loading calendar...</span>
            </div>
          )}
          
          <div 
            ref={embedRef} 
            className="calendly-inline-widget" 
            style={{ minHeight: '600px', height: '100%', width: '100%' }}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default CalendlyEmbed

// Add TypeScript types for Calendly
declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
        utm?: Record<string, string>;
      }) => void;
    };
  }
}