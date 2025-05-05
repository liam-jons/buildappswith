"use client";

import React from "react";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";

export interface MarketingMarqueeProps {
  title?: string;
  subtitle?: string;
  items: string[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
  id?: string;
}

export function MarketingMarquee({
  title,
  subtitle,
  items = [],
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
  id = "marquee"
}: MarketingMarqueeProps) {
  // Calculate duration based on speed
  const getDuration = () => {
    switch (speed) {
      case "slow": return "80s";
      case "fast": return "30s";
      case "normal":
      default: return "50s";
    }
  };

  return (
    <section
      id={id}
      className={cn("w-full py-16 md:py-20 overflow-hidden", className)}
    >
      <div className="container px-4 mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="relative">
          <Marquee
            pauseOnHover={pauseOnHover}
            className="py-4"
            reverse={direction === "right"}
            style={{ "--duration": getDuration() } as React.CSSProperties}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "mx-4 flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3",
                  "transition-all hover:border-primary/30"
                )}
              >
                <span className="font-medium text-primary">{item}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}