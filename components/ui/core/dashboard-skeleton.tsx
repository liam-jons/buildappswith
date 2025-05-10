"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from './card';

/**
 * DashboardSkeleton
 * 
 * A loading skeleton for the dashboard page with animated pulse effects
 * Used in the Suspense fallback for the main dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-3 w-32 mt-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main section */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}