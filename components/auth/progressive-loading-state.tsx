"use client";

import { useState, useEffect } from "react";

interface ProgressiveLoadingStateProps {
  state?: 'initializing' | 'connecting' | 'timeout';
}

/**
 * Progressive loading state component
 * Shows meaningful loading indicators with proper feedback
 */
export default function ProgressiveLoadingState({ state = 'initializing' }: ProgressiveLoadingStateProps) {
  const [stage, setStage] = useState<'initializing' | 'connecting' | 'timeout'>(state);
  const [networkCheck, setNetworkCheck] = useState<'checking' | 'online' | 'offline'>('checking');
  
  useEffect(() => {
    // Update state based on props
    setStage(state);
    
    // Initial network check
    const checkNetwork = () => {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
        setNetworkCheck(navigator.onLine ? 'online' : 'offline');
      } else {
        setNetworkCheck('online'); // Assume online if can't determine
      }
    };
    
    checkNetwork();
    
    // Add listener for online/offline events
    window.addEventListener('online', () => setNetworkCheck('online'));
    window.addEventListener('offline', () => setNetworkCheck('offline'));
    
    // After 3 seconds, consider it a timeout
    const timeoutTimer = setTimeout(() => {
      if (stage !== 'timeout') {
        setStage('timeout');
      }
    }, 3000);
    
    return () => {
      window.removeEventListener('online', () => setNetworkCheck('online'));
      window.removeEventListener('offline', () => setNetworkCheck('offline'));
      clearTimeout(timeoutTimer);
    };
  }, [state]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        
        {/* Network status indicator */}
        {networkCheck === 'offline' && (
          <div className="mt-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
            You're offline. Check your connection.
          </div>
        )}
        
        {/* Progressive messaging based on stage */}
        {stage === 'initializing' && (
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
        )}
        
        {stage === 'connecting' && (
          <p className="text-sm text-muted-foreground">Connecting to authentication service...</p>
        )}
        
        {stage === 'timeout' && (
          <div className="mt-2 max-w-md text-center">
            <p className="text-sm text-muted-foreground">
              Authentication is taking longer than expected.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This may be due to network conditions or service availability.
              The application will continue to load when ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}