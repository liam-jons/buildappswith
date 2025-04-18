import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for query parameters
const loginSchema = z.object({
  email: z.string().email(),
  redirect: z.string().optional(),
});

/**
 * This route is for development purposes only!
 * It allows automatic login with the test users without password.
 * Should be disabled or protected in production.
 */
export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate parameters
    const result = loginSchema.safeParse(params);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { email, redirect } = result.data;
    
    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Try creating test users first with /api/dev/seed-users' },
        { status: 404 }
      );
    }
    
    // Sign in the user (email provider without actual verification)
    try {
      // Get verification token or create a new one
      let token = await db.verificationToken.findFirst({
        where: { 
          identifier: email,
          expires: { gt: new Date() }
        }
      });
      
      if (!token) {
        // Create a new token
        const randomToken = Math.random().toString(36).substring(2);
        token = await db.verificationToken.create({
          data: {
            identifier: email,
            token: randomToken,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          }
        });
      }
      
      // Create a callback URL for the sign-in
      const callbackUrl = redirect || '/dashboard';
      
      // Create a sign-in URL
      const signInUrl = `/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${token.token}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
      
      return NextResponse.json({
        success: true,
        message: 'Login link generated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        loginUrl: signInUrl,
        instructions: 'Click on the loginUrl to automatically sign in as this user',
      });
    } catch (signInError) {
      console.error('Error signing in:', signInError);
      return NextResponse.json(
        { error: 'Failed to generate login link', details: signInError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in dev login endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process login request', details: error },
      { status: 500 }
    );
  }
}
