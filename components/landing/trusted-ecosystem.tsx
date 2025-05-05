"use client";

import { cn } from "../../lib/utils";

const companies = [
  { name: "Anthropic", logoUrl: "/logos/anthropic-logo.svg" },
  { name: "Perplexity", logoUrl: "/logos/perplexity-logo.svg" },
  { name: "GitHub", logoUrl: "/images/github-logo.png" },
  { name: "Vercel", logoUrl: "/logos/vercel-logo.svg" },
  { name: "Supabase", logoUrl: "/logos/supabase-logo.svg" },
  { name: "Neon", logoUrl: "/logos/neon-logo.svg" },
  { name: "Lovable", logoUrl: "/logos/lovable-logo.svg" },
  { name: "Stripe", logoUrl: "/logos/stripe-logo.svg" }
];

export function TrustedEcosystem({ className }: { className?: string }) {
  return (
    <section id="ecosystem" className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-mono font-semibold text-primary uppercase tracking-wide mb-8">
          SOURCING A TRUSTED ECOSYSTEM FOR AI LITERACY
        </h3>
        
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 place-items-center max-w-5xl mx-auto">
            {companies.map((company) => (
              <div 
                key={company.name}
                className="h-16 w-32 flex items-center justify-center"
              >
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="h-10 object-contain dark:invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}