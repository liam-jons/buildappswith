import { UserRole } from "@/lib/auth/types";
import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify",
    newUser: "/onboarding",
  },
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "placeholder-client-secret",
    }),
    // Only use EmailProvider in server contexts, not in middleware
    process.env.NODE_ENV !== "production" || (typeof process.env.NEXT_RUNTIME === 'undefined' || process.env.NEXT_RUNTIME !== 'edge')
      ? EmailProvider({
          server: {
            host: process.env.EMAIL_SERVER_HOST || "localhost",
            port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : 25,
            auth: {
              user: process.env.EMAIL_SERVER_USER || "",
              pass: process.env.EMAIL_SERVER_PASSWORD || "",
            },
          },
          from: process.env.EMAIL_FROM || "noreply@buildappswith.dev",
        })
      : null,
  ].filter(Boolean), // Filter out null values
  callbacks: {
    // Include user.id and user.role in the JWT token
    async jwt({ token, user }) {
      // First time JWT is created after sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || UserRole.CLIENT;
        token.stripeCustomerId = user.stripeCustomerId;
        token.verified = user.verified || false;
      }
      
      return token;
    },
    
    // Include user info in the session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.stripeCustomerId = token.stripeCustomerId;
        session.user.verified = token.verified;
      }
      return session;
    },
    
    // Custom authorization logic
    async authorized({ auth, request }) {
      // In middleware, check if the user is authenticated for protected routes
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
                          request.nextUrl.pathname.startsWith("/signup") ||
                          request.nextUrl.pathname.startsWith("/signin");
      
      // Allow access to auth routes when not logged in
      if (!isLoggedIn && isAuthRoute) {
        return true;
      }
      
      // Redirect to login if accessing protected route without being logged in
      if (!isLoggedIn) {
        return false;
      }
      
      // If accessing auth routes while logged in, redirect to dashboard
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", request.nextUrl.origin));
      }
      
      // Allow authenticated users to access other routes
      return true;
    },
  },
});
