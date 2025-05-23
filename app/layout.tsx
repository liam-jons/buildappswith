import { Providers } from "@/components/providers/providers";
import { ThemeProvider } from "@/components/theme-provider";
import {
  Toaster
} from "@/components/ui";

import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: "Buildappswith",
  description: "Democratizing AI app development through an innovative platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
