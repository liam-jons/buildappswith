"use client";

import { easeOutCubic } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  readMoreLink?: string;
}

export interface FeatureShowcaseProps {
  title?: string;
  subtitle?: string;
  features: FeatureItem[];
  className?: string;
  disableAnimations?: boolean;
  variant?: "scroll" | "grid" | "bento";
  id?: string;
}

export function FeatureShowcase({
  title = "How It Works",
  subtitle = "Our platform connects you with AI-specialized builders to turn your ideas into reality",
  features = [],
  className,
  disableAnimations = false,
  variant = "scroll",
  id = "feature-showcase",
}: FeatureShowcaseProps) {
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);
  
  // Only calculate animations if they're not disabled and we have the right number of features
  const enableAnimations = !disableAnimations && variant === "scroll" && features.length >= 3;
  
  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: feature1Ref,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: feature2Ref,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: feature3Ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress1, [0, 0.3], [150, 0], {
    ease: easeOutCubic,
  });
  const y2 = useTransform(scrollYProgress2, [0.1, 0.4], [200, 0], {
    ease: easeOutCubic,
  });
  const y3 = useTransform(scrollYProgress3, [0.2, 0.5], [250, 0], {
    ease: easeOutCubic,
  });

  // Common feature card content
  const renderFeatureContent = (feature: FeatureItem, index: number) => (
    <>
      <div className="bg-primary/10 rounded-full p-4 mb-4">
        {feature.icon || (
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {index !== undefined ? `${index + 1}. ${feature.title}` : feature.title}
      </h3>
      <p className="text-muted-foreground">{feature.description}</p>
      {feature.readMoreLink && (
        <a 
          href={feature.readMoreLink} 
          className="text-sm text-primary font-medium mt-4 inline-block hover:underline"
        >
          Read more
        </a>
      )}
    </>
  );

  if (variant === "bento") {
    return (
      <section id={id} className={cn("flex flex-col items-center justify-center w-full relative px-5 md:px-10 py-20", className)}>
        <div className="border-x mx-5 md:mx-10 relative max-w-7xl w-full">
          <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
          <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4 text-balance">
              {title}
            </h2>
            <p className="text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex flex-col items-start justify-end min-h-[400px] md:min-h-[350px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[350px] group"
              >
                <div className="relative flex size-full items-center justify-center h-full overflow-hidden">
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-10">
                    {feature.icon}
                  </div>
                </div>
                <div className="flex-1 flex-col gap-2 p-6">
                  <h3 className="text-lg tracking-tighter font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  {feature.readMoreLink && (
                    <a href={feature.readMoreLink} className="text-sm text-primary font-medium mt-2 inline-block hover:underline">
                      Read more
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "grid") {
    return (
      <section id={id} className={cn("container px-4 sm:px-10 py-20", className)}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4">{title}</h2>
          <p className="text-muted-foreground font-medium max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center"
            >
              {renderFeatureContent(feature, index)}
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  // Default: "scroll" variant
  return (
    <section id={id} className={cn("container px-4 sm:px-10 py-20", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4">{title}</h2>
        <p className="text-muted-foreground font-medium max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
        {features.map((feature, index) => {
          // Set up animation based on index
          let ref;
          let animationStyle = {};
          
          if (enableAnimations) {
            if (index === 0) {
              ref = feature1Ref;
              animationStyle = { y: y1 };
            } else if (index === 1) {
              ref = feature2Ref;
              animationStyle = { y: y2 };
            } else if (index === 2) {
              ref = feature3Ref;
              animationStyle = { y: y3 };
            }
          }
          
          const Component = enableAnimations && index < 3 ? motion.div : "div";
          
          return (
            <Component
              key={feature.id}
              ref={index < 3 ? ref : undefined}
              className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center"
              style={enableAnimations && index < 3 ? animationStyle : undefined}
            >
              {renderFeatureContent(feature, index)}
            </Component>
          );
        })}
      </div>
    </section>
  );
}