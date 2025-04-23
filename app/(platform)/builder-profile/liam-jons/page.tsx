// Version: 1.0.54
// Server component for builder profile page with proper static generation

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BuilderProfileClientWrapper } from "@/components/profile/builder-profile-client-wrapper";
import { getBuilderProfileBySlug, getBuilderSessionTypes, liamJonsFallbackProfile, ExtendedBuilderProfile } from "@/lib/builders/profile";
import { SocialLinks, getPortfolioItems } from "@/lib/prisma-types";
import { AppItem } from "@/components/profile/app-showcase";
import { PortfolioProject } from "@/components/profile/portfolio-showcase";
import { UserRole } from "@prisma/client";

// Control which routes are generated at build time
export async function generateStaticParams() {
  return [
    {
      slug: "liam-jons",
    },
  ];
}

// Handle routes not defined in generateStaticParams
export const dynamicParams = true;

// Build-time mock data for static generation
const mockSessionTypes = [
  {
    id: "session1",
    builderId: "liam-jons",
    title: "1:1 AI Discovery Session",
    description: "Personal one-to-one session to discuss your specific AI needs",
    durationMinutes: 60,
    price: 99,
    currency: "USD",
    isActive: true,
    color: "#3B82F6"
  },
  {
    id: "session2",
    builderId: "liam-jons",
    title: "ADHD AI Strategy Session",
    description: "Focused session on leveraging AI for ADHD productivity",
    durationMinutes: 60,
    price: 149,
    currency: "USD",
    isActive: true,
    color: "#8B5CF6"
  },
  {
    id: "session3",
    builderId: "liam-jons",
    title: "AI Literacy Fundamentals",
    description: "Group learning session covering essential AI concepts",
    durationMinutes: 90,
    price: 49,
    currency: "USD",
    isActive: true,
    color: "#F59E0B",
    maxParticipants: 10
  },
  {
    id: "session4",
    builderId: "liam-jons",
    title: "Free AI Session for Unemployed",
    description: "Weekly free session for those currently unemployed",
    durationMinutes: 90,
    price: 0,
    currency: "USD",
    isActive: true,
    color: "#10B981",
    maxParticipants: 12
  }
];

// Server component to fetch profile data
async function getProfileData() {
  try {
    const profile = await getBuilderProfileBySlug('liam-jons');
    const sessionTypes = await getBuilderSessionTypes('liam-jons');
    return { profile, sessionTypes };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    // Provide fallback data that matches the expected structure exactly
    return { 
      profile: liamJonsFallbackProfile, 
      sessionTypes: mockSessionTypes 
    };
  }
}

