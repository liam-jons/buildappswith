import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  message,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4">
        <div 
          className={cn(
            "rounded-full border-primary/30 border-t-primary animate-spin", 
            sizeClasses[size]
          )}
        ></div>
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}