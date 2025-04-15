"use client";

import TextShimmer from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import TwoLineAnimatedHeading from "@/components/custom/two-line-animated-heading";
import HeroVisualization from "@/components/landing/hero-visualization";

export default function HeroSection() {
  const ref = useRef(null);
  
  return (
    <section
      id="hero"
      className="relative mx-auto mt-32 max-w-[80rem] px-6 text-center md:px-8"
    >
      <div className="backdrop-filter-[12px] inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white dark:text-black transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in opacity-0">
        <TextShimmer className="inline-flex items-center justify-center">
          <span>✨ Democratizing AI Application Development</span>{" "}
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </TextShimmer>
      </div>
      <TwoLineAnimatedHeading 
        className="py-6 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
        headingClassName="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent text-balance"
        appsClassName="text-blue-500 dark:text-blue-400"
        animatedTextClassName="text-[#9c40ff] dark:text-[#ffaa40]"
        names={[
          "Liam", 
          "Kenny", 
          "Jonathan", 
          "Sheri", 
          "Sarah", 
          "Miguel", 
          "Aisha",
          "your team",
          "your friends",
          "your business",
          "your customers",
          "your community",
          "your future",
          "everyone"
        ]}
        interval={3000}
        shimmerAnimatedText={false}
      />
      <p className="mb-12 text-lg tracking-tight text-gray-400 md:text-xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        Transform your ideas into reality with the power of AI.
        <br className="hidden md:block" /> Build your tomorrow, today. Do more with people you can trust.
      </p>
      <div className="flex justify-center space-x-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
        <Button className="gap-1 rounded-lg text-white dark:text-black ease-in-out">
          <span>Start Your Journey </span>
          <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </Button>
        <Button variant="outline" className="gap-1 rounded-lg ease-in-out">
          <span>Learn How It Works</span>
        </Button>
      </div>
      
      {/* Hero Visualization Component */}
      <HeroVisualization />
    </section>
  );
}