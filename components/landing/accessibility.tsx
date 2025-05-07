"use client";

import { useEffect } from "react";

/**
 * AccessibilityProvider - Component to enhance accessibility across the landing page
 * - Adds skip to content link
 * - Ensures proper focus management
 * - Handles keyboard navigation
 * - Provides reduced motion support
 */
export function AccessibilityProvider({
  children
}: {
  children: React.ReactNode;
}) {
  // Handle keyboard navigation highlighting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    // Return a cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <>
      {/* Skip to main content link - only visible when focused */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-background focus:text-primary focus:p-4 focus:top-0 focus:left-0 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      
      {children}
    </>
  );
}

// This utility adds accessibility attributes to sections
export function withSectionAccessibility(
  Component: React.ComponentType<any>,
  sectionId: string,
  ariaLabel: string
) {
  return function AccessibleSection(props: any) {
    return (
      <section 
        id={sectionId}
        aria-label={ariaLabel}
        role="region"
        tabIndex={-1}
      >
        <Component {...props} />
      </section>
    );
  };
}

// Enhanced link component with proper accessibility attributes
interface AccessibleLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isExternal?: boolean;
  children: React.ReactNode;
}

export function AccessibleLink({ 
  href, 
  isExternal, 
  children,
  className,
  ...props 
}: AccessibleLinkProps) {
  const externalProps = isExternal ? {
    target: "_blank",
    rel: "noopener noreferrer",
    "aria-label": `${typeof children === 'string' ? children : ''} (opens in a new tab)`
  } : {};

  return (
    <a
      href={href}
      className={className}
      {...externalProps}
      {...props}
    >
      {children}
      {isExternal && (
        <span className="sr-only"> (opens in a new tab)</span>
      )}
    </a>
  );
}

// Add custom CSS to ensure proper focus states
export const accessibilityStyles = `
  /* Focus styles */
  .user-is-tabbing *:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

// Component to add accessibility-specific styles
export function AccessibilityStyles() {
  return <style jsx global>{accessibilityStyles}</style>;
}export default AccessibilityProvider;
