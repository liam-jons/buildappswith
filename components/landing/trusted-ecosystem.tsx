"use client";

import { cn } from "../../lib/utils";
import { CompanyLogos } from "./company-logos";

export function TrustedEcosystem({ className }: { className?: string }) {
  return (
    <section id="ecosystem" className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-mono font-semibold text-primary uppercase tracking-wide mb-8">
          SOURCING A TRUSTED ECOSYSTEM FOR AI LITERACY
        </h3>
        
        <div className="relative max-w-5xl mx-auto">
          <CompanyLogos animated={false} />
        </div>
      </div>
    </section>
  );
}