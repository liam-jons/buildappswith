'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/auth/types';


interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[] | null>(null);

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();

        if (!session || !session.user) {
          setIsAuthenticated(false);
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

        setIsAuthenticated(true);
        setUserRoles(session.user.roles as UserRole[] || []);

        // Check if user has required role
        if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = session.user.roles && session.user.roles.some((userRole: UserRole) => 
        requiredRoles.includes(userRole)
        );
        
          if (!hasRequiredRole) {
            router.push('/dashboard'); // Redirect to dashboard if user doesn't have required role
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, requiredRoles]);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated and has required role (or no role specified), render children
  if (isAuthenticated && 
    (!requiredRoles || 
     requiredRoles.length === 0 || 
     (userRoles && userRoles.some(role => requiredRoles.includes(role))))) {
    return <>{children}</>;
  }

  // Render nothing if not authenticated or doesn't have required role
  // (redirections are handled in the useEffect)
  return null;
}
