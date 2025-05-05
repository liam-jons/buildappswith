"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export interface TrustProofCompaniesProps {
  title?: string;
  subtitle?: string;
  companies: Array<{
    id: string;
    name: string;
    logo: string;
    altText: string;
  }>;
  className?: string;
}

export function TrustProofCompanies({
  title = "Trusted by Industry Leaders",
  subtitle = "Join the companies building the future with our network of AI experts",
  companies = [],
  className,
}: TrustProofCompaniesProps) {
  return (
    <section
      id="clients"
      className={cn("w-full py-16 md:py-20", className)}
    >
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-center">
                <img
                  src={company.logo}
                  alt={company.altText}
                  className="h-8 w-28 px-2 dark:brightness-0 dark:invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}