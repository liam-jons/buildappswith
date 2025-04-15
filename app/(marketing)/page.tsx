import ClientSection from "@/components/landing/client-section";
import CallToActionSection from "@/components/landing/cta-section";
import HeroSection from "@/components/landing/hero-section";
import KeyValuesSection from "@/components/landing/key-values-section"; // Added
import TestimonialsSection from "@/components/landing/testimonials-section"; // Added
import FinalCtaSection from "@/components/landing/final-cta-section"; // Added
// import PricingSection from "@/components/landing/pricing-section"; // Removed
import Particles from "@/components/magicui/particles";
// import { SphereMask } from "@/components/magicui/sphere-mask"; // Removed

export default async function Page() {
  return (
    <>
      <HeroSection />
      <ClientSection />
      <KeyValuesSection /> {/* Added */}
      {/* SphereMask removed */}
      {/* PricingSection removed */}
      <CallToActionSection />
      <TestimonialsSection /> {/* Added */}
      <FinalCtaSection /> {/* Added */}
      <Particles
        className="absolute inset-0 -z-10"
        quantity={50}
        ease={70}
        size={0.05}
        staticity={40}
        color={"#ffffff"}
      />
    </>
  );
}
