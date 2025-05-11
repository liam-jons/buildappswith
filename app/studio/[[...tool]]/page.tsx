/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

// Temporarily disabled for production build
// import { NextStudio } from 'next-sanity/studio'
// import config from '../../../sanity.config'

export const dynamic = 'force-static'

// export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Sanity Studio</h1>
      <p>Sanity Studio is currently disabled in production.</p>
    </div>
  )
}
