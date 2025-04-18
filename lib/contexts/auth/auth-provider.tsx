"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component that wraps the application with SessionProvider
 * for NextAuth authentication
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
