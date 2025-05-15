'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Badge } from '@/components/ui/core/badge';
import { Progress } from '@/components/ui/core/progress';
import { PATHWAYS } from '@/lib/constants/pathways';
import { BarChart, Users, TrendingUp, Target } from 'lucide-react';

interface PathwayAnalytic {
  pathway: string;
  totalClients: number;
  activeClients: number;
  completedClients: number;
  averageProgress: number;
  completionRate: number;
  averageDuration: number; // in days
  popularSkills: Array<{
    name: string;
    completions: number;
  }>;
}

interface PathwayAnalyticsProps {
  analytics: PathwayAnalytic[];
  className?: string;
}

export function PathwayAnalytics({ analytics, className }: PathwayAnalyticsProps) {
  const getPathwayInfo = (pathway: string) => {
    const uppercasePathway = pathway.toUpperCase();
    return PATHWAYS[uppercasePathway as keyof typeof PATHWAYS] || null;
  };
  
  const getTotalMetrics = () => {
    const total = analytics.reduce(
      (acc, curr) => ({
        totalClients: acc.totalClients + curr.totalClients,
        activeClients: acc.activeClients + curr.activeClients,
        completedClients: acc.completedClients + curr.completedClients,
      }),
      { totalClients: 0, activeClients: 0, completedClients: 0 }
    );
    
    return total;
  };
  
  const totalMetrics = getTotalMetrics();
  
  return (
    <div className={className}>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Across all pathways
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              Currently progressing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.completedClients}</div>
            <p className="text-xs text-muted-foreground">
              Finished pathways
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                analytics.reduce((acc, curr) => acc + curr.averageProgress, 0) /
                  analytics.length
              )}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall average
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Pathway Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {analytics.map((pathwayData) => {
          const pathwayInfo = getPathwayInfo(pathwayData.pathway);
          
          return (
            <Card key={pathwayData.pathway} className="overflow-hidden">
              <CardHeader
                className="pb-3"
                style={{
                  backgroundColor: pathwayInfo ? `${pathwayInfo.color}10` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {pathwayInfo && (
                        <span className="text-2xl">{pathwayInfo.icon}</span>
                      )}
                      {pathwayInfo?.name || pathwayData.pathway}
                    </CardTitle>
                    <CardDescription>
                      {pathwayInfo?.description || 'Pathway analytics'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Client Statistics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Client Distribution</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Active</Badge>
                        <span className="text-sm">{pathwayData.activeClients}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Completed</Badge>
                        <span className="text-sm">{pathwayData.completedClients}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Total</Badge>
                        <span className="text-sm">{pathwayData.totalClients}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Metrics */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Average Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(pathwayData.averageProgress)}%
                      </span>
                    </div>
                    <Progress value={pathwayData.averageProgress} className="h-2" />
                  </div>
                  
                  {/* Completion Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(pathwayData.completionRate)}%
                      </span>
                    </div>
                    <Progress
                      value={pathwayData.completionRate}
                      className="h-2"
                      // @ts-ignore - Custom color
                      indicatorClassName="bg-green-600"
                    />
                  </div>
                  
                  {/* Average Duration */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Duration</span>
                    <span className="text-sm text-muted-foreground">
                      {pathwayData.averageDuration} days
                    </span>
                  </div>
                  
                  {/* Popular Skills */}
                  {pathwayData.popularSkills.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Popular Skills</p>
                      <div className="space-y-1">
                        {pathwayData.popularSkills.slice(0, 3).map((skill, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-muted-foreground">
                              {skill.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {skill.completions}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}