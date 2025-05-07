import { Metadata } from "next";

/**
 * Default metadata for all marketing pages
 * This can be extended or overridden in individual page files
 */
export const metadata: Metadata = {
  // Core metadata
  title: {
    default: "BuildAppsWith - Learn AI with people, not just prompts",
    template: "%s | BuildAppsWith"
  },
  description: "Build real AI skills through human connection. Our community of experienced builders will guide you through the landscape of AI, from fundamentals to implementation.",
  keywords: [
    "AI learning", 
    "AI skills", 
    "human-guided AI", 
    "build AI apps", 
    "learn AI", 
    "AI mentoring", 
    "AI development", 
    "AI marketplace",
    "AI community",
    "build with AI"
  ],
  
  // Open Graph metadata
  openGraph: {
    title: {
      default: "BuildAppsWith - Learn AI with people, not just prompts",
      template: "%s | BuildAppsWith"
    },
    description: "Build real AI skills through human connection. Our community will guide you through AI, from fundamentals to implementation.",
    url: "https://buildappswith.com",
    siteName: "BuildAppsWith",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BuildAppsWith - Learn AI with people, not just prompts",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Twitter card metadata
  twitter: {
    card: "summary_large_image",
    title: {
      default: "BuildAppsWith - Learn AI with people, not just prompts",
      template: "%s | BuildAppsWith"
    },
    description: "Build real AI skills through human connection. Our community will guide you through AI, from fundamentals to implementation.",
    images: ["/og-image.png"],
    creator: "@buildappswith",
    site: "@buildappswith",
  },
  
  // Additional SEO improvements
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: "https://buildappswith.com",
    languages: {
      'en': 'https://buildappswith.com',
    },
  },
  
  // Viewport settings
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  
  // Icon settings
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
  },
  
  // Theme color
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  
  // Application data
  applicationName: 'BuildAppsWith',
  publisher: 'BuildAppsWith',
};