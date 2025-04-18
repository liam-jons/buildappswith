import ClientSection from "@/components/landing/client-section";
import HeroSection from "@/components/landing/hero-section";
import KeyValuesSection from "@/components/landing/key-values-section";
import AiCapabilitiesMarquee from "@/components/landing/ai-capabilities-marquee";
// Temporarily removing AnimatedBeamSection while we resolve component issues
import TestimonialsSection from "@/components/landing/testimonials-section";
import FinalCtaSection from "@/components/landing/final-cta-section";
import Particles from "@/components/magicui/particles";

export default async function Page() {
  return (
    <>
      <HeroSection />
      <ClientSection />
      <KeyValuesSection />
      <AiCapabilitiesMarquee />
      <TestimonialsSection />
      <FinalCtaSection />
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
