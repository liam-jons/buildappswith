import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

/**
 * This route is for development purposes only!
 * It creates test users with different roles for testing.
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
    // Run a simple database query to test connection
    try {
      await db.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError },
        { status: 500 }
      );
    }
    
    // Create test users with different roles
    const users = [
      {
        name: 'Test Admin',
        email: 'admin@buildappswith.dev',
        role: 'ADMIN', // Use the exact value from the Prisma schema
      },
      {
        name: 'Test Builder',
        email: 'builder@buildappswith.dev',
        role: 'BUILDER', // Use the exact value from the Prisma schema
      },
      {
        name: 'Test Client',
        email: 'client@buildappswith.dev',
        role: 'CLIENT', // Use the exact value from the Prisma schema
      },
    ];

    const createdUsers = [];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        createdUsers.push({
          ...existingUser,
          status: 'already exists',
        });
        continue;
      }

      // Create new user
      try {
        const user = await db.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            role: userData.role as Prisma.UserRole, // Cast to Prisma.UserRole
            verified: true,
            emailVerified: new Date(),
          },
        });

        // Generate a verification token for password reset
        const token = crypto.randomBytes(32).toString('hex');
        
        // Store the token
        await db.verificationToken.create({
          data: {
            identifier: user.email,
            token,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

        // Create profile based on role
        if (userData.role === 'BUILDER') {
          await db.builderProfile.create({
            data: {
              userId: user.id,
              headline: 'Experienced AI Developer',
              bio: 'I help businesses implement AI solutions that drive real results.',
              hourlyRate: 120,
              featuredBuilder: true,
              domains: ['AI Applications', 'Web Development', 'Data Science'],
              badges: ['Top Rated', 'Verified Skills'],
              rating: 4.9,
              validationTier: 2, // Established
              portfolioItems: [
                {
                  title: 'AI Chatbot for Customer Support',
                  description: 'Developed a custom AI chatbot that reduced support ticket volume by 45%.',
                  imageUrl: 'https://placehold.co/400x300',
                  url: '#',
                },
                {
                  title: 'Predictive Analytics Dashboard',
                  description: 'Built a dashboard that forecasts sales trends with 92% accuracy.',
                  imageUrl: 'https://placehold.co/400x300',
                  url: '#',
                },
              ],
            },
          });
        } else if (userData.role === 'CLIENT') {
          await db.clientProfile.create({
            data: {
              userId: user.id,
              companyName: 'Sample Business Inc.',
              industry: 'Technology',
              projectPreferences: {
                preferred_budget_range: '$5,000 - $10,000',
                timeline: 'Medium (1-3 months)',
                communication_preference: 'Weekly updates',
              },
            },
          });
        }

        createdUsers.push({
          ...user,
          verificationToken: token, // Include the token in the response
          status: 'created',
        });
      } catch (userError) {
        console.error(`Error creating user ${userData.email}:`, userError);
        createdUsers.push({
          email: userData.email,
          status: 'error',
          error: userError,
        });
      }
    }

    // Provide useful information for login process
    return NextResponse.json({
      success: true,
      message: 'Test users processed',
      users: createdUsers,
      loginInstructions: 'To test these users, copy the verification token and create a magic link: http://localhost:3000/api/auth/callback/email?token=[TOKEN]&email=[EMAIL]',
      note: 'This API is only for development and should be disabled in production',
    });
  } catch (error) {
    console.error('Error creating test users:', error);
    return NextResponse.json(
      { error: 'Failed to create test users', details: error },
      { status: 500 }
    );
  }
}
