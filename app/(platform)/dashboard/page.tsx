'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();

        if (session?.user) {
          setUser(session.user);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session:', error);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Redirect to role-specific dashboards if applicable
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'BUILDER') {
        // router.push('/builder-dashboard');
        // Commented out due to issues with the builder-dashboard page
      } else if (user.role === 'CLIENT') {
        router.push('/client-dashboard');
      }
      // Admin users stay on the main dashboard
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-card p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Buildappswith dashboard, {user?.name || 'User'}!
        </p>
        {user?.role && (
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {user.role} Account
          </div>
        )}
      </section>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Quick Links</h3>
          <ul className="space-y-2 mt-4">
            {user?.role === 'BUILDER' && (
              <li>
                <a href="#" className="text-primary hover:underline" 
                   onClick={(e) => { e.preventDefault(); alert('Builder Dashboard is currently unavailable. We need to fix some directory issues.'); }}>
                  Builder Dashboard
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  (Currently unavailable - directory issue)
                </p>
              </li>
            )}
            {user?.role === 'CLIENT' && (
              <li>
                <a href="/client-dashboard" className="text-primary hover:underline">
                  Client Dashboard
                </a>
              </li>
            )}
            <li>
              <a href="/profile" className="text-primary hover:underline">
                My Profile
              </a>
            </li>
            <li>
              <a href="/api/auth/signout" className="text-primary hover:underline">
                Sign Out
              </a>
            </li>
          </ul>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Your latest activities on the platform</p>
          <div className="text-center py-8">
            <p>No recent activity</p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Platform Updates</h3>
          <p className="text-sm text-muted-foreground">The latest news and features</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-medium">New Scheduling API</p>
              <p className="text-sm text-muted-foreground">Enhanced scheduling system with real-time updates</p>
            </div>
            <div>
              <p className="font-medium">Authentication Improvements</p>
              <p className="text-sm text-muted-foreground">Better security and easier login process</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-card rounded-lg shadow">
        <h3 className="text-xl font-medium mb-4">Development Tools</h3>
        <p className="mb-4">These tools are available in development mode to help with testing:</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border p-4 rounded-md">
            <h4 className="font-medium">Create Test Users</h4>
            <p className="text-sm text-muted-foreground my-2">Creates admin, builder, and client test users</p>
            <a 
              href="/api/dev/seed-users" 
              target="_blank" 
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors mt-2"
            >
              Create Test Users
            </a>
          </div>
          
          <div className="border border-border p-4 rounded-md">
            <h4 className="font-medium">Quick Login</h4>
            <p className="text-sm text-muted-foreground my-2">Choose a test user to login as:</p>
            <div className="flex flex-col gap-2 mt-2">
              <a 
                href="/api/dev/login?email=admin@buildappswith.dev" 
                target="_blank" 
                className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors text-sm"
              >
                Login as Admin
              </a>
              <a 
                href="/api/dev/login?email=builder@buildappswith.dev" 
                target="_blank" 
                className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors text-sm"
              >
                Login as Builder
              </a>
              <a 
                href="/api/dev/login?email=client@buildappswith.dev" 
                target="_blank" 
                className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors text-sm"
              >
                Login as Client
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
