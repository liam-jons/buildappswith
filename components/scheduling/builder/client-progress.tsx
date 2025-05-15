'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Progress } from '@/components/ui/core/progress';
import { Badge } from '@/components/ui/core/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/core/tabs';
import { CheckCircle2, Circle, Lock, TrendingUp } from 'lucide-react';
import { PATHWAYS } from '@/lib/constants/pathways';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  completedAt?: Date;
}

interface ClientProgressProps {
  clientId: string;
  pathway: string;
  className?: string;
}

export function ClientProgress({ clientId, pathway, className }: ClientProgressProps) {
  const [progress, setProgress] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (clientId && pathway) {
      setIsLoading(true);
      fetchClientProgress(clientId, pathway)
        .then(data => {
          setProgress(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching client progress:', error);
          setIsLoading(false);
        });
    }
  }, [clientId, pathway]);
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!progress) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No progress data available</p>
        </CardContent>
      </Card>
    );
  }
  
  const pathwayInfo = PATHWAYS[pathway.toUpperCase() as keyof typeof PATHWAYS];
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Progress Tracking</CardTitle>
            <CardDescription>
              {pathwayInfo?.name} Pathway - {progress.client.name}
            </CardDescription>
          </div>
          <div className="text-2xl">{pathwayInfo?.icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress.completedSkills}/{progress.totalSkills} skills
            </span>
          </div>
          <Progress value={progress.overallProgress} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {Math.round(progress.overallProgress)}% Complete
          </p>
        </div>
        
        {/* Tier Progress */}
        <Tabs defaultValue="tier1" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tier1">
              {pathwayInfo?.tiers.tier1.name || 'Tier 1'}
            </TabsTrigger>
            <TabsTrigger value="tier2">
              {pathwayInfo?.tiers.tier2.name || 'Tier 2'}
            </TabsTrigger>
            <TabsTrigger value="tier3">
              {pathwayInfo?.tiers.tier3.name || 'Tier 3'}
            </TabsTrigger>
          </TabsList>
          
          {['tier1', 'tier2', 'tier3'].map((tier) => (
            <TabsContent key={tier} value={tier} className="mt-4">
              <div className="space-y-3">
                {progress.tiers[tier].skills.map((skill: Skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {skill.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : skill.status === 'in_progress' ? (
                        <Circle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {skill.status === 'in_progress' && (
                        <div className="w-20">
                          <Progress value={skill.progress} className="h-2" />
                        </div>
                      )}
                      <Badge
                        variant={
                          skill.status === 'completed'
                            ? 'default'
                            : skill.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {skill.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tier Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {pathwayInfo?.tiers[tier as keyof typeof pathwayInfo.tiers].name} Progress
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {progress.tiers[tier].completed}/{progress.tiers[tier].total} skills completed
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(progress.tiers[tier].progress)}%
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Recent Activity */}
        {progress.recentActivity && progress.recentActivity.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {progress.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>{activity.description}</span>
                  <span className="text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mock function for fetching client progress
async function fetchClientProgress(clientId: string, pathway: string) {
  // In production, this would be an actual API call
  // For now, we'll return mock data
  return {
    client: { id: clientId, name: 'John Doe' },
    pathway: pathway,
    overallProgress: 65,
    completedSkills: 13,
    totalSkills: 20,
    tiers: {
      tier1: {
        progress: 100,
        completed: 7,
        total: 7,
        skills: [
          {
            id: '1',
            name: 'AI Fundamentals',
            description: 'Understanding basic AI concepts',
            category: 'foundation',
            tier: 'tier1',
            status: 'completed',
            progress: 100,
            completedAt: new Date('2024-01-15'),
          },
          // Add more skills...
        ],
      },
      tier2: {
        progress: 60,
        completed: 6,
        total: 10,
        skills: [
          {
            id: '8',
            name: 'Prompt Engineering',
            description: 'Creating effective AI prompts',
            category: 'application',
            tier: 'tier2',
            status: 'in_progress',
            progress: 75,
          },
          // Add more skills...
        ],
      },
      tier3: {
        progress: 0,
        completed: 0,
        total: 3,
        skills: [
          {
            id: '18',
            name: 'AI Strategy',
            description: 'Developing AI implementation strategies',
            category: 'mastery',
            tier: 'tier3',
            status: 'not_started',
            progress: 0,
          },
          // Add more skills...
        ],
      },
    },
    recentActivity: [
      {
        description: 'Completed "AI Fundamentals" skill',
        timestamp: new Date('2024-01-15'),
      },
      {
        description: 'Started "Prompt Engineering" skill',
        timestamp: new Date('2024-01-18'),
      },
    ],
  };
}