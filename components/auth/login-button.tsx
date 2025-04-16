"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoginButtonProps {
  variant?: 'login' | 'signup';
  className?: string;
}

export function LoginButton({ variant = 'login', className }: LoginButtonProps = {}) {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <Button disabled className={className}>Loading...</Button>;
  
  if (session) {
    return (
      <Button variant="outline" onClick={() => signOut()} className={className}>
        Log Out
      </Button>
    );
  }
  
  if (variant === 'signup') {
    return (
      <Button asChild className={cn('bg-primary', className)} onClick={() => signIn(undefined, { callbackUrl: '/profile' })}>
        <span>Sign Up</span>
      </Button>
    );
  }
  
  return (
    <Button variant="outline" onClick={() => signIn()} className={className}>
      Log In
    </Button>
  );
}
