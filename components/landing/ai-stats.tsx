"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimation,
  useInView,
  useMotionValue,
  useSpring,
  Variant,
} from "framer-motion";
import { cn } from "../../lib/utils";

const stats = [
  { value: 42, label: "Active AI Models Used", suffix: "+" },
  { value: 5000, label: "Prompt Engineering Hours", suffix: "+" },
  { value: 850000, label: "AI-Generated Outputs", prefix: "" },
  { value: 75, label: "Success Rate", suffix: "%" },
  { value: 35, label: "Time Saved", suffix: "%" },
  { value: 24, label: "Support Hours", suffix: "/7" },
];

const formatValue = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const CountingNumber = ({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${formatValue(Number(latest.toFixed(0)))}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix]);

  return <span ref={ref} />;
};

export function AIStats({ className }: { className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const itemVariants: { hidden: Variant; visible: Variant } = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="stats" className={cn("py-12 md:py-20 bg-secondary/20", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 py-6 mx-auto">
          <h2 className="text-sm text-primary font-mono font-medium tracking-tight uppercase">
            AI BY THE NUMBERS
          </h2>
          <h3 className="text-3xl font-medium mb-2 text-balance max-w-3xl mx-auto tracking-tighter">
            The impact of AI literacy on your work and life
          </h3>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
          ref={ref}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={controls}
              variants={itemVariants}
              custom={index}
              className="flex flex-col items-center bg-card p-6 rounded-xl shadow-sm border border-border"
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-2 text-center text-primary">
                <CountingNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}