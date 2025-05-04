"use client";

import { easeOutCubic } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function FeatureScroll() {
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);

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

  return (
    <section
      id="feature-scroll"
      className="container px-4 sm:px-10 py-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4">How It Works</h2>
        <p className="text-muted-foreground font-medium max-w-2xl mx-auto">Our platform connects you with AI-specialized builders to turn your ideas into reality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
        <motion.div
          ref={feature1Ref}
          className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center"
          style={{ y: y1 }}
        >
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">1. Discover Builders</h3>
          <p className="text-muted-foreground">Browse our marketplace of vetted AI specialists with proven track records.</p>
        </motion.div>

        <motion.div
          ref={feature2Ref}
          className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center"
          style={{ y: y2 }}
        >
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">2. Book Sessions</h3>
          <p className="text-muted-foreground">Schedule time with your chosen builder based on your project needs.</p>
        </motion.div>

        <motion.div
          ref={feature3Ref}
          className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col items-center text-center"
          style={{ y: y3 }}
        >
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">3. Build Together</h3>
          <p className="text-muted-foreground">Collaborate effectively and watch your idea transform into a working product.</p>
        </motion.div>
      </div>
    </section>
  );
}