"use client";

import { useState } from "react";
import { BuilderProfile, BuilderProfileData } from "@/components/profile/builder-profile";
import { ValidationTier } from "@/components/profile/validation-tier-badge";
import { Button } from "@/components/ui/button";
import { 
  GearIcon,
  InfoCircledIcon
} from "@radix-ui/react-icons";

// Mock data for demo purposes
const mockEntryTierProfile: BuilderProfileData = {
  id: "builder-1",
  name: "Miguel Rodriguez",
  title: "Frontend Developer & AI Enthusiast",
  bio: "I'm a marketing professional transitioning into tech with a focus on frontend development and AI integration. I specialize in creating intuitive user interfaces that leverage the latest AI capabilities to deliver exceptional user experiences. With my background in marketing, I bring a unique perspective to development that focuses on user engagement and business outcomes.",
  avatarUrl: "/placeholders/miguel-avatar.jpg",
  coverImageUrl: "/placeholders/entry-cover.jpg",
  validationTier: "entry" as ValidationTier,
  joinDate: new Date(2024, 9, 15), // October 15, 2024
  completedProjects: 2,
  rating: 4.7,
  responseRate: 95,
  skills: ["React", "NextJS", "UI/UX", "Tailwind CSS", "API Integration", "AI Prompting"],
  availability: {
    status: "available"
  },
  socialLinks: {
    linkedin: "https://linkedin.com/in/miguel-rodriguez",
    github: "https://github.com/miguelr",
    twitter: "https://twitter.com/miguel_codes"
  },
  portfolio: [
    {
      id: "project-1",
      title: "E-commerce Product Recommender",
      description: "AI-powered product recommendation system for a boutique online retailer",
      imageUrl: "/placeholders/project-1.jpg",
      outcomes: [
        { label: "Conversion Rate", value: "+18%", trend: "up" },
        { label: "Avg. Order Value", value: "+12%", trend: "up" }
      ],
      tags: ["React", "AI Integration", "E-commerce"],
      projectUrl: "https://example.com/project1",
      createdAt: new Date(2024, 10, 5)
    },
    {
      id: "project-2",
      title: "Marketing Analytics Dashboard",
      description: "Interactive dashboard for visualizing marketing campaign performance",
      imageUrl: "/placeholders/project-2.jpg",
      outcomes: [
        { label: "Decision Time", value: "-35%", trend: "down" },
        { label: "Team Adoption", value: "92%", trend: "up" }
      ],
      tags: ["Dashboard", "Data Visualization", "Marketing Tech"],
      projectUrl: "https://example.com/project2",
      createdAt: new Date(2024, 11, 10)
    }
  ]
};

