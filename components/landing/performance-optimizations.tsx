"use client";

import { useEffect, useState, useRef, memo, Suspense, lazy } from "react";
import { cn } from "@/lib/utils";

// Lazy load images with blur up effect
interface BlurImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function BlurImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || !imageRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (imageRef.current) {
            imageRef.current.src = src;
            observer.unobserve(entry.target);
          }
        }
      });
    });

    observer.observe(imageRef.current);

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src, priority]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imageRef}
        src={priority ? src : ""}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        loading={priority ? "eager" : "lazy"}
      />
      <div
        className={cn(
          "absolute inset-0 bg-secondary/20 backdrop-blur-sm transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  );
}

// Memoized components to prevent unnecessary re-renders
export const MemoizedNavbar = memo(
  ({ children }: { children: React.ReactNode }) => children
);

MemoizedNavbar.displayName = 'MemoizedNavbar';

// Component that only renders when in viewport
interface InViewProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function InView({
  children,
  className,
  threshold = 0.1,
  rootMargin = "0px",
  once = true,
}: InViewProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, once]);

  return (
    <div ref={ref} className={className}>
      {isInView ? children : null}
    </div>
  );
}

// Component for deferred loading of non-critical content
export function DeferredContent({
  children,
  delay = 3000,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return show ? <>{children}</> : null;
}

// Performance monitoring component
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== "production") return;

    // Report Web Vitals
    if (typeof window !== "undefined" && "performance" in window) {
      // Function to send metrics to analytics
      const reportWebVital = ({ id, name, value }: { id: string; name: string; value: number }) => {
        // This would typically send to an analytics service
        console.log(`Web Vital: ${name}`, value);
        
        // Example of sending to a hypothetical analytics endpoint
        // fetch('/api/analytics/vitals', {
        //   method: 'POST',
        //   body: JSON.stringify({ id, name, value }),
        //   headers: { 'Content-Type': 'application/json' },
        // });
      };

      // Create a Performance Observer for longtasks
      try {
        if (typeof PerformanceObserver !== 'undefined') {
          const perfObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              // Report performance entry
              console.log(`[Performance] ${entry.name}:`, entry);
            });
          });
  
          // Observe different types of performance entries
          perfObserver.observe({ entryTypes: ["resource", "navigation", "longtask"] });
        }
      } catch (e) {
        console.error("Performance Observer not supported", e);
      }
    }
  }, []);

  return null;
}

// Code splitting & lazy loading for non-critical components
export const lazyLoad = (importFn: () => Promise<{ default: React.ComponentType<any> }>, fallback: React.ReactNode = null) => {
  const LazyComponent = lazy(importFn);
  
  const LazyLoadComponent = (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  LazyLoadComponent.displayName = 'LazyLoadComponent';
  return LazyLoadComponent;
};