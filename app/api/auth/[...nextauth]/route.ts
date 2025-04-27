// Migration to Clerk complete: This route is now obsolete
// The original file is archived in /archived/nextauth-legacy/app/api/auth/[...nextauth]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

// Log all attempts to use the legacy NextAuth routes
async function logDeprecatedAccess(req: NextRequest) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const referer = headersList.get('referer') || 'Unknown';
  
  logger.warn('Deprecated NextAuth route accessed', {
    path: req.nextUrl.pathname,
    userAgent,
    referer,
    timestamp: new Date().toISOString(),
    query: Object.fromEntries(req.nextUrl.searchParams),
  });
}

// Redirect all NextAuth requests to the login page
export async function GET(req: NextRequest) {
  await logDeprecatedAccess(req);
  return NextResponse.redirect(new URL('/login', req.url));
}

export async function POST(req: NextRequest) {
  await logDeprecatedAccess(req);
  return NextResponse.redirect(new URL('/login', req.url));
}