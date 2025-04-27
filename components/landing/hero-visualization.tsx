"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { BorderBeam } from "@/components/magicui/border-beam";
import Particles from "@/components/magicui/particles";

interface AppBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  label?: string;
}

interface HeroVisualizationProps {
  className?: string;
}

export default function HeroVisualization({ className = "" }: HeroVisualizationProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  // Set up blocks that will form the application visualization
  const appBlocks: AppBlock[] = [
    // AI Foundation blocks
    { id: "ai-core", x: 150, y: 250, width: 200, height: 40, color: "#9c40ff", delay: 0, label: "AI Foundation" },
    
    // App building blocks (components)
    { id: "ui-block", x: 100, y: 200, width: 70, height: 40, color: "#3b82f6", delay: 0.1, label: "UI" },
    { id: "data-block", x: 180, y: 200, width: 70, height: 40, color: "#3b82f6", delay: 0.2, label: "Data" },
    { id: "logic-block", x: 260, y: 200, width: 70, height: 40, color: "#3b82f6", delay: 0.3, label: "Logic" },
    { id: "api-block", x: 340, y: 200, width: 70, height: 40, color: "#3b82f6", delay: 0.4, label: "API" },
    
    // User solution blocks
    { id: "mobile-app", x: 120, y: 150, width: 80, height: 40, color: "#ffaa40", delay: 0.5, label: "Mobile" },
    { id: "web-app", x: 210, y: 150, width: 80, height: 40, color: "#ffaa40", delay: 0.6, label: "Web" },
    { id: "desktop-app", x: 300, y: 150, width: 80, height: 40, color: "#ffaa40", delay: 0.7, label: "Desktop" },
    
    // Final app solution
    { id: "app-solution", x: 180, y: 80, width: 140, height: 60, color: "#10b981", delay: 0.9, label: "Your App" },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animation variants
  const blockVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : delay,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Connection line animation variants
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (delay: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: prefersReducedMotion ? 0.1 : delay + 0.1,
        duration: prefersReducedMotion ? 0.5 : 0.8,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div 
      ref={ref}
      className={`relative mt-[8rem] animate-fade-up opacity-0 [--animation-delay:400ms] [perspective:2000px] ${className}`}
    >
      <div className="rounded-xl border border-white/10 bg-white bg-opacity-[0.01] relative overflow-hidden">
        <BorderBeam
          size={200}
          duration={12}
          delay={11}
          colorFrom="var(--color-one)"
          colorTo="var(--color-two)"
        />
        
        {isClient && (
          <AnimatePresence>
            {inView && (
              <div className="relative w-full aspect-[2/1] md:aspect-[3/1]">
                <Particles
                  className="absolute inset-0 z-10"
                  quantity={prefersReducedMotion ? 20 : 50}
                  staticity={prefersReducedMotion ? 80 : 50}
                  color="#9c40ff"
                  size={1}
                />
                
                <svg 
                  viewBox="0 0 500 300" 
                  className="w-full h-full"
                  aria-label="Visualization of app building process"
                  role="img"
                >
                  {/* Connection lines */}
                  <g stroke="#ffffff20" strokeWidth="2" fill="none">
                    {/* AI Foundation to building blocks */}
                    {appBlocks.slice(1, 5).map((block, index) => (
                      <motion.path
                        key={`line-foundation-${index}`}
                        d={`M250,250 L${block.x + block.width/2},${block.y + block.height}`}
                        custom={block.delay - 0.05}
                        variants={lineVariants}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                      />
                    ))}
                    
                    {/* Building blocks to solutions */}
                    <motion.path
                      d={`M135,200 L160,190`}
                      custom={0.45}
                      variants={lineVariants}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                    />
                    <motion.path
                      d={`M215,200 L220,190`}
                      custom={0.5}
                      variants={lineVariants}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                    />
                    <motion.path
                      d={`M295,200 L290,190`}
                      custom={0.55}
                      variants={lineVariants}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                    />
                    <motion.path
                      d={`M375,200 L340,190`}
                      custom={0.6}
                      variants={lineVariants}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                    />
                    
                    {/* Solutions to final app */}
                    {appBlocks.slice(5, 8).map((block, index) => (
                      <motion.path
                        key={`line-solution-${index}`}
                        d={`M${block.x + block.width/2},${block.y} L${250},${140}`}
                        custom={0.8}
                        variants={lineVariants}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                      />
                    ))}
                  </g>
                  
                  {/* App building blocks */}
                  {appBlocks.map((block) => (
                    <motion.g key={block.id} custom={block.delay} variants={blockVariants} initial="hidden" animate={inView ? "visible" : "hidden"}>
                      <motion.rect
                        x={block.x}
                        y={block.y}
                        width={block.width}
                        height={block.height}
                        rx={6}
                        fill={`${block.color}30`}
                        stroke={block.color}
                        strokeWidth={2}
                      />
                      {block.label && (
                        <text
                          x={block.x + block.width/2}
                          y={block.y + block.height/2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="14"
                          fontWeight="500"
                          className="text-xs md:text-sm"
                        >
                          {block.label}
                        </text>
                      )}
                    </motion.g>
                  ))}
                  
                  {/* Glowing effect for AI foundation */}
                  <motion.ellipse
                    cx="250"
                    cy="250"
                    rx="120"
                    ry="30"
                    fill={`url(#ai-glow)`}
                    opacity="0.5"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: prefersReducedMotion ? 0.3 : [0.2, 0.4, 0.2], 
                      scale: prefersReducedMotion ? 1 : [0.95, 1.05, 0.95] 
                    }}
                    transition={{ 
                      duration: 4, 
                      ease: "easeInOut", 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  />
                  
                  {/* Definitions for gradients and glows */}
                  <defs>
                    <radialGradient id="ai-glow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
                      <stop offset="0%" stopColor="#9c40ff" />
                      <stop offset="100%" stopColor="#9c40ff00" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
      <div className="absolute inset-0 z-50 after:absolute after:inset-0 after:[background:linear-gradient(to_top,hsl(var(--background))_20%,transparent)]"></div>
    </div>
  );
}