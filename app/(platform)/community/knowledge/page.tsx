import { Metadata } from "next";
import { Suspense } from "react";

// Import actions from domain
import { getKnowledgeCategories } from "@/lib/community/actions";

// Import components from barrel exports
import { KnowledgeBase } from "@/components/community";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge,
  Button,
  Skeleton
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Knowledge Base | Community | Buildappswith",
  description: "Explore shared knowledge, tutorials, and resources from the Buildappswith community",
};

/**
 * KnowledgeBasePage - Community knowledge base listing page
 * 
 * This page displays the community knowledge base with search, filtering,
 * and category navigation for finding relevant resources.
 */
export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; topic?: string; };
}) {
  // Extract search parameters
  const searchQuery = searchParams.q;
  const categoryId = searchParams.category;
  const topicId = searchParams.topic;
  
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground max-w-prose">
            Explore shared knowledge, tutorials, and resources from the Buildappswith community.
            Find solutions, learn new techniques, and contribute your own expertise.
          </p>
        </div>
        
        <Button asChild>
          <a href="/community/knowledge/create">Share Knowledge</a>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        {/* Categories sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <CategoriesSidebar selectedCategory={categoryId} />
          </Suspense>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <KnowledgeBase 
              categoryId={categoryId} 
              searchQuery={searchQuery}
              limit={20}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Server component for the categories sidebar
async function CategoriesSidebar({ selectedCategory }: { selectedCategory?: string }) {
  const categories = await getKnowledgeCategories();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="mb-3">
            <a 
              href="/community/knowledge" 
              className={`block px-3 py-2 rounded-md ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              All Knowledge
            </a>
          </div>
          
          {categories?.map(category => (
            <div key={category.id}>
              <a 
                href={`/community/knowledge?category=${category.id}`} 
                className={`block px-3 py-2 rounded-md ${selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <div className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              </a>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col gap-2">
            <a href="/community/discussions" className="text-sm text-muted-foreground hover:text-primary">
              Discussions Forum
            </a>
            <a href="/community/events" className="text-sm text-muted-foreground hover:text-primary">
              Community Events
            </a>
            <a href="/community/members" className="text-sm text-muted-foreground hover:text-primary">
              Member Directory
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