const mockEstablishedTierProfile: BuilderProfileData = {
  id: "builder-2",
  name: "Aisha Johnson",
  title: "AI Application Developer",
  bio: "With over 8 years of software development experience, I specialize in creating custom AI applications that solve real business problems. I've helped dozens of companies implement AI solutions that improve efficiency, reduce costs, and create new opportunities. My approach combines technical expertise with a deep understanding of business needs to deliver solutions that provide measurable value.",
  avatarUrl: "/placeholders/aisha-avatar.jpg",
  coverImageUrl: "/placeholders/established-cover.jpg",
  validationTier: "established" as ValidationTier,
  joinDate: new Date(2024, 6, 3), // July 3, 2024
  completedProjects: 7,
  rating: 4.9,
  responseRate: 98,
  skills: ["AI Application Design", "Python", "React", "Node.js", "LLM Integration", "Data Pipelines", "API Development"],
  availability: {
    status: "limited"
  },
  socialLinks: {
    website: "https://aishajohnson.dev",
    linkedin: "https://linkedin.com/in/aisha-johnson",
    github: "https://github.com/aishaj",
    twitter: "https://twitter.com/aisha_dev"
  },
  portfolio: [
    {
      id: "project-1",
      title: "Healthcare Documentation Assistant",
      description: "AI system that helps medical professionals create and manage patient documentation",
      imageUrl: "/placeholders/project-3.jpg",
      outcomes: [
        { label: "Documentation Time", value: "-45%", trend: "down" },
        { label: "Error Rate", value: "-60%", trend: "down" },
        { label: "Provider Satisfaction", value: "+85%", trend: "up" }
      ],
      tags: ["Healthcare", "AI Assistant", "Documentation"],
      projectUrl: "https://example.com/healthcare-assistant",
      createdAt: new Date(2024, 8, 15)
    },
    {
      id: "project-2",
      title: "Retail Inventory Forecasting",
      description: "Predictive analytics system for optimizing inventory levels across multiple locations",
      imageUrl: "/placeholders/project-4.jpg",
      outcomes: [
        { label: "Stockouts", value: "-32%", trend: "down" },
        { label: "Inventory Costs", value: "-18%", trend: "down" },
        { label: "Forecast Accuracy", value: "+40%", trend: "up" }
      ],
      tags: ["Retail", "Predictive Analytics", "Inventory Management"],
      projectUrl: "https://example.com/inventory-forecast",
      createdAt: new Date(2024, 9, 20)
    },
    {
      id: "project-3",
      title: "Legal Document Analysis",
      description: "AI-powered system that extracts and categorizes information from legal documents",
      imageUrl: "/placeholders/project-5.jpg",
      outcomes: [
        { label: "Review Time", value: "-65%", trend: "down" },
        { label: "Cost Savings", value: "$250K", trend: "up" },
        { label: "Accuracy", value: "94%", trend: "neutral" }
      ],
      tags: ["Legal Tech", "Document Analysis", "Information Extraction"],
      projectUrl: "https://example.com/legal-analysis",
      createdAt: new Date(2024, 10, 5)
    }
  ]
};

const mockExpertTierProfile: BuilderProfileData = {
  id: "builder-3",
  name: "Jonathan Wei",
  title: "AI Systems Architect & Entrepreneur",
  bio: "I'm a veteran software engineer and AI specialist with 15+ years of experience designing and implementing complex systems. As the founder of three successful tech startups, I've helped over 50 companies transform their operations with AI. My specialty is creating scalable, production-ready AI applications that deliver measurable business impact and ROI. I particularly enjoy working with startups and innovative companies looking to leverage AI as a competitive advantage.",
  avatarUrl: "/placeholders/jonathan-avatar.jpg",
  coverImageUrl: "/placeholders/expert-cover.jpg",
  validationTier: "expert" as ValidationTier,
  joinDate: new Date(2024, 3, 10), // April 10, 2024
  completedProjects: 24,
  rating: 5.0,
  responseRate: 99,
  skills: ["AI Architecture", "Machine Learning", "System Design", "Scalability", "Enterprise Integration", "Cloud Infrastructure", "AI Strategy"],
  availability: {
    status: "unavailable",
    nextAvailable: new Date(2025, 5, 1) // June 1, 2025
  },
  socialLinks: {
    website: "https://jonathanwei.com",
    linkedin: "https://linkedin.com/in/jonathan-wei",
    github: "https://github.com/jonathanwei",
    twitter: "https://twitter.com/jonathan_ai"
  },
  portfolio: [
    {
      id: "project-1",
      title: "Financial Fraud Detection System",
      description: "Enterprise-scale AI system for detecting fraudulent transactions in real-time",
      imageUrl: "/placeholders/project-6.jpg",
      outcomes: [
        { label: "Fraud Reduction", value: "-73%", trend: "down" },
        { label: "False Positives", value: "-45%", trend: "down" },
        { label: "Annual Savings", value: "$4.2M", trend: "up" },
        { label: "Processing Time", value: "50ms", trend: "neutral" }
      ],
      tags: ["Fintech", "Fraud Detection", "Enterprise", "Real-time Processing"],
      projectUrl: "https://example.com/fraud-detection",
      createdAt: new Date(2024, 5, 15)
    },
    {
      id: "project-2",
      title: "Manufacturing Optimization Platform",
      description: "Comprehensive AI platform for optimizing manufacturing processes across 12 facilities",
      imageUrl: "/placeholders/project-7.jpg",
      outcomes: [
        { label: "Production Efficiency", value: "+28%", trend: "up" },
        { label: "Quality Defects", value: "-35%", trend: "down" },
        { label: "Energy Usage", value: "-22%", trend: "down" },
        { label: "Annual ROI", value: "342%", trend: "up" }
      ],
      tags: ["Manufacturing", "Process Optimization", "Industrial IoT", "Enterprise"],
      projectUrl: "https://example.com/manufacturing-optimization",
      createdAt: new Date(2024, 7, 10)
    },
    {
      id: "project-3",
      title: "Personalized Learning Platform",
      description: "AI-driven educational platform that adapts to individual student learning patterns",
      imageUrl: "/placeholders/project-8.jpg",
      outcomes: [
        { label: "Completion Rate", value: "+62%", trend: "up" },
        { label: "Knowledge Retention", value: "+40%", trend: "up" },
        { label: "Learning Time", value: "-30%", trend: "down" },
        { label: "Student Satisfaction", value: "4.8/5", trend: "up" }
      ],
      tags: ["Education", "Personalization", "Adaptive Learning"],
      projectUrl: "https://example.com/personalized-learning",
      createdAt: new Date(2024, 8, 5)
    }
  ]
};

