import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation helper for framer-motion
export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}
