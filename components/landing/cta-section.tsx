"use client";

import { cn } from "@/lib/utils";
import { CTASectionProps } from "./types";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection({ 
  className,
  headline = "Ready to Get Started? Begin your journey today",
  subheadline = "Join our community of Learners and Builders to gain practical skills that will accelerate your day-to-day.",
  primaryCTA = {
    text: "Sign Up Now",
    href: "/signup"
  },
  secondaryCTA = {
    text: "Just keep me informed",
    href: "/newsletter"
  }
}: CTASectionProps) {
  return (
    <section
      id="cta"
      className={cn(
        "py-20 md:py-28 relative overflow-hidden",
        className
      )}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/90 to-primary rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative px-6 py-16 md:px-12 md:py-24">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="absolute right-0 top-0 h-full w-auto"
                width="800"
                height="800"
                viewBox="0 0 800 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.8">
                  {[...Array(10)].map((_, i) => (
                    <circle
                      key={i}
                      cx="400"
                      cy="400"
                      r={200 + i * 20}
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="20 20"
                    />
                  ))}
                </g>
              </svg>
            </div>

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <motion.h2
                className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {headline}
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl text-white/80 mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {subheadline}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={primaryCTA.href}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-medium text-primary hover:bg-white/90 transition-colors shadow-lg"
                  >
                    {primaryCTA.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={secondaryCTA.href}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-transparent border border-white/30 backdrop-blur-sm px-8 text-base font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    {secondaryCTA.text}
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Human connection visual */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center z-20 hidden md:flex">
          <div className="relative">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div 
                  key={num}
                  className="relative size-12 rounded-full border-2 border-white bg-background z-10 overflow-hidden shadow-lg"
                >
                  <img 
                    src={`https://i.pravatar.cc/150?img=${num + 10}`} 
                    alt="Community member" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}