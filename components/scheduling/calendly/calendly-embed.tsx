'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/core/card'
import { LoadingSpinner } from '@/components/ui/core/loading-spinner'
import Script from 'next/script'
import { CalendlyEvent, CalendlyQuestionAnswer } from './calendly-model'

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

// Interface definitions moved to calendly-model.ts

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
  const [attemptCount, setAttemptCount] = useState(0)
  
  // Function to initialize Calendly widget
  const initCalendly = () => {
    console.log('initCalendly called', {
      hasRef: !!embedRef.current,
      hasCalendly: !!window.Calendly,
      isScriptLoaded,
      url,
      embedRefDetails: embedRef.current,
      attemptCount
    });
    
    if (!embedRef.current || !window.Calendly || !isScriptLoaded) {
      console.log('Calendly init skipped:', { 
        hasRef: !!embedRef.current, 
        hasCalendly: !!window.Calendly, 
        isScriptLoaded,
        refDetails: embedRef.current 
      });
      
      // Retry a few times if the ref isn't ready yet
      if (attemptCount < 5 && isScriptLoaded && embedRef.current && !window.Calendly) {
        console.log(`Retrying Calendly initialization (attempt ${attemptCount + 1})`);
        setAttemptCount(prev => prev + 1);
        setTimeout(() => initCalendly(), 500);
      }
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
    
    // Log what we're passing to Calendly
    console.log('Initializing Calendly with:', {
      url,
      parentElement: embedRef.current,
      prefill: prefillData,
      utm: utmParamsObject
    });
    
    // Initialize the widget
    try {
      // Ensure URL has correct format
      const fullUrl = url.startsWith('http') 
        ? url 
        : url.startsWith('/')
          ? `https://calendly.com/liam-buildappswith${url}`
          : `https://calendly.com/${url}`;
      
      console.log('Initializing with full URL:', fullUrl);
      
      window.Calendly.initInlineWidget({
        url: fullUrl,
        parentElement: embedRef.current,
        prefill: prefillData,
        utm: utmParamsObject,
        hideEventTypeDetails: false,
        hideLandingPageDetails: true,
        hideGdprBanner: true,
        backgroundColor: 'ffffff',
        textColor: '000000',
        primaryColor: '0066cc'
      });
      console.log('Calendly initialized successfully');
    } catch (error) {
      console.error('Calendly initialization error:', error);
    }
    
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
    if (isScriptLoaded && url) {
      // Reset attempt count when URL changes
      setAttemptCount(0);
      
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Check if Calendly will auto-initialize with data-url
        if (window.Calendly && window.Calendly.initInlineWidget) {
          initCalendly();
        } else {
          console.log('Calendly auto-initialization via data-url');
          // The widget should auto-initialize with data-url attribute
          setIsWidgetLoaded(true);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isScriptLoaded, url])

  return (
    <>
      {/* Load Calendly script */}
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js" 
        onLoad={() => {
          console.log('Calendly script loaded, checking for window.Calendly');
          // Add a delay to ensure Calendly is fully initialized
          setTimeout(() => {
            console.log('window.Calendly available:', !!window.Calendly);
            setIsScriptLoaded(true);
          }, 100);
        }}
        onError={(e) => {
          console.error('Failed to load Calendly script:', e);
        }}
        strategy="afterInteractive"
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
            data-url={url.startsWith('http') ? url : url.startsWith('/') ? `https://calendly.com/liam-buildappswith${url}` : `https://calendly.com/${url}`}
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