"use client";

import { motion, MotionProps } from "framer-motion";
import React from "react";

interface ClientMotionWrapperProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Client-side wrapper for framer-motion to ensure animations work in production
 * This prevents SSR/hydration issues
 */
export function ClientMotion({ children, ...props }: ClientMotionWrapperProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className={props.className}>{children}</div>;
  }

  return <motion.div {...props}>{children}</motion.div>;
}