"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const options = [
  { 
    id: 1, 
    title: "Option 1", 
    description: "This is the first option in our skills pathway. Choose this if you want to get started with the basics of AI.",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1470&auto=format&fit=crop"
  },
  { 
    id: 2, 
    title: "Option 2", 
    description: "This is the second option in our skills pathway. Choose this if you want to learn about prompt engineering.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1470&auto=format&fit=crop"
  },
  { 
    id: 3, 
    title: "Option 3", 
    description: "This is the third option in our skills pathway. Choose this if you want to build more complex AI applications.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1470&auto=format&fit=crop"
  }
];

export function SkillsCarousel({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % options.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
  };

  return (
    <section className={cn("py-16 md:py-24 bg-secondary/10", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-sm font-mono font-medium text-primary uppercase tracking-wider">
            CHOOSE YOUR PATH
          </h2>
          <h3 className="text-3xl font-medium mt-2 mb-4">
            Select from multiple learning pathways
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We offer different starting points based on your interests and goals. Select a pathway to begin your AI journey.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div 
            className="overflow-hidden"
            ref={containerRef}
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {options.map((option) => (
                <div 
                  key={option.id}
                  className="min-w-full p-4"
                >
                  <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border h-[400px] relative">
                    <div className="absolute inset-0">
                      <img 
                        src={option.image} 
                        alt={option.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h4 className="text-2xl font-medium mb-2">{option.title}</h4>
                      <p className="text-white/80 mb-4">{option.description}</p>
                      <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md transition-colors">
                        Select This Path
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md z-10"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md z-10"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {options.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  activeIndex === index ? "w-8 bg-primary" : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}