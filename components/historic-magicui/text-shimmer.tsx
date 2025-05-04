import { cn } from "@/lib/utils";
import { CSSProperties, FC, ReactNode } from "react";

interface TextShimmerProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

const TextShimmer: FC<TextShimmerProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <div
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "inline-block text-transparent bg-clip-text",
        "animate-shimmer bg-[linear-gradient(to_right,theme(colors.neutral.100)_0%,theme(colors.black/80)_50%,theme(colors.neutral.100)_100%)] dark:bg-[linear-gradient(to_right,theme(colors.neutral.900)_0%,theme(colors.white/80)_50%,theme(colors.neutral.900)_100%)]",
        "[background-size:var(--shimmer-width)_100%] [background-position:0_0] [background-repeat:no-repeat] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        className
      )}
    >
      {children}
    </div>
  );
};

// Export both as named export and default export
export { TextShimmer };
export default TextShimmer;
