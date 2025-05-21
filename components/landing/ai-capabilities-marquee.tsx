"use client";

import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { AICapabilitiesMarqueeProps } from "./types";
import { aiCapabilities, aiLimitations } from "./data";
import { motion } from "framer-motion";

export function AICapabilitiesMarquee({
  className,
  capabilities = aiCapabilities,
  limitations = aiLimitations
}: AICapabilitiesMarqueeProps) {
  return (
    <section className={cn("py-16 md:py-24 relative overflow-hidden", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            AI can be a powerful companion
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            You just need to know what and how to ask
          </motion.p>
        </div>
      </div>

      <div className="relative">
        {/* "What AI Can Do Today" Marquee */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-4 py-1 rounded-full text-sm font-medium inline-flex items-center">
              <span className="size-2 bg-green-500 rounded-full mr-2"></span>
              What AI Can Do Today
            </div>
          </div>
          
          <Marquee 
            className="py-4" 
            pauseOnHover 
            reverse={false}
          >
            {capabilities.map((capability, index) => (
              <div 
                key={index}
                className="flex items-center bg-secondary/40 border border-primary/5 rounded-lg px-5 py-3 mx-3 min-w-52"
              >
                {capability.icon && (
                  <div className="mr-3 text-primary">
                    {capability.icon}
                  </div>
                )}
                <span className="text-sm font-medium">{capability.title}</span>
              </div>
            ))}
          </Marquee>
        </div>

        {/* "What AI Cannot Do (Yet)" Marquee */}
        <div>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-4 py-1 rounded-full text-sm font-medium inline-flex items-center">
              <span className="size-2 bg-red-500 rounded-full mr-2"></span>
              What AI Cannot Do (Yet)
            </div>
          </div>
          
          <Marquee 
            className="py-4" 
            pauseOnHover 
            reverse={true}
          >
            {limitations.map((limitation, index) => (
              <div 
                key={index}
                className="flex items-center bg-secondary/40 border border-primary/5 rounded-lg px-5 py-3 mx-3 min-w-52"
              >
                {limitation.icon && (
                  <div className="mr-3 text-primary">
                    {limitation.icon}
                  </div>
                )}
                <span className="text-sm font-medium">{limitation.title}</span>
              </div>
            ))}
          </Marquee>
        </div>

        {/* Connecting message */}
        <motion.div 
          className="max-w-2xl mx-auto text-center mt-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-lg text-primary font-medium">
            Our community of Builders stay ahead and cut through the noise - and they&apos;re incentivised to bring you along for the journey - wherever it might take you.
          </p>
        </motion.div>

        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}