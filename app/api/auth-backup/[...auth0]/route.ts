// For API routes, import directly from the package root
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
export const POST = handleAuth();