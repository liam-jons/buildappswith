// types.ts - Shared types for landing page components

// Navigation
export interface NavigationItem {
  title: string;
  href?: string;
  items?: {
    title: string;
    href: string;
    description?: string;
  }[];
}

// Hero Section
export interface HeroContent {
  headline: string;
  subheadline: string;
  rotatingNames: string[];
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
  };
}

export interface HeroSectionProps {
  className?: string;
  content?: HeroContent;
}

// AI Capabilities
export interface Capability {
  title: string;
  icon: React.ReactNode | null;
}

export interface Limitation {
  title: string;
  icon: React.ReactNode | null;
}

export interface AICapabilitiesMarqueeProps {
  className?: string;
  capabilities?: Capability[];
  limitations?: Limitation[];
}

// Skills Learning Tree
export interface SkillNode {
  title: string;
  level: number;
  icon: React.ReactNode;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface SkillsTreeSectionProps {
  className?: string;
  skills?: SkillNode[];
}

// CTA Section
export interface CTASectionProps {
  className?: string;
  headline?: string;
  subheadline?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
}

// Footer
export interface FooterProps {
  className?: string;
}

// Navbar
export interface NavbarProps {
  className?: string;
}

// Feature Scroll Section
export interface FeatureScrollProps {
  direction: "ltr" | "rtl";
  imageSrc: string;
  children: React.ReactNode;
  topPosition?: string;
}