"use client";

import { cn } from "@/lib/utils";
import { FooterProps } from "./types";
import Link from "next/link";
import { DiscordLogoIcon, GitHubLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { ArrowRight } from "lucide-react";

// Footer navigation links
const footerNavs = {
  company: [
    { name: "About", href: "/about" },
    { name: "Our Mission", href: "/about#mission" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Weekly Sessions", href: "/weekly-sessions" },
    { name: "Learning Toolkit", href: "/toolkit" },
    { name: "Community", href: "/community" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
  ],
};

// Social media links
const socialLinks = [
  {
    name: "Discord",
    href: "https://discord.gg/buildappswith",
    icon: <DiscordLogoIcon className="h-5 w-5" />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/buildappswith",
    icon: <TwitterLogoIcon className="h-5 w-5" />,
  },
  {
    name: "GitHub",
    href: "https://github.com/buildappswith",
    icon: <GitHubLogoIcon className="h-5 w-5" />,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/buildappswith",
    icon: <LinkedInLogoIcon className="h-5 w-5" />,
  },
];

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("border-t border-border", className)}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Brand and newsletter signup */}
          <div className="lg:col-span-4">
            <div className="flex flex-col gap-6">
              <Link href="/" className="inline-flex">
                <span className="text-2xl font-semibold">BuildAppsWith</span>
              </Link>

              <p className="text-muted-foreground max-w-xs">
                Learn AI with people, not just prompts. Build real skills through human connection.
              </p>

              {/* Newsletter signup */}
              <div className="mt-2">
                <p className="font-medium mb-2">Subscribe to our newsletter</p>
                <div className="flex gap-2 max-w-sm">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      aria-label="Email address for newsletter"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-white px-3 py-2 rounded-md inline-flex items-center"
                  >
                    Subscribe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  We'll send you updates on new features and events. No spam.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Company links */}
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Company</h3>
                <ul className="space-y-3">
                  {footerNavs.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources links */}
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Resources</h3>
                <ul className="space-y-3">
                  {footerNavs.resources.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal links */}
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Legal</h3>
                <ul className="space-y-3">
                  {footerNavs.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Social links */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">Connect</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.name}
                        href={social.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label={social.name}
                      >
                        {social.icon}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BuildAppsWith. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/"
              className="text-sm text-primary-foreground bg-primary px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}