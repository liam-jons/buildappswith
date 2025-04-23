import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { UserRole } from "./types";

// Define a schema for credentials validation
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig = {
  // Configure pages
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
    verifyRequest: "/verify-request",
    newUser: "/signup",
  },
  
  // Define callbacks
  callbacks: {
    // Add role to the JWT token
    jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
      }
      return token;
    },
    
    // Add role to the session
    session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore - We're adding custom properties
        session.user.roles = token.roles;
        // @ts-ignore - We're adding custom properties
        session.user.id = token.id as string;
        // @ts-ignore - We're adding custom properties
        session.user.verified = token.verified as boolean;
        // @ts-ignore - We're adding custom properties
        session.user.stripeCustomerId = token.stripeCustomerId as string | undefined;
      }
      return session;
    },
    
    // Control authentication based on conditions
    authorized({ auth, request }) {
      // If there is a session, the user is authenticated
      return !!auth?.user;
    },
  },
  
  // Configure providers
  providers: [
    // Email/Password provider
    Credentials({
      // The name to display on the sign-in form
      name: "credentials",
      
      // Define credentials schema
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      // Authorize callback - validate credentials and return user data
      async authorize(credentials, req) {
        // Validate credentials using Zod schema
        const validatedCredentials = credentialsSchema.safeParse(credentials);
        
        if (!validatedCredentials.success) {
          return null;
        }
        
        // For demo purposes, we're using a simple check
        // In a real app, you would validate against a database
        const { email, password } = validatedCredentials.data;
        
        // Demo users for testing - REPLACE THIS WITH REAL DATABASE LOOKUP
        const users = [
          { id: "1", name: "Sarah", email: "client@example.com", password: "password123", roles: ["CLIENT"] },
          { id: "2", name: "Miguel", email: "learner@example.com", password: "password123", roles: ["CLIENT"] },
          { id: "3", name: "Aisha", email: "builder@example.com", password: "password123", roles: ["BUILDER"] },
        ];
        
        const user = users.find((user) => user.email === email);
        
        if (!user || user.password !== password) {
          return null;
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles as UserRole[],
          image: null, // No images for demo users
          verified: true,
        };
      },
    }),
    
    // OAuth providers (add API keys to .env.local)
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  
  // Session configuration
  session: {
    strategy: "jwt",
  },
  
  // Secret for encryption
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
