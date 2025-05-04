import { cn } from "@/lib/utils";
import { getLearningCapabilities } from "@/lib/learning/actions";
import { LearningCapability } from "@/lib/learning/types";

// UI components using barrel exports
import { TimelineItem } from "@/components/learning/ui";
import { Button } from "@/components/ui";

// Types and interfaces
interface TimelineProps {
  initialFilter?: string;
  className?: string;
}

/**
 * Learning Timeline Component
 * 
 * Displays an interactive timeline of AI capabilities, showing what AI can and cannot do.
 * This is a server component that fetches the capabilities data server-side and renders
 * the appropriate visualization with interactive filtering.
 * 
 * @param initialFilter - Optional initial filter to apply to the timeline
 * @param className - Optional additional classes for the component
 */
export async function Timeline({ initialFilter, className }: TimelineProps) {
  // Server-side data fetching
  const capabilities = await getLearningCapabilities(initialFilter);
  
  // Error handling
  if (!capabilities || capabilities.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Timeline Data Unavailable</h2>
        <p className="mb-4">We couldn't load the AI capability timeline data at this time.</p>
        <Button>Retry</Button>
      </div>
    );
  }
  
  // Group capabilities by category
  const categorizedCapabilities = capabilities.reduce<Record<string, LearningCapability[]>>(
    (acc, capability) => {
      const category = capability.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(capability);
      return acc;
    },
    {}
  );
  
  return (
    <div className={cn("timeline-container", className)}>
      <h2 className="text-2xl font-bold mb-6">What AI Can & Cannot Do</h2>
      
      {Object.entries(categorizedCapabilities).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{category}</h3>
          <div className="space-y-4">
            {items.map((capability) => (
              <TimelineItem 
                key={capability.id} 
                capability={capability}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
