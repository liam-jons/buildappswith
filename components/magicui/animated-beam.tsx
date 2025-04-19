"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLDivElement | HTMLElement>;
  fromRef: React.RefObject<HTMLDivElement | HTMLElement>;
  toRef: React.RefObject<HTMLDivElement | HTMLElement>;
  curvature?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
  startYOffset?: number;
  endYOffset?: number;
  color?: string;
  width?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 2,
  delay = 0,
  reverse = false,
  startYOffset = 0,
  endYOffset = 0,
  color = "#6366f1",
  width = 2,
}) => {
  const [path, setPath] = useState<string>("");
  const [points, setPoints] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
  }>({
    from: { x: 0, y: 0 },
    to: { x: 0, y: 0 },
  });

  useEffect(() => {
    const calculatePosition = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      // Calculate positions relative to the container
      const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top + startYOffset;
      const toX = toRect.left + toRect.width / 2 - containerRect.left;
      const toY = toRect.top + toRect.height / 2 - containerRect.top + endYOffset;

      setPoints({
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
      });

      // Create the bezier curve path
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2 - curvature;

      setPath(
        reverse
          ? `M${toX},${toY} Q${midX},${midY} ${fromX},${fromY}`
          : `M${fromX},${fromY} Q${midX},${midY} ${toX},${toY}`
      );
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);

    return () => window.removeEventListener("resize", calculatePosition);
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startYOffset,
    endYOffset,
    reverse,
  ]);

  return (
    <>
      {path && (
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          style={{ pointerEvents: "none" }}
        >
          <motion.path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { delay, type: "spring", duration, bounce: 0 },
              opacity: { delay, duration: 0.2 },
            }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth={width / 2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{
              pathLength: { delay: delay + 0.1, type: "spring", duration: duration * 0.8, bounce: 0 },
              opacity: { delay: delay + 0.1, duration: 0.2 },
            }}
          />
        </svg>
      )}
    </>
  );
};
