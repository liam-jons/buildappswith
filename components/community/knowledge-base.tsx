// Server Component - no "use client" directive needed
import { Suspense } from "react";

// Internal utilities
import { cn } from "@/lib/utils";
import { getKnowledgeBaseItems, getPopularTopics } from "@/lib/community/actions";

// Internal components using barrel exports
import { KnowledgeItem } from "@/components/community/ui";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge, 
  Skeleton,
  Input 
} from "@/components/ui";

// Types and interfaces
interface KnowledgeBaseProps {
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
  className?: string;
}

/**
 * KnowledgeBase - Display a searchable knowledge base with articles and resources
 * 
 * This server component fetches and renders knowledge base items, with optional
 * filtering by category and search query. It includes popular topics and search.
 * 
 * @param categoryId - Optional category ID to filter by
 * @param searchQuery - Optional search query to filter by
 * @param limit - Optional limit on the number of items to display
 * @param className - Optional additional CSS classes
 */
export async function KnowledgeBase({ 
  categoryId, 
  searchQuery, 
  limit = 10,
  className 
}: KnowledgeBaseProps) {
  // Server-side data fetching
  const knowledgeItems = await getKnowledgeBaseItems({ categoryId, searchQuery, limit });
  const popularTopics = await getPopularTopics();
  
  // Error handling
  if (!knowledgeItems) {
    return (
      <div className="p-6 bg-destructive/10 rounded-lg border border-destructive">
        <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
        <p>Unable to load knowledge base content. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and filter section */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search box - client component will handle submission */}
        <div className="flex-1">
          <form action="/community/knowledge" className="relative">
            <Input
              type="search"
              name="q"
              placeholder="Search knowledge base..."
              className="w-full"
              defaultValue={searchQuery}
            />
            {searchQuery && (
              <input type="hidden" name="clear" value="true" />
            )}
          </form>
        </div>
        
        {/* Popular topics */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Popular topics:</span>
          <Suspense fallback={<Skeleton className="h-6 w-32" />}>
            <div className="flex flex-wrap gap-2">
              {popularTopics.slice(0, 5).map(topic => (
                <a key={topic.id} href={`/community/knowledge?topic=${topic.id}`}>
                  <Badge variant="outline" className="hover:bg-secondary">
                    {topic.name}
                  </Badge>
                </a>
              ))}
            </div>
          </Suspense>
        </div>
      </div>
      
      {/* Knowledge base content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery 
              ? `Search results for "${searchQuery}"` 
              : categoryId 
                ? `Category: ${knowledgeItems[0]?.category?.name || 'Unknown'}`
                : "Knowledge Base"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {knowledgeItems.length > 0 ? (
            <div className="space-y-4">
              {knowledgeItems.map(item => (
                <Suspense key={item.id} fallback={<Skeleton className="h-20 w-full" />}>
                  <KnowledgeItem item={item} />
                </Suspense>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No knowledge base items found matching your criteria.</p>
              <a href="/community/knowledge" className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                View All Knowledge
              </a>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create knowledge item CTA - only shown if items exist */}
      {knowledgeItems.length > 0 && (
        <div className="text-center pt-4">
          <a href="/community/knowledge/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Share Your Knowledge
          </a>
        </div>
      )}
    </div>
  );
}
