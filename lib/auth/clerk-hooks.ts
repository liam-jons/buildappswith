"use client";

// DEPRECATED: Use the Express SDK hooks from lib/auth/express/client-auth.ts instead
// This file is kept for backward compatibility during migration

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { UserRole } from "./types";
import { useState, useEffect } from "react";
import {
  useAuth as useExpressAuth,
  useUser as useExpressUser,
  useHasRole as useExpressHasRole,
  useIsAdmin as useExpressIsAdmin,
  useIsBuilder as useExpressIsBuilder,
  useAuthStatus as useExpressAuthStatus,
  useSignOut as useExpressSignOut
} from "@/lib/auth/express/client-auth";

/**
 * Extended user object with our custom fields
 */
export interface ExtendedUser {
  id: string;
  clerkId: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: UserRole[];
  verified: boolean;
  stripeCustomerId?: string | null;
}

/**
 * DEPRECATED: Use useHasRole from lib/auth/express/client-auth.ts instead
 * @param role Role to check for
 * @returns boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole): boolean {
  // Forward to new implementation
  return useExpressHasRole(role);
}

/**
 * DEPRECATED: Use useIsAdmin from lib/auth/express/client-auth.ts instead
 * @returns boolean indicating if the user is an admin
 */
export function useIsAdmin(): boolean {
  // Forward to new implementation
  return useExpressIsAdmin();
}

/**
 * DEPRECATED: Use useIsBuilder from lib/auth/express/client-auth.ts instead
 * @returns boolean indicating if the user is a builder
 */
export function useIsBuilder(): boolean {
  // Forward to new implementation
  return useExpressIsBuilder();
}

/**
 * DEPRECATED: Use useIsClient from lib/auth/express/client-auth.ts instead
 * @returns boolean indicating if the user is a client
 */
export function useIsClient(): boolean {
  return useHasRole(UserRole.CLIENT);
}

/**
 * DEPRECATED: Use useAuth from lib/auth/express/client-auth.ts instead
 * @returns Enhanced auth object with isAdmin, isBuilder, isClient helpers
 */
export function useAuth() {
  // Forward to new implementation
  return useExpressAuth();
}

/**
 * DEPRECATED: Use useUser from lib/auth/express/client-auth.ts instead
 * @returns ExtendedUser object or null if not authenticated
 */
export function useUser(): { user: ExtendedUser | null, isLoaded: boolean } {
  // Forward to new implementation
  return useExpressUser();
}

/**
 * DEPRECATED: Use useSignOut from lib/auth/express/client-auth.ts instead
 * @returns SignOut function that accepts options including callbackUrl
 */
export function useSignOut() {
  // Forward to new implementation
  return useExpressSignOut();
}

/**
 * DEPRECATED: Use useAuthStatus from lib/auth/express/client-auth.ts instead
 * @returns Authentication state object with isAuthenticated and isLoading
 */
export function useAuthStatus() {
  // Forward to new implementation
  return useExpressAuthStatus();
}
