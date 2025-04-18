import { TimelineContainer } from '@/components/timeline/timeline-container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What AI Can/Can\'t Do Timeline | Buildappswith',
  description: 'Explore the evolution of AI capabilities, their practical applications, and limitations in our interactive timeline.',
};

/**
 * Timeline Page Component
 * 
 * The "What AI Can/Can't Do" Timeline provides an interactive, chronological visualization 
 * of AI capabilities serving as both an educational resource and historical record.
 */
export default function TimelinePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">What AI Can/Can&apos;t Do</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A living timeline of AI capabilities, their practical applications, and limitations.
        </p>
        
        <TimelineContainer />
      </div>
    </div>
  );
}
