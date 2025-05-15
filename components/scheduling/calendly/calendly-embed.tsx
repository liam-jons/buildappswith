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
  utmParams?: {
    utmContent?: string;
    [key: string]: string | undefined;
  };
  className?: string;
  onEventScheduled?: (event: CalendlyEvent) => void;
}

export interface CalendlyEvent {
  uri: string;
  invitee: {
    uri: string;
    email: string;
    name: string;
  };
  start_time: string;
  end_time: string;
  event_type_uuid: string;
  questions_and_answers?: CalendlyQuestionAnswer[];
}

export interface CalendlyQuestionAnswer {
  question: string;
  answer: string;
  position: number;
}

/**
 * Calendly embed component that loads and displays the Calendly scheduling widget
 * Enhanced to support pathway data and custom questions
 */
const CalendlyEmbed: React.FC<CalendlyEmbedProps> = ({
  url,
  prefill,
  utm,
  utmParams,
  className = '',
  onEventScheduled
}) => {
  const embedRef = useRef<HTMLDivElement>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false)
  
  // Function to initialize Calendly widget
  const initCalendly = () => {
    if (!embedRef.current || !window.Calendly || !isScriptLoaded) {
      console.log('Calendly init skipped:', { hasRef: !!embedRef.current, hasCalendly: !!window.Calendly, isScriptLoaded });
      return;
    }
    
    // Clear any existing widget
    embedRef.current.innerHTML = ''
    
    // Get prefill data
    const prefillData: { [key: string]: string } = {}
    
    if (prefill?.name) prefillData.name = prefill.name
    if (prefill?.email) prefillData.email = prefill.email
    if (prefill?.timezone) prefillData.timezone = prefill.timezone
    
    // Add custom answers if provided
    if (prefill?.customAnswers) {
      Object.entries(prefill.customAnswers).forEach(([key, value]) => {
        if (value !== undefined) {
          prefillData[key] = value;
        }
      });
    }
    
    // Get UTM data from both sources
    const utmParamsObject: { [key: string]: string } = {}
    
    // Legacy utm prop
    if (utm?.utmSource) utmParamsObject.utm_source = utm.utmSource
    if (utm?.utmMedium) utmParamsObject.utm_medium = utm.utmMedium
    if (utm?.utmCampaign) utmParamsObject.utm_campaign = utm.utmCampaign
    if (utm?.utmContent) utmParamsObject.utm_content = utm.utmContent
    if (utm?.utmTerm) utmParamsObject.utm_term = utm.utmTerm
    
    // New utmParams prop
    if (utmParams) {
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value !== undefined) {
          utmParamsObject[key] = value;
        }
      });
    }
    
    // Initialize the widget
    window.Calendly.initInlineWidget({
      url: url,
      parentElement: embedRef.current,
      prefill: prefillData,
      utm: utmParamsObject
    })
    
    // Set loaded state
    setIsWidgetLoaded(true)
  }
  
  // Register event listener for event scheduled
  useEffect(() => {
    if (!isScriptLoaded || !onEventScheduled) return
    
    const handleEventScheduled = (e: MessageEvent) => {
      if (e.data.event === 'calendly.event_scheduled') {
        // Extract the event details
        const eventData: CalendlyEvent = {
          uri: e.data.payload.event.uri,
          invitee: {
            uri: e.data.payload.invitee.uri,
            email: e.data.payload.invitee.email,
            name: e.data.payload.invitee.name
          },
          start_time: e.data.payload.event.start_time,
          end_time: e.data.payload.event.end_time,
          event_type_uuid: e.data.payload.event.event_type_uuid,
          questions_and_answers: e.data.payload.questions_and_answers
        };
        
        onEventScheduled(eventData);
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
  }, [isScriptLoaded, url, prefill])

  return (
    <>
      {/* Load Calendly script */}
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js" 
        onLoad={() => setIsScriptLoaded(true)}
        strategy="lazyOnload"
      />
      
      {/* Widget container */}
      <Card className={className}>
        <CardContent className="p-0 min-h-[600px] relative">
          {!isWidgetLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
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
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
        utm?: Record<string, string>;
      }) => void;
    };
  }
}