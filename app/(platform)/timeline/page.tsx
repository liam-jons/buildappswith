import { redirect } from 'next/navigation';

/**
 * Redirect Page for Timeline
 * 
 * This page redirects from /timeline to /ai-timeline
 * to match the navigation item in the site header.
 */
export default function TimelineRedirectPage() {
  redirect('/ai-timeline');
}
