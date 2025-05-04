import { Metadata } from "next";
import { Suspense } from "react";

// Import actions from domain
import { getRecentDiscussions, getLatestKnowledgeItems, getUpcomingEvents } from "@/lib/community/actions";

// Import components from barrel exports
import { KnowledgeBase } from "@/components/community";
import { DiscussionCard } from "@/components/community/ui";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Skeleton,
  Button
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Community | Buildappswith",
  description: "Connect, learn, and share with the Buildappswith community",
};

/**
 * CommunityPage - Main community hub page
 * 
 * This page serves as the central hub for all community activities,
 * showcasing discussions, knowledge base, events, and member spotlights.
 */
export default async function CommunityPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Community</h1>
          <p className="text-muted-foreground max-w-prose">
            Connect, learn, and share with the Buildappswith community. Explore discussions,
            knowledge resources, upcoming events, and more.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <a href="/community/knowledge/create">Share Knowledge</a>
          </Button>
          <Button asChild>
            <a href="/community/discussions/create">Start Discussion</a>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="discussions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions" className="space-y-6">
          <Suspense fallback={<DiscussionsFallback />}>
            <RecentDiscussions />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="knowledge" className="space-y-6">
          <Suspense fallback={<KnowledgeBaseFallback />}>
            <KnowledgeBase limit={5} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6">
          <Suspense fallback={<EventsFallback />}>
            <UpcomingEvents />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Server components for each tab section

async function RecentDiscussions() {
  const discussions = await getRecentDiscussions(8);
  
  if (!discussions || discussions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Discussions</CardTitle>
          <CardDescription>
            No discussions found. Be the first to start a conversation!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Button asChild>
            <a href="/community/discussions/create">Start a Discussion</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Discussions</CardTitle>
          <CardDescription>
            Join conversations, ask questions, and share your insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {discussions.map(discussion => (
              <DiscussionCard 
                key={discussion.id} 
                discussion={discussion} 
                onClick={(id) => window.location.href = `/community/discussions/${id}`}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <a href="/community/discussions">View All Discussions</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function UpcomingEvents() {
  const events = await getUpcomingEvents(4);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>
          Join online workshops, webinars, and community meetups
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map(event => (
              <Card key={event.id}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.startDate).toLocaleDateString()} · {event.startTime}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm mb-4">{event.description}</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={`/community/events/${event.id}`}>View Details</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No upcoming events at this time.</p>
            <Button asChild variant="outline">
              <a href="/community/events">View Calendar</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Fallback components for loading states

function DiscussionsFallback() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KnowledgeBaseFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EventsFallback() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
