'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Badge } from '@/components/ui/core/badge';
import { Button } from '@/components/ui/core/button';
import { Clock, DollarSign, Lock, Unlock } from 'lucide-react';
import { SessionType } from '@/lib/scheduling/types';
import { cn } from '@/lib/utils';

interface SessionTypeCategoryProps {
  title: string;
  sessions: SessionType[];
  onSelect: (session: SessionType) => void;
  className?: string;
}

export function SessionTypeCategory({ title, sessions, onSelect, className }: SessionTypeCategoryProps) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {session.requiresAuth ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
              <CardDescription>{session.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{session.durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{session.price} {session.currency}</span>
                  </div>
                </div>
                
                {session.eventTypeCategory && (
                  <Badge variant={getCategoryVariant(session.eventTypeCategory)}>
                    {getCategoryLabel(session.eventTypeCategory)}
                  </Badge>
                )}
                
                <Button
                  onClick={() => onSelect(session)}
                  className="w-full"
                  variant={session.price === 0 ? "secondary" : "default"}
                >
                  {session.price === 0 ? "Book Free Session" : "Book Session"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getCategoryVariant(category: string): "default" | "secondary" | "outline" | "destructive" {
  switch (category) {
    case 'free':
      return 'secondary';
    case 'pathway':
      return 'default';
    case 'specialized':
      return 'outline';
    default:
      return 'default';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'free':
      return 'Free';
    case 'pathway':
      return 'Learning Pathway';
    case 'specialized':
      return 'Specialized';
    default:
      return category;
  }
}