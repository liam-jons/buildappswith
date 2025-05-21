import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { getBuilderProfileBySlug } from "@/lib/profile/api";
import { BuilderProfileClientWrapper } from "@/components/profile/builder-profile-client-wrapper";
import { SessionBookingCard } from "@/components/profile/ui";
import { UserRole, SpecializationArea } from "@/lib/profile/types";
import { ValidationTier } from "@/lib/marketplace/types";

interface BuilderProfilePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: BuilderProfilePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the builder profile
  const profileResponse = await getBuilderProfileBySlug(params.slug);
  
  if (!profileResponse.success || !profileResponse.data) {
    return {
      title: "Builder Not Found",
      description: "The requested builder profile does not exist.",
    };
  }
  
  const profile = profileResponse.data;
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${profile.displayName} - Builder Profile | BuildAppsWith`,
    description: profile.tagline || `Professional AI application builder specializing in ${profile.specializations?.join(", ") || 'various technologies'}`,
    openGraph: {
      title: `${profile.displayName} - AI Application Builder`,
      description: profile.tagline || `Professional AI application builder specializing in ${profile.specializations?.join(", ") || 'various technologies'}`,
      images: profile.avatar?.url ? [profile.avatar.url, ...previousImages] : previousImages,
      type: "profile",
      profiles: [{
        firstName: profile.displayName?.split(" ")[0] || '',
        lastName: profile.displayName?.split(" ").slice(1).join(" ") || '',
        username: params.slug,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.displayName} - AI Application Builder`,
      description: profile.tagline || `Professional AI application builder specializing in ${profile.specializations.join(", ")}`,
      images: profile.avatar?.url ? [profile.avatar.url] : [],
    },
  };
}

