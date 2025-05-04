"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  readMoreLink?: string;
  className?: string;
  index?: number;
  withAnimation?: boolean;
  numberPrefix?: boolean;
  variant?: "default" | "bento" | "compact";
}

export function FeatureCard({
  title,
  description,
  icon,
  readMoreLink,
  className,
  index,
  withAnimation = false,
  numberPrefix = false,
  variant = "default",
}: FeatureCardProps) {
  const Component = withAnimation ? motion.div : "div";
  
  if (variant === "bento") {
    return (
      <div
        className={cn(
          "flex flex-col items-start justify-end min-h-[400px] md:min-h-[350px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[350px] group",
          className
        )}
      >
        <div className="relative flex size-full items-center justify-center h-full overflow-hidden">
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-10">
            {icon}
          </div>
        </div>
        <div className="flex-1 flex-col gap-2 p-6">
          <h3 className="text-lg tracking-tighter font-semibold">
            {numberPrefix && index !== undefined ? `${index + 1}. ` : ""}
            {title}
          </h3>
          <p className="text-muted-foreground">{description}</p>
          {readMoreLink && (
            <Link 
              href={readMoreLink} 
              className="text-sm text-primary font-medium mt-2 inline-block hover:underline"
            >
              Read more
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Component
        className={cn(
          "flex items-start gap-4 p-4",
          className
        )}
      >
        <div className="bg-primary/10 rounded-full p-3 mt-1 shrink-0">
          {icon || (
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold mb-1">
            {numberPrefix && index !== undefined ? `${index + 1}. ` : ""}
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {readMoreLink && (
            <Link 
              href={readMoreLink} 
              className="text-xs text-primary font-medium mt-1 inline-block hover:underline"
            >
              Read more
            </Link>
          )}
        </div>
      </Component>
    );
  }

  // Default variant
  return (
    <Component
      className={cn(
        "bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center",
        className
      )}
    >
      <div className="bg-primary/10 rounded-full p-4 mb-4">
        {icon || (
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {numberPrefix && index !== undefined ? `${index + 1}. ` : ""}
        {title}
      </h3>
      <p className="text-muted-foreground">{description}</p>
      {readMoreLink && (
        <Link 
          href={readMoreLink} 
          className="text-sm text-primary font-medium mt-4 inline-block hover:underline"
        >
          Read more
        </Link>
      )}
    </Component>
  );
}