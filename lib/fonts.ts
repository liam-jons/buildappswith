import { Inter, Roboto_Mono, Open_Sans } from "next/font/google"
import localFont from "next/font/local"

// Define main sans-serif font
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// Define monospace font for code sections
export const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

// Define alternate sans-serif font for improved readability
export const fontOpenSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
})

// Define OpenDyslexic font for accessibility
// Note: This requires the font file to be in the public directory
export const fontDyslexic = localFont({
  src: "../public/fonts/OpenDyslexic-Regular.otf",
  variable: "--font-dyslexic",
  display: "swap",
})

// Export all fonts for use in layout
export const fonts = {
  sans: fontSans.variable,
  mono: fontMono.variable,
  openSans: fontOpenSans.variable,
  dyslexic: fontDyslexic.variable,
}
