"use client";

import TextShimmer from "@/components/magicui/text-shimmer";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import TwoLineAnimatedHeading from "@/components/custom/two-line-animated-heading";
import Link from "next/link";
import { AnimatedCircularProgressBarDemo } from "./animated-circular-progress-bar-demo";
import { motion } from "framer-motion";
import { AuroraText } from "@/components/magicui/aurora-text";

export default function HeroSection() {
  const ref = useRef(null);
  
  return (
    <section
      id="hero"
      className="relative mx-auto mt-32 max-w-[80rem] px-6 text-center md:px-8"
    >
      <div className="relative backdrop-filter-[12px] inline-flex h-10 items-center justify-between rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-5 text-sm transition-all ease-in hover:cursor-pointer group gap-1 translate-y-[-1rem] animate-fade-in opacity-0">
        <BorderBeam className="rounded-full" duration={10.5} />
        <Link href="/how-it-works" className="flex items-center">
          <span>Get started with AI today</span>{" "}
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </Link>
      </div>
      <TwoLineAnimatedHeading 
        className="py-6 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
        headingClassName="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent text-balance"
        appsClassName="text-blue-500 dark:text-blue-400"
        animatedTextClassName="text-[#9c40ff] dark:text-[#ffaa40]"
        names={[
          "Liam", 
          "Peter", 
          "Kenny", 
          "Ryan", 
          "Sheri", 
          "Kemi", 
          "Stormzy", 
          "Steven",
          "your friends",
          "your community",
          "your team",
          "your customers",
          "someone you trust"
        ]}
        interval={3000}
        shimmerAnimatedText={false}
      />
      <p className="mb-12 text-lg tracking-tight text-gray-600 dark:text-gray-400 md:text-xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        Start benefiting from AI today. Become more efficient, and transform your ideas into reality.
      </p>
      <div className="flex justify-center translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
        <Button variant="outline" className="gap-1 rounded-lg ease-in-out" asChild>
          <Link href="/how-it-works">
            <span>Learn How It Works</span>
            <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
      
      {/* Loading Animation */}
      <div className="mt-20 mb-20 flex flex-col items-center justify-center cursor-pointer">
        <Link href="/how-it-works" className="group">
          <h3 className="mb-6 text-3xl md:text-4xl font-bold text-black dark:text-white">
            A more efficient you
          </h3>
          
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <div className="rounded-full absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-xl opacity-30"></div>
            <AnimatedCircularProgressBarDemo />
          </div>
          
          <div className="mt-10 text-center">
            <AuroraText speed={0.5} className="text-5xl font-medium">
              Loading...
            </AuroraText>
          </div>
        </Link>
      </div>
    </section>
  );
}
