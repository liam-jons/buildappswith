"use client";

import { AccessibilityProvider, AccessibilityStyles } from "@/components/landing/accessibility";
import { AICapabilitiesMarquee } from "@/components/landing/ai-capabilities-marquee";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Navbar } from "@/components/landing/navbar";
import { PerformanceMonitor } from "@/components/landing/performance-optimizations";
import { SkillsTreeSection } from "@/components/landing/skills-tree-section";

// Metadata for this page would normally be in a separate metadata.ts file
// or in a page.tsx file marked as server component

export default function NewLandingPage() {
  return (
    <AccessibilityProvider>
      {/* Add accessibility styles */}
      <AccessibilityStyles />
      
      {/* Performance monitoring */}
      <PerformanceMonitor />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main content */}
      <main id="main-content">
        {/* Hero section */}
        <HeroSection />
        
        {/* AI Capabilities Marquee */}
        <AICapabilitiesMarquee />
        
        {/* Skills Learning Tree */}
        <SkillsTreeSection />
        
        {/* CTA Section */}
        <CTASection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "BuildAppsWith",
            url: "https://buildappswith.com",
            logo: "https://buildappswith.com/logo.png",
            sameAs: [
              "https://twitter.com/buildappswith",
              "https://github.com/buildappswith",
              "https://linkedin.com/company/buildappswith",
              "https://discord.gg/buildappswith"
            ],
            description: "Learn AI with people, not just prompts. Build real AI skills through human connection.",
          }),
        }}
      />
    </AccessibilityProvider>
  );
}