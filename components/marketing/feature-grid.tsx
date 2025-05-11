import { cn } from "@/lib/utils";
import { FeatureCard } from "./ui/feature-card";

export interface FeatureGridItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  readMoreLink?: string;
}

export interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features: FeatureGridItem[];
  className?: string;
  columns?: 2 | 3 | 4;
  variant?: "default" | "bento" | "compact";
  id?: string;
  withAnimation?: boolean;
  withNumberPrefix?: boolean;
}

export function FeatureGrid({
  title = "Platform Features",
  subtitle = "Everything you need to bring your AI-powered application to life",
  features = [],
  className,
  columns = 3,
  variant = "default",
  id = "features",
  withAnimation = false,
  withNumberPrefix = false,
}: FeatureGridProps) {
  return (
    <section
      id={id}
      className={cn(
        "flex flex-col items-center justify-center w-full py-20",
        variant === "bento" && "px-5 md:px-10",
        className
      )}
    >
      {variant === "bento" ? (
        <div className="border-x mx-5 md:mx-10 relative max-w-7xl w-full">
          <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
          <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4 text-balance">
              {title}
            </h2>
            <p className="text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                {...feature}
                variant="bento"
                index={index}
                numberPrefix={withNumberPrefix}
                withAnimation={withAnimation}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="container px-4 sm:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4">{title}</h2>
            <p className="text-muted-foreground font-medium max-w-2xl mx-auto">{subtitle}</p>
          </div>

          <div
            className={cn(
              "grid gap-6 mx-auto",
              columns === 2 && "grid-cols-1 md:grid-cols-2",
              columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
              variant === "compact" && "md:gap-4"
            )}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                {...feature}
                variant={variant}
                index={index}
                numberPrefix={withNumberPrefix}
                withAnimation={withAnimation}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Maintain default export for backward compatibility
export default FeatureGrid;