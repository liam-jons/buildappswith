import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for fetching navigation menu items
 * This separates navigation from actual data fetching to prevent errors
 */
export async function GET(request: NextRequest) {
  try {
    // Define role-based navigation items
    const roleBasedItems = [
      {
        id: 1,
        label: "Learn how to benefit instantly from AI",
        href: "/for-clients",
        description: "Practical guidance for immediate AI adoption"
      },
      {
        id: 2,
        label: "Learn to build a business with AI",
        href: "/for-learners",
        description: "Turn AI skills into entrepreneurial opportunities"
      },
      {
        id: 3,
        label: "Pay someone to build an app for me",
        href: "/marketplace",
        description: "Connect with skilled AI developers"
      },
      {
        id: 4,
        label: "Teach others how to benefit from AI",
        href: "/become-builder",
        description: "Share your expertise and help others grow"
      }
    ];
    
    // About section navigation
    const aboutItems = [
      {
        id: 1,
        label: "Our Mission",
        href: "/about",
        description: "Our mission to democratise AI"
      },
      {
        id: 2,
        label: "Contact",
        href: "/contact",
        description: "Get in touch with our team"
      }
    ];
    
    return NextResponse.json({
      roleBasedItems,
      aboutItems
    });
  } catch (error) {
    console.error('Error in navigation endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation data' }, 
      { status: 500 }
    );
  }
}
