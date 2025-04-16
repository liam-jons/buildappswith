'use client';

import { BuilderMetrics } from '@/lib/types/builder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Particles } from '@/components/magicui/particles';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';

type MetricsDisplayProps = {
  metrics: BuilderMetrics;
};

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  // Format the metrics into chart data
  const chartData = [
    {
      name: 'Success Rate',
      value: metrics.successRate,
      average: 85, // Platform average (could be fetched from API)
      fill: '#4f46e5', // primary color
    },
    {
      name: 'On-Time Delivery',
      value: metrics.onTimeDelivery,
      average: 80,
      fill: '#8b5cf6', // purple
    },
    {
      name: 'Client Satisfaction',
      value: metrics.clientSatisfaction * 20, // Convert 1-5 to percentage
      average: 75,
      fill: '#ec4899', // pink
    },
    {
      name: 'Business Impact',
      value: metrics.businessImpact,
      average: 70,
      fill: '#f59e0b', // amber
    }
  ];

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
      
      {/* Comparative Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs. Platform Average</CardTitle>
          <CardDescription>
            How this builder compares to others on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: 'var(--foreground)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, undefined]}
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Builder" fill="var(--primary)" />
                <Bar dataKey="average" name="Platform Average" fill="var(--muted-foreground)" />
              </BarChart>
            </ResponsiveContainer>
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
