import { Particles } from "@/components/magicui";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { MarketingCTA } from "@/components/marketing/marketing-cta";
import { TrustProofCompanies, MarketingMarquee } from "@/components/marketing/ui";
import { CalendarIcon, LightbulbIcon, RocketIcon, SearchIcon } from "lucide-react";

export default async function Page() {
  return (
    <>
      <MarketingHero 
        badge="Build Apps With AI"
        badgeIcon="🚀"
        headline="Launch your product with expert AI builders"
        subheadline="Connect with AI-proficient developers to bring your ideas to life. Our platform makes it easy to find, book, and collaborate with the best technical talent."
        primaryCTA={{
          text: "Find Builders",
          href: "/marketplace",
        }}
        secondaryCTA={{
          text: "How It Works",
          href: "#feature-showcase",
        }}
        imageLightSrc="/hero-light.png"
        imageDarkSrc="/hero-dark.png"
        headlineRotatingWords={["apps", "websites", "AI solutions", "products"]}
      />
      
      <TrustProofCompanies
        title="Trusted by Industry Leaders"
        subtitle="Join the companies building the future with our network of AI experts"
        companies={[
          { id: "anthropic", name: "Anthropic", logo: "/logos/anthropic-logo.svg", altText: "Anthropic logo" },
          { id: "vercel", name: "Vercel", logo: "/logos/vercel-logo.svg", altText: "Vercel logo" },
          { id: "supabase", name: "Supabase", logo: "/logos/supabase-logo.svg", altText: "Supabase logo" },
          { id: "neon", name: "Neon", logo: "/logos/neon-logo.svg", altText: "Neon logo" },
          { id: "perplexity", name: "Perplexity", logo: "/logos/perplexity-logo.svg", altText: "Perplexity logo" },
          { id: "lovable", name: "Lovable", logo: "/logos/lovable-logo.svg", altText: "Lovable logo" }
        ]}
      />
      
      <FeatureShowcase
        id="feature-showcase"
        title="How It Works"
        subtitle="Our platform connects you with AI-specialised builders to turn your ideas into reality"
        features={[
          {
            id: "idea",
            title: "Share Your Vision",
            description: "Describe your project, requirements, and goals. Be as detailed or abstract as you need to be.",
            icon: <LightbulbIcon className="h-8 w-8" />,
            readMoreLink: "/how-it-works#vision"
          },
          {
            id: "match",
            title: "Find Your Builder",
            description: "Browse profiles of AI-specialised builders and find the perfect match for your project needs.",
            icon: <SearchIcon className="h-8 w-8" />,
            readMoreLink: "/how-it-works#find"
          },
          {
            id: "collaborate",
            title: "Book and Collaborate",
            description: "Schedule sessions, track progress, and work together to bring your vision to life.",
            icon: <CalendarIcon className="h-8 w-8" />,
            readMoreLink: "/how-it-works#collaborate"
          },
          {
            id: "launch",
            title: "Launch Your Product",
            description: "Release your application with ongoing support and enhancement options.",
            icon: <RocketIcon className="h-8 w-8" />,
            readMoreLink: "/how-it-works#launch"
          }
        ]}
        variant="scroll"
      />
      
      <MarketingMarquee
        title="The Power of AI"
        subtitle="AI is rapidly evolving, transforming how we build applications and solve problems"
        items={[
          "AI Website Development",
          "Custom Chat Interfaces",
          "Data Analysis Tools",
          "Machine Learning Integration",
          "Natural Language Processing",
          "Computer Vision Applications",
          "API Development",
          "AI Strategy Consulting",
          "Automation Solutions",
          "Vector Database Implementation"
        ]}
        direction="right"
        speed="slow"
        pauseOnHover
      />
      
      <TestimonialSection
        id="testimonials"
        title="What Our Clients Say"
        subtitle="Real success stories from clients who have built their applications with our network of AI experts"
        testimonials={[
          {
            id: "1",
            name: "Sarah Johnson",
            role: "Startup Founder",
            img: "https://i.pravatar.cc/150?img=1",
            description: "BuildAppsWith connected me with an AI specialist who helped us implement a recommendation engine that increased conversion by 34%. The booking process was seamless.",
            verificationStatus: "verified"
          },
          {
            id: "2",
            name: "Michael Chen",
            role: "Product Manager",
            img: "https://i.pravatar.cc/150?img=2",
            description: "We needed help integrating AI image recognition into our platform. The builder we found through BuildAppsWith delivered a working prototype in just two sessions.",
            verificationStatus: "verified"
          },
          {
            id: "3",
            name: "Emily Rodriguez",
            role: "UX Designer",
            img: "https://i.pravatar.cc/150?img=3",
            description: "As a designer, I was struggling with the technical aspects of my AI project. My BuildAppsWith developer explained everything clearly and helped me bring my vision to life.",
            verificationStatus: "verified"
          }
        ]}
      />
      
      <MarketingCTA
        id="cta"
        title="Start building today"
        subtitle="Our expert AI builders are ready to bring your vision to life"
        ctaText="Find a builder"
        ctaHref="/marketplace"
        ctaVariant="primary"
        supportingText="No commitment required"
        backgroundGradient="bg-gradient-to-r from-purple-600 to-blue-600"
      />
      
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
