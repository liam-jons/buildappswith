'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/core/card'

interface CalendlyEmbedNativeProps {
  url: string;
  className?: string;
}

/**
 * Native Calendly embed using HTML script tag approach
 */
export default function CalendlyEmbedNative({ url, className = '' }: CalendlyEmbedNativeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create and append script tag
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Calendly script loaded via native approach');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  
  // Format URL
  const fullUrl = url.startsWith('http') 
    ? url 
    : `https://calendly.com/${url}`;
  
  return (
    <Card className={className}>
      <CardContent className="p-0 min-h-[600px]">
        <div 
          ref={containerRef}
          className="calendly-inline-widget" 
          data-url={fullUrl}
          style={{ minHeight: '600px', height: '100%', width: '100%' }}
        />
      </CardContent>
    </Card>
  );
}