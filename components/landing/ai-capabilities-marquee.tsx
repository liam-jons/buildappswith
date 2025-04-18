import React from 'react';
import Marquee from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";

// AI capabilities - real, practical use cases
const aiCanDo = [
  {
    title: "Generate Images",
    description: "Create custom illustrations and visuals from text descriptions",
  },
  {
    title: "Summarize Documents",
    description: "Extract key points from long-form content quickly",
  },
  {
    title: "Write First Drafts",
    description: "Produce initial versions of articles, emails, and reports",
  },
  {
    title: "Translate Languages",
    description: "Convert text between multiple languages with high accuracy",
  },
  {
    title: "Analyze Data",
    description: "Identify patterns and insights from structured information",
  },
  {
    title: "Generate Code",
    description: "Create working code snippets from natural language instructions",
  },
  {
    title: "Answer Questions",
    description: "Respond to queries with factual information from learned data",
  },
  {
    title: "Enhance Images",
    description: "Upscale, restore, and modify existing visuals",
  },
];

// AI limitations - dispelling myths
const aiCannotDo = [
  {
    title: "Replace Human Judgment",
    description: "AI cannot substitute for ethical decision-making or wisdom",
  },
  {
    title: "Guarantee Complete Accuracy",
    description: "AI can make mistakes and produce incorrect information",
  },
  {
    title: "Feel Emotions",
    description: "AI doesn't actually experience feelings or consciousness",
  },
  {
    title: "Understand Context Perfectly",
    description: "AI may miss subtle cultural or contextual nuances",
  },
  {
    title: "Replace Domain Experts",
    description: "AI complements but doesn't replace specialized human knowledge",
  },
  {
    title: "Solve Every Problem",
    description: "Some challenges still require human creativity and insight",
  },
  {
    title: "Learn Without Data",
    description: "AI relies on existing information and patterns to function",
  },
  {
    title: "Make Your Business Successful",
    description: "AI is a tool, not a substitute for good business strategy",
  },
];

const CapabilityCard = ({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6",
        // light styles
        "border-green-600/20 bg-green-600/5 hover:bg-green-600/10",
        // dark styles
        "dark:border-green-400/20 dark:bg-green-400/10 dark:hover:bg-green-400/15",
        className
      )}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const LimitationCard = ({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6",
        // light styles
        "border-red-600/20 bg-red-600/5 hover:bg-red-600/10",
        // dark styles
        "dark:border-red-400/20 dark:bg-red-400/10 dark:hover:bg-red-400/15",
        className
      )}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default function AiCapabilitiesMarquee() {
  return (
    <section id="ai-capabilities" className="py-14 relative">
      <div className="container mx-auto text-center">
        {/* Main heading removed as requested */}
      </div>
      
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-12">
        {/* First Marquee - Capabilities */}
        <div className="container">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">How can AI help you today</h3>
        </div>
        <Marquee className="[--duration:60s]" pauseOnHover>
          {aiCanDo.map((capability, idx) => (
            <CapabilityCard key={idx} {...capability} />
          ))}
        </Marquee>
        
        {/* Second Marquee - Limitations */}
        <div className="container mt-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">What can't AI do (yet)?</h3>
        </div>
        <Marquee reverse className="[--duration:55s]" pauseOnHover>
          {aiCannotDo.map((limitation, idx) => (
            <LimitationCard key={idx} {...limitation} />
          ))}
        </Marquee>
        
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
      </div>
    </section>
  );
}
