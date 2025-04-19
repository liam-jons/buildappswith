import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode, label?: string }
>(({ className, children, label }, ref) => {
  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          className,
        )}
      >
        {children}
      </div>
      {label && (
        <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
      )}
    </div>
  );
});

Circle.displayName = "Circle";

const Icons = {
  market: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.1046 15 14 14.1046 14 13C14 11.8954 13.1046 11 12 11C10.8954 11 10 11.8954 10 13C10 14.1046 10.8954 15 12 15Z" fill="currentColor"/>
    </svg>
  ),
  learn: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14L3 9L12 4L21 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 9V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 11.5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.5 11.5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 9V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  build: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16L9 13M12 16L15 13M12 16V8M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  community: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ai: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  efficiency: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// AnimatedBeamSection component - simplified version without AnimatedBeam
// Original version was causing TypeScript errors with ref handling
export default function AnimatedBeamSection() {
  return (
    <section className="py-20">
      <div className="container text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          The future starts with a more efficient you
        </h2>
      </div>
      
      <div className="relative flex h-[400px] w-full items-center justify-center overflow-hidden p-10">
        <div className="flex size-full max-h-[300px] max-w-3xl flex-col items-stretch justify-between gap-10">
          <div className="flex flex-row items-center justify-between">
            <Circle label="Marketplace" className="border-blue-500">
              <Icons.market />
            </Circle>
            <Circle label="AI Tools" className="border-blue-500">
              <Icons.ai />
            </Circle>
            <Circle label="Learn" className="border-blue-500">
              <Icons.learn />
            </Circle>
          </div>
          <div className="flex flex-row items-center justify-center">
            <Circle label="Efficiency" className="size-20 border-indigo-500">
              <Icons.efficiency />
            </Circle>
          </div>
          <div className="flex flex-row items-center justify-between">
            <Circle label="Build" className="border-blue-500">
              <Icons.build />
            </Circle>
            <Circle label="Community" className="border-blue-500">
              <Icons.community />
            </Circle>
          </div>
        </div>
        
        {/* Note: Animated beams have been removed to address TypeScript issues */}
        {/* The visual connections between circles are temporarily disabled */}
      </div>
      
      <div className="container flex justify-center mt-12">
        <Link
          href="/marketplace"
          className={cn(
            buttonVariants({
              size: "lg",
              variant: "outline",
            }),
            "group rounded-[2rem] px-6"
          )}
        >
          Explore Marketplace
          <ArrowRightIcon className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
