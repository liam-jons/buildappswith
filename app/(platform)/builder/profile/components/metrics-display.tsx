'use client';

import { BuilderMetrics } from '@/lib/types/builder';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui";

import Particles from '@/components/magicui/particles';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';

type MetricsDisplayProps = {
  metrics: BuilderMetrics;
};

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Success Rate Card */}
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          description="Projects meeting client requirements"
          trend={+5} // Example trend value
          color="text-indigo-500"
          icon="success"
        />
        
        {/* On-Time Delivery Card */}
        <MetricCard
          title="On-Time Delivery"
          value={`${metrics.onTimeDelivery}%`}
          description="Milestones completed by agreed deadlines"
          trend={+3}
          color="text-purple-500"
          icon="delivery"
        />
        
        {/* Client Satisfaction Card */}
        <MetricCard
          title="Client Satisfaction"
          value={metrics.clientSatisfaction.toFixed(1)}
          description="Average rating out of 5"
          trend={+0.2}
          color="text-pink-500"
          icon="satisfaction"
        />
        
        {/* Entrepreneurs Created Card */}
        <MetricCard
          title="Entrepreneurs Created"
          value={metrics.entrepreneursCreated.toString()}
          description="New businesses launched through apps"
          trend={+2}
          color="text-amber-500"
          icon="entrepreneurs"
        />
      </div>
      
      {/* Simplified Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs. Platform Average</CardTitle>
          <CardDescription>
            How this builder compares to others on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ProgressBar 
              label="Success Rate" 
              value={metrics.successRate} 
              average={85} 
              color="bg-indigo-500" 
            />
            <ProgressBar 
              label="On-Time Delivery" 
              value={metrics.onTimeDelivery} 
              average={80} 
              color="bg-purple-500" 
            />
            <ProgressBar 
              label="Client Satisfaction" 
              value={metrics.clientSatisfaction * 20} 
              average={75} 
              color="bg-pink-500" 
            />
            <ProgressBar 
              label="Business Impact" 
              value={metrics.businessImpact} 
              average={70} 
              color="bg-amber-500" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  trend: number;
  color: string;
  icon: 'success' | 'delivery' | 'satisfaction' | 'entrepreneurs';
};

function MetricCard({ title, value, description, trend, color, icon }: MetricCardProps) {
  const trendColor = trend >= 0 ? 'text-green-500' : 'text-red-500';
  const trendSymbol = trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  
  return (
    <Card className="relative overflow-hidden">
      <Particles
        className="absolute inset-0 opacity-30"
        quantity={20}
        color={color.replace('text-', '')}
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon === 'satisfaction' && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        
        <div className="flex items-center mt-4">
          <span className={`inline-flex items-center text-sm font-medium ${trendColor}`}>
            {trendSymbol}
            {Math.abs(trend)}
            {title === 'Client Satisfaction' ? '' : '%'}
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

type ProgressBarProps = {
  label: string;
  value: number;
  average: number;
  color: string;
};

function ProgressBar({ label, value, average, color }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-muted-foreground mr-2"></div>
            <span className="text-sm">Avg: {average}%</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
            <span className="text-sm font-medium">{value}%</span>
          </div>
        </div>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="relative w-full h-full">
          <div 
            className="absolute h-full bg-muted-foreground" 
            style={{ width: `${average}%` }}
          ></div>
          <div 
            className={`absolute h-full ${color}`} 
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
