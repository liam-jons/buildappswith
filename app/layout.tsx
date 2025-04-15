import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import { fontSans, fontMono, fontDyslexic } from "@/lib/fonts"
import { ThemeProvider } from "@/providers/theme-provider"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "AI",
    "app development",
    "democratization",
    "education",
    "marketplace",
    "builders",
    "learning",
  ],
  authors: [
    {
      name: siteConfig.creator,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.creator,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@buildappswith",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
          fontDyslexic.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to content link for accessibility */}
          <a 
            href="#main-content" 
            className="fixed top-0 left-0 p-3 bg-primary text-primary-foreground z-50 transform -translate-y-full focus:translate-y-0 transition"
          >
            Skip to content
          </a>
          
          {/* Main content */}
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
          
          {/* Accessibility toolbar could be added here */}
        </ThemeProvider>
      </body>
    </html>
  )
}
