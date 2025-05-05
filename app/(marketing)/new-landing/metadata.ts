import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BuildAppsWith - Learn AI with people, not just prompts",
  description: "Build real AI skills through human connection. Our community of experienced builders will guide you through the landscape of AI, from fundamentals to implementation.",
  keywords: ["AI learning", "AI skills", "human-guided AI", "build AI apps", "learn AI"],
  openGraph: {
    title: "BuildAppsWith - Learn AI with people, not just prompts",
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
  twitter: {
    card: "summary_large_image",
    title: "BuildAppsWith - Learn AI with people, not just prompts",
    description: "Build real AI skills through human connection. Our community will guide you through AI, from fundamentals to implementation.",
    images: ["/og-image.png"],
  },
};