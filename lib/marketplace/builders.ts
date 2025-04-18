// /lib/marketplace/builders.ts
import { BuilderProfileData } from "@/components/profile/builder-profile";
import { mockEntryTierProfile, mockEstablishedTierProfile, mockExpertTierProfile } from "@/lib/mock-data/profiles";

// Create real profile for Liam Jons
export const liamJonsProfile: BuilderProfileData = {
  id: "liam-jons",
  name: "Liam Jons",
  title: "Full-Stack Developer & AI Integration Specialist",
  bio: "I specialize in building accessible, user-centered applications that leverage AI capabilities. With expertise in React, Next.js, and various AI tools, I help businesses create solutions that are both technically excellent and user-friendly. My background in UX design informs my approach to creating intuitive, impactful applications.",
  avatarUrl: "/placeholders/liam-avatar.jpg",
  coverImageUrl: "/placeholders/established-cover.jpg",
  validationTier: "established",
  joinDate: new Date(2024, 7, 10), // August 10, 2024
  completedProjects: 12,
  rating: 4.9,
  responseRate: 98,
  skills: ["React", "Next.js", "TypeScript", "AI Integration", "UX/UI Design", "Accessibility", "API Development"],
  availability: {
    status: "limited"
  },
  socialLinks: {
    website: "https://liamjons.dev",
    linkedin: "https://linkedin.com/in/liam-jons",
    github: "https://github.com/liamjons",
    twitter: "https://twitter.com/liam_codes"
  },
  portfolio: [
    {
      id: "project-1",
      title: "AI-Powered Content Platform",
      description: "Content management system with integrated AI for automated categorization and summarization",
      imageUrl: "/placeholders/project-liam-1.jpg",
      outcomes: [
        { label: "Content Processing Time", value: "-60%", trend: "down" },
        { label: "User Engagement", value: "+35%", trend: "up" },
        { label: "Editor Productivity", value: "+45%", trend: "up" }
      ],
      tags: ["AI Integration", "Content Management", "Next.js"],
      projectUrl: "https://example.com/content-platform",
      createdAt: new Date(2024, 9, 5)
    },
    {
      id: "project-2",
      title: "E-learning Platform Redesign",
      description: "Complete UX/UI overhaul and accessibility improvements for an established learning platform",
      imageUrl: "/placeholders/project-liam-2.jpg",
      outcomes: [
        { label: "Accessibility Score", value: "+42%", trend: "up" },
        { label: "Course Completion", value: "+28%", trend: "up" },
        { label: "User Satisfaction", value: "4.8/5", trend: "up" }
      ],
      tags: ["UX/UI Design", "Accessibility", "E-learning"],
      projectUrl: "https://example.com/elearning-platform",
      createdAt: new Date(2024, 10, 15)
    },
    {
      id: "project-3",
      title: "AI Customer Support Integration",
      description: "Seamless integration of AI chatbot with human support workflow for a SaaS company",
      imageUrl: "/placeholders/project-liam-3.jpg",
      outcomes: [
        { label: "Response Time", value: "-75%", trend: "down" },
        { label: "Support Cost", value: "-40%", trend: "down" },
        { label: "Resolution Rate", value: "+25%", trend: "up" }
      ],
      tags: ["AI Integration", "Customer Support", "Workflow Automation"],
      projectUrl: "https://example.com/customer-support",
      createdAt: new Date(2024, 11, 20)
    }
  ]
};

// Additional placeholder profile 1
export const sarahTaylorProfile: BuilderProfileData = {
  id: "sarah-taylor",
  name: "Sarah Taylor",
  title: "AI Product Developer & Data Specialist",
  bio: "I help businesses transform their data into intelligent AI products. With a background in data science and product development, I bridge the gap between complex AI capabilities and practical business applications. My specialty is creating data-driven solutions that deliver measurable ROI.",
  avatarUrl: "/placeholders/sarah-avatar.jpg",
  coverImageUrl: "/placeholders/expert-cover.jpg",
  validationTier: "expert",
  joinDate: new Date(2024, 4, 15), // May 15, 2024
  completedProjects: 18,
  rating: 4.95,
  responseRate: 97,
  skills: ["Data Science", "Machine Learning", "Python", "Product Strategy", "Data Visualization", "AI Ethics"],
  availability: {
    status: "unavailable",
    nextAvailable: new Date(2025, 4, 15) // May 15, 2025
  },
  socialLinks: {
    website: "https://sarahtaylor.ai",
    linkedin: "https://linkedin.com/in/sarah-taylor-ai",
    github: "https://github.com/sarahtaylor",
    twitter: "https://twitter.com/sarah_ai_dev"
  },
  portfolio: [
    {
      id: "project-1",
      title: "Predictive Maintenance System",
      description: "AI system for manufacturing equipment that predicts failures before they occur",
      imageUrl: "/placeholders/project-sarah-1.jpg",
      outcomes: [
        { label: "Downtime", value: "-78%", trend: "down" },
        { label: "Maintenance Costs", value: "-42%", trend: "down" },
        { label: "Equipment Lifespan", value: "+30%", trend: "up" }
      ],
      tags: ["Predictive Analytics", "Manufacturing", "IoT"],
      projectUrl: "https://example.com/predictive-maintenance",
      createdAt: new Date(2024, 6, 10)
    },
    {
      id: "project-2",
      title: "Financial Risk Assessment Platform",
      description: "AI-powered system for evaluating investment risks across diverse portfolios",
      imageUrl: "/placeholders/project-sarah-2.jpg",
      outcomes: [
        { label: "Analysis Time", value: "-90%", trend: "down" },
        { label: "Risk Prediction Accuracy", value: "+65%", trend: "up" },
        { label: "Portfolio Performance", value: "+18%", trend: "up" }
      ],
      tags: ["Finance", "Risk Analysis", "AI Models"],
      projectUrl: "https://example.com/risk-assessment",
      createdAt: new Date(2024, 8, 20)
    }
  ]
};

// Collection of all builder profiles
export const allBuilderProfiles: BuilderProfileData[] = [
  liamJonsProfile,
  mockEntryTierProfile,
  mockEstablishedTierProfile,
  mockExpertTierProfile,
  sarahTaylorProfile
];

// Function to fetch builders (simulating API call)
export async function fetchBuilders(): Promise<BuilderProfileData[]> {
  // Simulate network delay for realistic loading state
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return allBuilderProfiles;
}

// Function to fetch a single builder by ID (simulating API call)
export async function fetchBuilderById(builderId: string): Promise<BuilderProfileData | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return allBuilderProfiles.find(builder => builder.id === builderId) || null;
}
