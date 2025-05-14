"use client";

import { AICapabilitiesMarquee } from "@/components/landing/ai-capabilities-marquee";
import { CTASection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PerformanceMonitor } from "@/components/landing/performance-optimizations";
import { SkillsTreeSection } from "@/components/landing/skills-tree-section";
import { TrustedEcosystem } from "@/components/landing/trusted-ecosystem";
import { AIStats } from "@/components/landing/ai-stats";
import { SkillsCarousel } from "@/components/landing/skills-carousel";

export default function Page() {
  return (
    <>
      {/* Performance monitoring */}
      <PerformanceMonitor />
      
      {/* Main content */}
      <div id="main-content">
        {/* Hero section */}
        <HeroSection />
        
        {/* AI Capabilities Marquee */}
        <AICapabilitiesMarquee />
        
        {/* AI Stats */}
        <AIStats />
        
        {/* Trusted Ecosystem */}
        <TrustedEcosystem />
        
        {/* Skills Learning Carousel */}
        <SkillsCarousel />
        
        {/* How It Works */}
        <SkillsTreeSection />
        
        {/* CTA Section */}
        <CTASection />
      </div>
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Build Apps With",
            url: "https://buildappswith.com",
            logo: "https://buildappswith.com/logo.png",
            sameAs: [
              "https://twitter.com/buildappswith",
              "https://github.com/buildappswith",
              "https://linkedin.com/company/buildappswith",
              "https://discord.gg/buildappswith"
            ],
            description: "Start learning practical AI skills today.",
          }),
        }}
      />
    </>
  );
}