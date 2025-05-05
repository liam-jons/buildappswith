import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <>
      {/* <SiteBanner /> */}
      <MarketingHeader 
        navigation={[
          { id: "feature-showcase", name: "How It Works", href: "#feature-showcase" },
          { id: "testimonials", name: "Testimonials", href: "#testimonials" },
          { id: "faq", name: "FAQ", href: "/faq" }
        ]}
        ctaText="Find a Builder"
        ctaHref="/marketplace"
        logoText="BuildAppsWith"
        logoAlt="BuildAppsWith logo"
        logoHref="/"
        showViewingPreferences={true}
      />
      <main className="mx-auto flex-1 overflow-hidden">{children}</main>
      <MarketingFooter 
        sections={[
          {
            title: "Platform",
            links: [
              { label: "Marketplace", href: "/marketplace" },
              { label: "How it Works", href: "/how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "FAQ", href: "/faq" }
            ]
          },
          {
            title: "Company",
            links: [
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Careers", href: "/careers" },
              { label: "Blog", href: "/blog" }
            ]
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Cookie Policy", href: "/cookies" }
            ]
          }
        ]}
        copyright="© 2025 BuildAppsWith. All rights reserved."
      />
    </>
  );
}