const profileOptions = [
  { label: "Entry Tier Builder", value: "entry", profile: mockEntryTierProfile },
  { label: "Established Tier Builder", value: "established", profile: mockEstablishedTierProfile },
  { label: "Expert Tier Builder", value: "expert", profile: mockExpertTierProfile }
];

export default function ProfileDemo() {
  const [selectedProfile, setSelectedProfile] = useState(profileOptions[0]);
  const [isOwner, setIsOwner] = useState(false);
  
  // Mock functions for demo
  const handleEditProfile = () => {
    alert("Edit Profile functionality would open a form to update profile information");
  };
  
  const handleScheduleSession = () => {
    alert(`Schedule a session with ${selectedProfile.profile.name}`);
  };
  
  const handleSendMessage = () => {
    alert(`Send a message to ${selectedProfile.profile.name}`);
  };
  
  const handleAddProject = () => {
    alert("Add Project functionality would open a form to add a new portfolio project");
  };
  
  const handleViewAllProjects = () => {
    alert("View All Projects would navigate to a dedicated portfolio page");
  };
  
  return (
    <div className="container max-w-7xl py-8">
      {/* Demo controls */}
      <div className="bg-muted/30 border rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <InfoCircledIcon className="h-4 w-4" />
          <span className="text-sm">Demo Controls</span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium block mb-1">Builder Profile Type</label>
            <select 
              className="bg-background border rounded-md px-3 py-1.5 text-sm"
              value={selectedProfile.value}
              onChange={(e) => {
                const found = profileOptions.find(option => option.value === e.target.value);
                if (found) setSelectedProfile(found);
              }}
            >
              {profileOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View As:</label>
            <Button 
              variant={isOwner ? "default" : "outline"} 
              size="sm"
              onClick={() => setIsOwner(true)}
            >
              Profile Owner
            </Button>
            <Button 
              variant={!isOwner ? "default" : "outline"}
              size="sm"
              onClick={() => setIsOwner(false)}
            >
              Visitor
            </Button>
          </div>
        </div>
      </div>
      
      {/* Builder Profile */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <BuilderProfile
          profile={selectedProfile.profile}
          isOwner={isOwner}
          onEditProfile={handleEditProfile}
          onScheduleSession={handleScheduleSession}
          onSendMessage={handleSendMessage}
          onAddProject={handleAddProject}
          onViewAllProjects={handleViewAllProjects}
        />
      </div>
    </div>
  );
}