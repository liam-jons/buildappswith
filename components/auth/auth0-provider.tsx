"use client";

// In v4.4.2, UserProvider must be imported specifically from /client
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ReactNode } from 'react';

export function Auth0Provider({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
