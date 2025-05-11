// Server component version of the DiscussionCard

import { Card, CardContent, CardHeader, CardTitle, CardFooter, Avatar, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

// Types and interfaces
interface DiscussionTopic {
  id: string;
  name: string;
  color?: string;
}

interface DiscussionAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface DiscussionData {
  id: string;
  title: string;
  excerpt: string;
  author: DiscussionAuthor;
  replyCount: number;
  upvotes: number;
  lastActivityAt: string;
  topics: DiscussionTopic[];
  isAnswered?: boolean;
  isPinned?: boolean;
}

interface DiscussionCardProps {
  discussion: DiscussionData;
  className?: string;
  isCompact?: boolean;
}

/**
 * ServerDiscussionCard - A server component version of the DiscussionCard
 * 
 * This component renders a card with information about a discussion thread,
 * without any client-side interactivity.
 */
export function ServerDiscussionCard({ 
  discussion, 
  className, 
  isCompact = false 
}: DiscussionCardProps) {
  // Format the relative time in a way that works on the server
  const formatRelativeTimeServer = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Just return the date in a simple format for server rendering
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <Card 
        className={cn(
          "transition-shadow",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex gap-2 items-center mb-1">
                {discussion.isPinned && (
                  <span className="text-xs font-medium text-amber-500">
                    📌 Pinned
                  </span>
                )}
                {discussion.isAnswered && (
                  <span className="text-xs font-medium text-emerald-500">
                    ✓ Answered
                  </span>
                )}
              </div>
              <CardTitle className={cn(
                "font-semibold text-primary",
                isCompact ? "text-base" : "text-lg"
              )}>
                <a href={`/community/discussions/${discussion.id}`}>
                  {discussion.title}
                </a>
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn(
          isCompact ? "pb-3" : "pb-4"
        )}>
          {!isCompact && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {discussion.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {discussion.topics.map(topic => (
              <Badge 
                key={topic.id} 
                variant="secondary"
                className={cn(
                  "text-xs",
                  topic.color && `bg-${topic.color}-100 text-${topic.color}-800`
                )}
              >
                {topic.name}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className={cn(
          "flex justify-between pt-0",
          isCompact ? "text-xs" : "text-sm"
        )}>
          <div className="flex items-center gap-2">
            <Avatar 
              src={discussion.author.avatarUrl} 
              alt={discussion.author.name}
              className={cn(
                isCompact ? "h-5 w-5" : "h-6 w-6"
              )}
            />
            <span className="text-muted-foreground">
              {discussion.author.name}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-primary">▲</span>
              <span>{discussion.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💬</span>
              <span>{discussion.replyCount}</span>
            </div>
            <div>
              {formatRelativeTimeServer(discussion.lastActivityAt)}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}