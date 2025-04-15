import { HeroSection } from "@/components/landing/hero-section"
import { TrustedBySection } from "@/components/landing/trusted-by-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CtaSection } from "@/components/landing/cta-section"

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Trusted By Section */}
      <TrustedBySection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CtaSection />
    </div>
  )
}
