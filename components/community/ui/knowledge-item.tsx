"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Internal utilities
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format-utils";

// Internal components using barrel exports
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  Avatar,
  AvatarImage,
  AvatarFallback, 
  Badge,
  Button
} from "@/components/ui";

// Types and interfaces
interface KnowledgeItemAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface KnowledgeItemCategory {
  id: string;
  name: string;
}

interface KnowledgeItemTag {
  id: string;
  name: string;
  color?: string;
}

interface KnowledgeItemData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: KnowledgeItemAuthor;
  createdAt: string;
  updatedAt: string;
  helpfulCount: number;
  viewCount: number;
  category: KnowledgeItemCategory;
  tags: KnowledgeItemTag[];
}

interface KnowledgeItemProps {
  item: KnowledgeItemData;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: (id: string, expanded: boolean) => void;
}

/**
 * KnowledgeItem - A component to display a knowledge base entry
 * 
 * This component renders a card with information about a knowledge base entry,
 * including the title, content preview, author, and metadata.
 * 
 * @param item - The knowledge item data to display
 * @param className - Optional additional CSS classes
 * @param isExpanded - Whether the item is expanded to show full content
 * @param onToggleExpand - Optional callback for expand/collapse actions
 */
export function KnowledgeItem({ 
  item, 
  className, 
  isExpanded: initialExpanded = false,
  onToggleExpand 
}: KnowledgeItemProps) {
  // Accessibility hook
  const shouldReduceMotion = useReducedMotion();

  // Local state
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isHelpful, setIsHelpful] = useState(false);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(item.helpfulCount);

  // Event handlers
  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (onToggleExpand) {
      onToggleExpand(item.id, newExpandedState);
    }
  };

  const handleMarkHelpful = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHelpful) {
      setIsHelpful(true);
      setLocalHelpfulCount(prev => prev + 1);
      // In a real implementation, this would call an API to mark the item as helpful
    }
  };

  return (
    <motion.div
      initial={false}
      animate={isExpanded ? { height: "auto" } : { height: "auto" }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      <Card 
        className={cn(
          "transition-shadow",
          isExpanded && "shadow-md",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex gap-2 items-center mb-1">
                <Badge variant="outline" className="bg-primary/10">
                  {item.category.name}
                </Badge>
              </div>
              <CardTitle 
                className="font-semibold text-primary text-lg cursor-pointer hover:underline"
                onClick={handleToggleExpand}
              >
                {item.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isExpanded ? (
            <div className="prose max-w-none prose-headings:mt-4 prose-headings:mb-2">
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {item.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {item.tags.map(tag => (
              <Badge 
                key={tag.id} 
                variant="secondary"
                className={cn(
                  "text-xs",
                  tag.color && `bg-${tag.color}-100 text-${tag.color}-800`
                )}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-0 text-sm">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={item.author.avatarUrl} 
                alt={item.author.name}
              />
              <AvatarFallback>
                {item.author.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">
              {item.author.name}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="hidden sm:block">
              {formatDate(item.updatedAt)}
            </div>
            
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span>{item.viewCount}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs gap-1",
                isHelpful && "text-green-600"
              )}
              onClick={handleMarkHelpful}
              disabled={isHelpful}
            >
              <span>👍</span>
              <span>{localHelpfulCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleToggleExpand}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
