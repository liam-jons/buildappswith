"use client";

import { useState } from "react";
import AnimatedHeading from "@/components/custom/animated-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HeadingDemoPage() {
  const [shimmerEnabled, setShimmerEnabled] = useState(true);
  const [intervalSpeed, setIntervalSpeed] = useState(3000);
  const [fontSizeClass, setFontSizeClass] = useState("text-5xl");
  
  const sizeOptions = [
    { label: "Small", value: "text-3xl" },
    { label: "Medium", value: "text-5xl" },
    { label: "Large", value: "text-7xl" },
  ];
  
  const speedOptions = [
    { label: "Slow", value: 5000 },
    { label: "Medium", value: 3000 },
    { label: "Fast", value: 1500 },
  ];
  
  const customNames = [
    "Liam", 
    "Kenny", 
    "Jonathan", 
    "Sheri", 
    "Sarah", 
    "Miguel", 
    "Aisha",
    "your team",
    "expert builders",
    "AI assistance"
  ];
  
  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Animated Heading Demo</h1>
        
        <div className="rounded-xl border p-8 mb-12 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-center min-h-[200px]">
          <AnimatedHeading 
            staticText="Build Apps With"
            names={customNames}
            interval={intervalSpeed}
            className={cn("font-bold", fontSizeClass)}
            shimmerAnimatedText={shimmerEnabled}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Effect</h2>
            <div className="flex flex-col gap-2">
              <Button 
                variant={shimmerEnabled ? "default" : "outline"} 
                onClick={() => setShimmerEnabled(true)}
              >
                With Shimmer
              </Button>
              <Button 
                variant={!shimmerEnabled ? "default" : "outline"} 
                onClick={() => setShimmerEnabled(false)}
              >
                Without Shimmer
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Speed</h2>
            <div className="flex flex-col gap-2">
              {speedOptions.map((option) => (
                <Button 
                  key={option.value}
                  variant={intervalSpeed === option.value ? "default" : "outline"} 
                  onClick={() => setIntervalSpeed(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Size</h2>
            <div className="flex flex-col gap-2">
              {sizeOptions.map((option) => (
                <Button 
                  key={option.value}
                  variant={fontSizeClass === option.value ? "default" : "outline"} 
                  onClick={() => setFontSizeClass(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border p-6 bg-slate-50 dark:bg-slate-800">
          <h2 className="text-xl font-medium mb-4">Usage Instructions</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>The <code>AnimatedHeading</code> component provides a dynamic heading with animated text rotation. Here's how to use it:</p>
            
            <h3>Props</h3>
            <ul>
              <li><code>staticText</code>: The text that remains fixed (default: "Build Apps With")</li>
              <li><code>names</code>: Array of strings to rotate through</li>
              <li><code>interval</code>: Time in milliseconds between transitions (default: 3000)</li>
              <li><code>className</code>: Additional classes for the heading container</li>
              <li><code>staticTextClassName</code>: Classes specifically for the static text</li>
              <li><code>animatedTextClassName</code>: Classes specifically for the animated text</li>
              <li><code>shimmerAnimatedText</code>: Whether to apply the shimmer effect to the animated text</li>
            </ul>
            
            <h3>Example</h3>
            <pre className="p-4 rounded bg-slate-100 dark:bg-slate-900 overflow-x-auto">
              {`<AnimatedHeading 
  staticText="Build Apps With"
  names={["Liam", "Kenny", "Jonathan", "Sheri"]}
  interval={3000}
  className="text-5xl font-bold"
  animatedTextClassName="text-purple-600 dark:text-amber-400"
  shimmerAnimatedText={true}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
