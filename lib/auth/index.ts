// Export everything needed from our auth implementation
import { auth, signIn, signOut } from "./auth";

// Export the auth configuration for use with getServerSession
export const authOptions = {
  // Provide the auth configuration for getServerSession usage
  // This is needed because some files directly import authOptions
  callbacks: {
    // These callbacks should match the ones in auth.ts
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.stripeCustomerId = user.stripeCustomerId;
        token.verified = user.verified || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.stripeCustomerId = token.stripeCustomerId;
        session.user.verified = token.verified;
      }
      return session;
    },
  },
};

// Re-export the auth instance, signIn, signOut from auth.ts
export { auth, signIn, signOut };

// Re-export types and hooks for easy access
export * from "./types";
export * from "./hooks";
