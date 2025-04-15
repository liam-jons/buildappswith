export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Buildappswith",
  description:
    "A platform democratizing AI application development through a marketplace connecting clients with validated builders and practical AI education.",
  url: "https://buildappswith.ai",
  ogImage: "https://buildappswith.ai/og.jpg",
  links: {
    twitter: "https://twitter.com/buildappswith",
    github: "https://github.com/buildappswith",
  },
  version: "0.1.2",
  creator: "Buildappswith Team",
}

export type NavItem = {
  title: string
  href: string
  description?: string
  disabled?: boolean
  external?: boolean
  icon?: string
  label?: string
}

export type NavItemWithChildren = NavItem & {
  items: NavItemWithChildren[]
}

export type MainNavItem = NavItem

export type SidebarNavItem = NavItemWithChildren

export type MainNavItems = {
  mainNav: MainNavItem[]
  clientNav: MainNavItem[]
  learnerNav: MainNavItem[]
  builderNav: MainNavItem[]
}

export const navItems: MainNavItems = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "What AI Can/Can't Do",
      href: "/ai-timeline",
      description: "Explore the evolving capabilities of AI",
    },
    {
      title: "Marketplace",
      href: "/marketplace",
      description: "Find validated AI app builders",
    },
    {
      title: "Learning Hub",
      href: "/learning",
      description: "Develop practical AI skills",
    },
    {
      title: "Community",
      href: "/community",
      description: "Connect with other builders and learners",
    },
    {
      title: "About",
      href: "/about",
      description: "Learn about our mission",
    },
  ],
  clientNav: [
    {
      title: "Dashboard",
      href: "/client/dashboard",
      description: "Manage your projects and find builders",
    },
    {
      title: "Find Builders",
      href: "/client/builders",
      description: "Discover validated AI app builders",
    },
    {
      title: "My Projects",
      href: "/client/projects",
      description: "View and manage your projects",
    },
    {
      title: "AI Literacy",
      href: "/client/learning",
      description: "Learn the basics of AI app development",
    },
  ],
  learnerNav: [
    {
      title: "Dashboard",
      href: "/learner/dashboard",
      description: "Track your progress and skills",
    },
    {
      title: "Skill Tree",
      href: "/learner/skills",
      description: "Explore and develop practical AI skills",
    },
    {
      title: "Learning Path",
      href: "/learner/path",
      description: "Follow your personalized learning journey",
    },
    {
      title: "Projects",
      href: "/learner/projects",
      description: "Apply your skills to real-world projects",
    },
    {
      title: "Community",
      href: "/learner/community",
      description: "Connect with mentors and other learners",
    },
  ],
  builderNav: [
    {
      title: "Dashboard",
      href: "/builder/dashboard",
      description: "Manage your projects and validation metrics",
    },
    {
      title: "My Profile",
      href: "/builder/profile",
      description: "Manage your builder profile and portfolio",
    },
    {
      title: "Projects",
      href: "/builder/projects",
      description: "View and manage your client projects",
    },
    {
      title: "Validation",
      href: "/builder/validation",
      description: "Track your validation metrics and reputation",
    },
    {
      title: "Mentoring",
      href: "/builder/mentoring",
      description: "Mentor aspiring builders and learners",
    },
  ],
}

// Define the roles in the system
export type UserRole = "client" | "learner" | "builder" | "admin"

// Validation tiers
export type ValidationTier = "entry" | "established" | "expert"

// Define skill status types for evolution tracking
export type SkillEvolutionStatus = "emerging" | "core" | "transitioning" | "archived"

// Define skill domains for the skill tree
export type SkillDomain = 
  | "ai-literacy" 
  | "development-basics" 
  | "frontend" 
  | "backend" 
  | "ai-integration"
  | "business" 
  | "product-management"
  | "prompt-engineering"
