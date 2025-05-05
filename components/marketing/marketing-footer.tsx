import Link from "next/link";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "./ui/newsletter-form";

export interface FooterSection {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}

export interface MarketingFooterProps {
  logo?: React.ReactNode | string;
  logoAlt?: string;
  logoHref?: string;
  sections?: FooterSection[];
  legalLinks?: {
    label: string;
    href: string;
  }[];
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  copyright?: string;
  className?: string;
}

export function MarketingFooter({
  logo = "BuildAppsWith",
  logoAlt = "BuildAppsWith logo",
  logoHref = "/",
  sections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Marketplace", href: "/marketplace" },
        { label: "Pricing", href: "/pricing" },
        { label: "Testimonials", href: "/testimonials" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Blog", href: "/blog" },
        { label: "API Reference", href: "/api" },
        { label: "Support", href: "/support" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
        { label: "News", href: "/news" },
      ],
    },
  ],
  legalLinks = [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
  newsletterTitle = "Subscribe to our newsletter",
  newsletterDescription = "Get updates on new builders, features, and more.",
  newsletterPlaceholder = "Enter your email",
  newsletterButtonText = "Subscribe",
  contactInfo = {
    email: "hello@buildappswith.ai",
    phone: "+44 20 1234 5678",
    address: "London, UK",
  },
  copyright = `© ${new Date().getFullYear()} BuildAppsWith. All rights reserved.`,
  className,
}: MarketingFooterProps) {
  return (
    <footer className={cn("bg-card border-t border-border py-20", className)}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo and contact info */}
          <div className="lg:col-span-2">
            <Link href={logoHref} className="inline-block mb-6" aria-label={logoAlt}>
              {typeof logo === "string" ? (
                <div className="text-xl font-bold text-primary">{logo}</div>
              ) : (
                logo
              )}
            </Link>
            
            {contactInfo && (
              <div className="space-y-2 text-muted-foreground">
                {contactInfo.email && (
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    <a 
                      href={`mailto:${contactInfo.email}`} 
                      className="hover:text-primary transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </p>
                )}
                {contactInfo.phone && (
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    <a 
                      href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`} 
                      className="hover:text-primary transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </p>
                )}
                {contactInfo.address && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {contactInfo.address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navigation sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter signup */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-lg mb-4">{newsletterTitle}</h3>
            <p className="text-muted-foreground mb-4">{newsletterDescription}</p>
            <NewsletterForm 
              placeholder={newsletterPlaceholder}
              buttonText={newsletterButtonText}
            />
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            {copyright}
          </div>
          <div className="flex space-x-6">
            {legalLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}