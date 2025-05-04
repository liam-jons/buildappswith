"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Internal utilities
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format-utils";

// Internal components using barrel exports
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter, 
  Avatar, 
  Badge 
} from "@/components/ui";

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
  onClick?: (id: string) => void;
  isCompact?: boolean;
}

/**
 * DiscussionCard - A component to display a discussion thread summary
 * 
 * This component renders a card with information about a discussion thread,
 * including the title, author, reply count, and activity indicators.
 * 
 * @param discussion - The discussion data to display
 * @param className - Optional additional CSS classes
 * @param onClick - Optional click handler for the card
 * @param isCompact - Whether to use a compact layout
 */
export function DiscussionCard({ 
  discussion, 
  className, 
  onClick, 
  isCompact = false 
}: DiscussionCardProps) {
  // Accessibility hook
  const shouldReduceMotion = useReducedMotion();

  // Local state
  const [isHovered, setIsHovered] = useState(false);

  // Event handlers
  const handleCardClick = () => {
    if (onClick) {
      onClick(discussion.id);
    }
  };

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "transition-shadow cursor-pointer",
          isHovered && "shadow-md",
          className
        )}
        onClick={handleCardClick}
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
                {discussion.title}
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
              {formatRelativeTime(discussion.lastActivityAt)}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
