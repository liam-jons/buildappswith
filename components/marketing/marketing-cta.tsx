import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MarketingCTAProps {
  id?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaVariant?: "primary" | "secondary" | "tertiary";
  supportingText?: string;
  backgroundGradient?: string;
  className?: string;
}

export function MarketingCTA({
  id = "cta",
  title = "Start building today",
  subtitle,
  ctaText = "Find a builder",
  ctaHref = "/marketplace",
  ctaVariant = "primary",
  supportingText = "No commitment required",
  backgroundGradient = "bg-gradient-to-r from-purple-600 to-blue-600",
  className,
}: MarketingCTAProps) {
  return (
    <section
      id={id}
      className={cn("flex flex-col items-center justify-center w-full py-20", className)}
    >
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="h-[400px] md:h-[400px] overflow-hidden shadow-xl w-full border border-border rounded-xl bg-secondary relative z-20">
          <div 
            className={cn("absolute inset-0 w-full h-full object-cover object-right md:object-center", backgroundGradient)}
          />
          <div className="absolute inset-0 -top-32 md:-top-40 flex flex-col items-center justify-center">
            <h2 className="text-white text-4xl md:text-7xl font-medium tracking-tighter max-w-xs md:max-w-xl text-center">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/80 text-lg font-medium max-w-2xl text-center mt-4">
                {subtitle}
              </p>
            )}
            <div className="absolute bottom-10 flex flex-col items-center justify-center gap-2">
              <Link
                href={ctaHref}
                className={cn(
                  "text-sm h-10 w-fit px-6 rounded-full flex items-center justify-center shadow-md font-semibold",
                  ctaVariant === "primary" && "bg-white text-black hover:bg-white/90",
                  ctaVariant === "secondary" && "bg-secondary text-white border border-white/20 hover:bg-secondary/90",
                  ctaVariant === "tertiary" && "bg-transparent text-white border border-white hover:bg-white/10"
                )}
              >
                {ctaText}
              </Link>
              {supportingText && (
                <span className="text-white text-sm">{supportingText}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}