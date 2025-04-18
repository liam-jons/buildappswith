"use client";

import React from "react";
import { motion } from "framer-motion";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import TextShimmer from "@/components/magicui/text-shimmer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";

// AI capabilities data
const aiCapabilities = [
  "Natural Language Processing",
  "Image Generation",
  "Code Assistance",
  "Data Analysis",
  "Language Translation",
  "Speech Recognition",
  "Content Summarization",
  "Sentiment Analysis",
  "Recommendation Systems",
  "Process Automation"
];

// AI limitations data
const aiLimitations = [
  "Truly understand context",
  "Have real-world experience",
  "Feel emotions",
  "Make ethical judgments",
  "Exercise common sense",
  "Adapt to novel situations",
  "Be accountable for decisions",
  "Have consciousness",
  "Replace human creativity",
  "Possess general intelligence"
];

export function AiCapabilitiesMarquee() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <TextShimmer className="text-3xl md:text-4xl font-bold mb-6">
            The Power of AI
          </TextShimmer>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            AI is rapidly evolving, transforming how we build applications and solve problems.
            Understanding its capabilities and limitations is key to using it effectively.
          </p>
        </motion.div>
        
        {/* What AI Can Do */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">What can AI do today?</h3>
          <div className="relative">
            <Marquee
              pauseOnHover
              className="py-4"
              reverse
            >
              {aiCapabilities.map((capability, index) => (
                <div
                  key={index}
                  className={cn(
                    "mx-4 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-3",
                    "transition-all hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                >
                  <span className="font-medium">{capability}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
        
        {/* What AI Can't Do */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">What can&apos;t AI do (yet)?</h3>
          <div className="relative">
            <Marquee
              pauseOnHover
              className="py-4"
            >
              {aiLimitations.map((limitation, index) => (
                <div
                  key={index}
                  className={cn(
                    "mx-4 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-3",
                    "transition-all hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                >
                  <span className="font-medium">{limitation}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-10">
          <Button variant="outline" className="gap-1 rounded-lg ease-in-out" asChild>
            <Link href="/timeline">
              <span>Explore AI Timeline</span>
              <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default AiCapabilitiesMarquee;
