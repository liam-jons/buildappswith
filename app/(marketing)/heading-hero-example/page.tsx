"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedHeading from "@/components/custom/animated-heading";
import TextShimmer from "@/components/magicui/text-shimmer";
import Link from "next/link";

export default function HeadingHeroExample() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hero Section with Animated Heading</h1>
        <Link href="/heading-demo">
          <Button variant="outline">
            Back to Demo Page
          </Button>
        </Link>
      </div>
      
      <section
        id="hero"
        className="relative mx-auto mt-16 max-w-[80rem] px-6 text-center md:px-8"
      >
        <div className="backdrop-filter-[12px] inline-flex h-7 items-center justify-between rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white dark:text-black transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in opacity-0">
          <TextShimmer className="inline-flex items-center justify-center">
            <span>✨ Democratizing AI Application Development</span>{" "}
            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </TextShimmer>
        </div>
        
        {/* Animated Heading Version */}
        <div className="py-6 text-center">
          <AnimatedHeading
            className="mx-auto text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-none tracking-tighter text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
            staticTextClassName="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent"
            animatedTextClassName="bg-gradient-to-br from-[#9c40ff] to-[#ffaa40] dark:from-[#ffaa40] dark:to-[#9c40ff] bg-clip-text text-transparent"
            names={[
              "Liam",
              "Sarah",
              "Miguel",
              "Aisha",
              "your team",
              "AI literacy",
              "expert builders"
            ]}
            interval={3000}
            shimmerAnimatedText={false}
          />
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-none tracking-tighter text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text text-transparent">
            without the complexity.
          </h2>
        </div>
        
        <p className="mb-12 text-lg tracking-tight text-gray-400 md:text-xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          Connect with validated AI builders or learn practical skills
          <br className="hidden md:block" /> in our community that rewards quality,
          knowledge-sharing, and results.
        </p>
        <Button className="translate-y-[-1rem] animate-fade-in gap-1 rounded-lg text-white dark:text-black opacity-0 ease-in-out [--animation-delay:600ms]">
          <span>Start Your Journey </span>
          <ArrowRightIcon className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
        </Button>
        <div
          ref={ref}
          className="relative mt-[8rem] animate-fade-up opacity-0 [--animation-delay:400ms] [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,hsl(var(--background))_30%,transparent)]"
        >
          <div
            className={`rounded-xl border border-white/10 bg-white bg-opacity-[0.01] before:absolute before:bottom-1/2 before:left-0 before:top-0 before:h-full before:w-full before:opacity-0 before:[filter:blur(180px)] before:[background-image:linear-gradient(to_bottom,var(--color-one),var(--color-one),transparent_40%)] ${
              inView ? "before:animate-image-glow" : ""
            }`}
          >
            <BorderBeam
              size={200}
              duration={12}
              delay={11}
              colorFrom="var(--color-one)"
              colorTo="var(--color-two)"
            />

            <img
              src="/hero-dark.png"
              alt="Hero Image"
              className="hidden relative w-full h-full rounded-[inherit] border object-contain dark:block"
            />
            <img
              src="/hero-light.png"
              alt="Hero Image"
              className="block relative w-full h-full  rounded-[inherit] border object-contain dark:hidden"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