// This is a placeholder data function to simulate profile fetching
// In production, this should fetch from the database
async function getMockProfileData(slug: string) {
  // For simplicity, we're hardcoding Liam's profile for this MVP
  if (slug === "liam-jons") {
    return {
      success: true,
      data: {
        id: "liam-jons-profile",
        name: "Liam Jons",
        title: "AI Application Builder & ADHD Productivity Specialist",
        bio: "Founder of BuildAppsWith, helping individuals and businesses leverage AI to build applications that solve real problems. Specialized in ADHD productivity strategies and creating value through thoughtful AI integration. With over 10 years of experience in software development and AI, I focus on practical implementations that deliver tangible results.",
        avatarUrl: "/images/profile/liam-jons.jpg", // You should add this image to the public folder
        coverImageUrl: "/images/profile/liam-cover.jpg", // You should add this image to the public folder
        validationTier: ValidationTier.EXPERT,
        joinDate: new Date("2023-01-15"),
        completedProjects: 87,
        rating: 4.9,
        responseRate: 98,
        adhdFocus: true,
        isFounder: true,
        roles: [UserRole.BUILDER, UserRole.ADMIN],
        skills: [
          "AI Development",
          "ADHD Productivity",
          "Business Strategy",
          "Claude Prompt Engineering",
          "ChatGPT Custom Instructions",
          "Next.js",
          "React",
          "TypeScript",
          "AI Literacy",
          "Application Architecture"
        ],
        availability: {
          status: "limited",
          nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        socialLinks: {
          website: "https://buildappswith.ai",
          linkedin: "https://linkedin.com/in/liamjons",
          github: "https://github.com/buildappswith",
          twitter: "https://twitter.com/buildappswith"
        },
        portfolio: [
          {
            id: "project1",
            title: "ADHD Task Manager",
            description: "Custom productivity application designed specifically for ADHD users, featuring distraction management, time boxing, and dopamine-driven task completion.",
            imageUrl: "/images/portfolio/adhd-task-manager.jpg",
            tags: ["ADHD", "Productivity", "AI"],
            technologies: ["React", "TypeScript", "OpenAI"],
            demoUrl: "https://adhd-task-manager.buildappswith.ai",
            featured: true
          },
          {
            id: "project2",
            title: "AI Literacy Learning Portal",
            description: "Interactive learning platform to help users understand and effectively work with AI tools across different domains.",
            imageUrl: "/images/portfolio/ai-literacy.jpg",
            tags: ["Education", "AI Literacy"],
            technologies: ["Next.js", "Tailwind CSS", "Anthropic API"],
            demoUrl: "https://literacy.buildappswith.ai"
          },
          {
            id: "project3",
            title: "Business Value Calculator",
            description: "Tool for businesses to quantify the potential value of AI integration in their workflows.",
            imageUrl: "/images/portfolio/value-calculator.jpg",
            tags: ["Business", "ROI", "Analytics"],
            technologies: ["Vue.js", "Chart.js", "GPT-4"]
          }
        ],
        expertiseAreas: {
          [SpecializationArea.ADHD_PRODUCTIVITY]: {
            description: "Specialized approaches to productivity tailored specifically for ADHD minds. Creating systems that work with your brain, not against it.",
            bulletPoints: [
              "Custom productivity systems designed for dopamine-driven motivation",
              "Time management techniques optimized for variable attention spans",
              "Distraction management strategies using AI as a focus enhancement tool",
              "Building AI assistants that complement ADHD cognitive strengths",
              "Task breakdown and prioritization methods that reduce overwhelm"
            ],
            testimonials: [
              {
                id: "testimonial1",
                author: "Sarah Johnson",
                role: "UX Designer with ADHD",
                content: "Liam's approach to ADHD productivity has been transformative. Finally, systems that work WITH my brain instead of fighting it. The AI tools he helped me implement have reduced my admin work by 70%.",
                rating: 5,
                date: new Date("2023-09-15")
              }
            ]
          },
          [SpecializationArea.AI_LITERACY]: {
            description: "Building genuine understanding of AI capabilities and limitations. Learn to communicate effectively with AI tools to achieve your goals.",
            bulletPoints: [
              "Practical prompt engineering for different AI models (Claude, ChatGPT, others)",
              "Understanding model limitations and how to work around them",
              "Evaluating AI outputs for quality, accuracy, and potential biases",
              "Creating custom instructions that improve AI performance for specific tasks",
              "Developing AI literacy within organizations and teams"
            ],
            testimonials: [
              {
                id: "testimonial2",
                author: "Michael Chen",
                role: "Marketing Director",
                content: "Our team went from AI skeptics to power users after working with Liam. His approach to AI literacy focused on practical applications rather than hype, which made all the difference.",
                rating: 5,
                date: new Date("2023-10-22")
              }
            ]
          },
          [SpecializationArea.BUILDING_WITH_AI]: {
            description: "Creating functional, practical applications powered by AI. From idea to implementation with a focus on solving real problems.",
            bulletPoints: [
              "AI application architecture that's reliable and maintainable",
              "Integrating multiple AI models for more robust applications",
              "Building context-aware AI assistants for specialized domains",
              "Developing AI-powered workflows that augment human capabilities",
              "Creating seamless user experiences that hide technical complexity"
            ],
            testimonials: [
              {
                id: "testimonial3",
                author: "Jessica Rivera",
                role: "Startup Founder",
                content: "Liam helped us transform our idea into a fully functional AI-powered application in just weeks. His technical knowledge combined with business acumen was exactly what we needed.",
                rating: 5,
                date: new Date("2023-08-05")
              }
            ]
          },
          [SpecializationArea.BUSINESS_VALUE]: {
            description: "Identifying and implementing AI solutions that deliver tangible business value. Focus on ROI and solving meaningful problems.",
            bulletPoints: [
              "Opportunity assessment for AI implementation in existing workflows",
              "ROI calculation and business case development for AI projects",
              "Identifying high-value, low-effort AI integration opportunities",
              "Developing AI roadmaps aligned with business objectives",
              "Measuring and demonstrating the impact of AI implementations"
            ],
            testimonials: [
              {
                id: "testimonial4",
                author: "Robert Thompson",
                role: "CFO at MidSize Corp",
                content: "What impressed me most was Liam's focus on measurable business outcomes. He helped us identify AI opportunities with the highest ROI potential and guided implementation that delivered 3x the expected value.",
                rating: 5,
                date: new Date("2023-11-12")
              }
            ]
          }
        }
      }
    };
  }
  
  return { success: false, error: 'Profile not found' };
}

// This is a placeholder function to simulate fetching session types
// In production, this should fetch from the database
async function getMockSessionTypes(profileId: string) {
  // For simplicity, returning static session types for Liam
  if (profileId === "liam-jons-profile") {
    return [
      {
        id: "session-1",
        title: "Quick Strategy Session",
        description: "30-minute focused session to discuss a specific challenge or opportunity with AI implementation.",
        durationMinutes: 30,
        price: 75,
        currency: "USD"
      },
      {
        id: "session-2",
        title: "ADHD Productivity Consultation",
        description: "In-depth session focused on designing AI-powered productivity systems tailored to ADHD minds.",
        durationMinutes: 60,
        price: 150,
        currency: "USD"
      },
      {
        id: "session-3",
        title: "Business AI Assessment",
        description: "Comprehensive evaluation of your business operations to identify high-value AI implementation opportunities.",
        durationMinutes: 90,
        price: 250,
        currency: "USD"
      },
      {
        id: "session-4",
        title: "AI Literacy Workshop",
        description: "Personalized workshop to elevate your AI literacy and prompt engineering skills.",
        durationMinutes: 120,
        price: 300,
        currency: "USD"
      }
    ];
  }
  
  return [];
}

export default async function BuilderProfilePage({ params }: BuilderProfilePageProps) {
  // In production, use the API function to get the profile from the database
  // const profileResponse = await getBuilderProfileBySlug(params.slug);
  
  // For this MVP, using mock data
  const profileResponse = await getMockProfileData(params.slug);
  
  if (!profileResponse.success || !profileResponse.data) {
    notFound();
  }
  
  const profile = profileResponse.data;
  
  // Get session types
  const sessionTypes = await getMockSessionTypes(profile.id);
  
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BuilderProfileClientWrapper 
            profile={profile} 
            sessionTypes={sessionTypes}
            clerkUserId="user_2wBNHJwI9cJdILyvlRnv4zxu090" // Liam's Clerk user ID
          />
        </div>
        
        {/* Right sidebar with booking card */}
        <div className="space-y-6">
          <SessionBookingCard
            builderId={profile.id}
            builderName={profile.name}
            sessionTypes={sessionTypes}
            adhdFocus={profile.adhdFocus}
          />
          
          {/* Additional sidebar content can be added here */}
        </div>
      </div>
    </div>
  );
}