export default async function LiamJonsProfile() {
  // Fetch data server-side for better SEO and build-time generation
  const { profile: liamJonsProfile, sessionTypes } = await getProfileData();
  
  // If no profile found even after fallback, show 404
  if (!liamJonsProfile) {
    return notFound();
  }
  
  // Create a properly typed safe fallback
  const safeProfile = liamJonsProfile as ExtendedBuilderProfile;
  const safeUser = 'user' in safeProfile ? safeProfile.user : {
    name: "Liam Jons",
    email: "liam.jones@buildappswith.com",
    image: "/assets/liam-profile.jpg",
    roles: [UserRole.BUILDER, UserRole.ADMIN],
    isFounder: true
  };
  
  // Use fallback for builder profile to prevent build errors
  const builderProfileData = {
    id: safeProfile.id || "liam-jons",
    name: safeUser.name || "Liam Jons",
    title: safeProfile.headline || "Founder & AI Application Builder",
    bio: safeProfile.bio || liamJonsFallbackProfile.bio,
    avatarUrl: safeUser.image || "/assets/liam-profile.jpg",
    coverImageUrl: "/assets/liam-cover.jpg",
    validationTier: "expert",
    joinDate: safeProfile.createdAt ? new Date(safeProfile.createdAt) : new Date(2024, 2, 15),
    completedProjects: 12,
    rating: safeProfile.rating || 5.0,
    responseRate: 98,
    skills: liamJonsFallbackProfile.skills,
    roles: safeUser.roles || [UserRole.BUILDER, UserRole.ADMIN],
    isFounder: safeUser.isFounder || true,
    adhdFocus: safeProfile.adhd_focus || liamJonsFallbackProfile.adhd_focus,
    availability: {
      status: "limited",
      nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    socialLinks: (safeProfile.socialLinks as SocialLinks) || liamJonsFallbackProfile.socialLinks,
    // Extract portfolio from the portfolioItems JSON field or use fallback
    portfolio: (() => {
      try {
        // First check if portfolioItems exists
        const items = safeProfile.portfolioItems ? getPortfolioItems(safeProfile) || [] : [];
        
        // If we have items, transform them with proper defaults
        if (items.length > 0) {
          return items.map((item: any) => ({
            ...item,
            imageUrl: item.imageUrl || '/assets/placeholder.jpg',
            outcomes: item.outcomes || [],
            tags: item.tags || []
          })) as PortfolioProject[];
        } 
        
        // If no items or error, return the fallback data
        return [
          {
            id: "success-1",
            title: "Small Business Transformation",
            description: "Helped a local retail business implement AI for inventory management and customer recommendations, resulting in significant efficiency gains.",
            imageUrl: "/assets/portfolio/retail-business.jpg",
            outcomes: [
              { label: "Time Saved", value: "15 hrs/week", trend: "down" },
              { label: "Revenue", value: "+22%", trend: "up" },
              { label: "Customer Satisfaction", value: "+35%", trend: "up" }
            ],
            tags: ["Small Business", "Retail", "AI Implementation"],
            createdAt: new Date(2024, 3, 15)
          },
          {
            id: "success-2",
            title: "Freelancer Productivity System",
            description: "Designed a custom AI workflow for a freelance designer with ADHD, helping them manage clients and deadlines more effectively.",
            imageUrl: "/assets/portfolio/freelancer.jpg",
            outcomes: [
              { label: "Missed Deadlines", value: "-80%", trend: "down" },
              { label: "Client Capacity", value: "+40%", trend: "up" },
              { label: "Stress Level", value: "-65%", trend: "down" }
            ],
            tags: ["Freelancer", "ADHD", "Productivity"],
            createdAt: new Date(2024, 4, 28)
          },
        ];
      } catch (error) {
        console.error('Error processing portfolio items:', error);
        // In case of any error, return the fallback data
        return [
          {
            id: "success-1",
            title: "Small Business Transformation",
            description: "Helped a local retail business implement AI for inventory management and customer recommendations, resulting in significant efficiency gains.",
            imageUrl: "/assets/portfolio/retail-business.jpg",
            outcomes: [
              { label: "Time Saved", value: "15 hrs/week", trend: "down" },
              { label: "Revenue", value: "+22%", trend: "up" },
              { label: "Customer Satisfaction", value: "+35%", trend: "up" }
            ],
            tags: ["Small Business", "Retail", "AI Implementation"],
            createdAt: new Date(2024, 3, 15)
          },
          {
            id: "success-2",
            title: "Freelancer Productivity System",
            description: "Designed a custom AI workflow for a freelance designer with ADHD, helping them manage clients and deadlines more effectively.",
            imageUrl: "/assets/portfolio/freelancer.jpg",
            outcomes: [
              { label: "Missed Deadlines", value: "-80%", trend: "down" },
              { label: "Client Capacity", value: "+40%", trend: "up" },
              { label: "Stress Level", value: "-65%", trend: "down" }
            ],
            tags: ["Freelancer", "ADHD", "Productivity"],
            createdAt: new Date(2024, 4, 28)
          },
        ];
      }
    })(),
    apps: []
  };
  
  return (
    <div className="container max-w-7xl pb-16">
      <Suspense fallback={<div className="py-12 text-center">Loading profile...</div>}>
        <BuilderProfileClientWrapper 
          profile={builderProfileData}
          sessionTypes={sessionTypes}
        />
      </Suspense>
    </div>
  );
}