// data.tsx - Static data for landing page components
// TODO: In the future, this would be replaced with Sanity CMS data fetching

import { BarChart, Book, Code, FileCode, Globe, HeartHandshake, Lightbulb, Mic, PenTool, Shield, User, Users } from "lucide-react";
import { Capability, HeroContent, Limitation, NavigationItem, SkillNode } from "./types";
import React from "react";

// Navigation Data
export const mainNavItems: NavigationItem[] = [
  {
    title: "I would like to...",
    items: [
      {
        title: "Learn AI Fundamentals",
        href: "/learning",
        description: "Start your AI journey with human-guided learning"
      },
      {
        title: "Collaborate with AI Builders",
        href: "/marketplace",
        description: "Find experienced developers for your project"
      },
      {
        title: "Book a Consultation",
        href: "/book",
        description: "Get personalized guidance on your AI journey"
      },
      {
        title: "Join Weekly Sessions",
        href: "/weekly-sessions",
        description: "Learn with others in our community sessions"
      }
    ]
  },
  {
    title: "About Us",
    items: [
      {
        title: "How It Works",
        href: "/how-it-works",
        description: "Learn about our human-centered approach"
      },
      {
        title: "Our Community",
        href: "/community",
        description: "Meet our network of AI builders and learners"
      },
      {
        title: "FAQ",
        href: "/faq",
        description: "Answers to your most common questions"
      },
      {
        title: "Contact Us",
        href: "/contact",
        description: "Get in touch with our team"
      }
    ]
  },
  {
    title: "Pricing",
    href: "/pricing"
  }
];

// Hero Content
export const heroContent: HeroContent = {
  headline: "Learn AI with [names], not just prompts",
  subheadline: "Build real AI skills through creating your own application. Our community of experienced builders will guide you through the landscape of AI as a world of opportunity awaits",
  rotatingNames: [
    "Liam", "Kenny", "Ryan", "Sheri", "Troy",
    "Loveable", "Bolt", "Claude", "Gemini", "ChatGPT",
    "your friends", "your team", "your customers"
  ],
  primaryCTA: {
    text: "Sign Up Now",
    href: "/signup"
  },
  secondaryCTA: {
    text: "Just keep me informed for now",
    href: "/newsletter"
  }
};

// AI Capabilities and Limitations
export const aiCapabilities: Capability[] = [
  { title: "Process natural language text", icon: React.createElement(FileCode, { className: "h-5 w-5" }) },
  { title: "Generate creative content", icon: React.createElement(PenTool, { className: "h-5 w-5" }) },
  { title: "Analyse data for patterns", icon: React.createElement(BarChart, { className: "h-5 w-5" }) },
  { title: "Answer questions from context", icon: React.createElement(Mic, { className: "h-5 w-5" }) },
  { title: "Translate between languages", icon: React.createElement(Globe, { className: "h-5 w-5" }) },
  { title: "Recognise images and content", icon: React.createElement(FileCode, { className: "h-5 w-5" }) },
  { title: "Code assistance and generation", icon: React.createElement(Code, { className: "h-5 w-5" }) },
  { title: "Summarise large documents", icon: React.createElement(FileCode, { className: "h-5 w-5" }) }
];

export const aiLimitations: Limitation[] = [
  { title: "Have true understanding or consciousness", icon: React.createElement(Users, { className: "h-5 w-5" }) },
  { title: "Replace human creativity and innovation", icon: React.createElement(Lightbulb, { className: "h-5 w-5" }) },
  { title: "Provide emotional intelligence", icon: React.createElement(HeartHandshake, { className: "h-5 w-5" }) },
  { title: "Have real-world experience", icon: React.createElement(User, { className: "h-5 w-5" }) },
  { title: "Guarantee factual accuracy", icon: React.createElement(Shield, { className: "h-5 w-5" }) },
  { title: "Make ethical judgments", icon: React.createElement(FileCode, { className: "h-5 w-5" }) },
  { title: "Understand cultural nuances", icon: React.createElement(Globe, { className: "h-5 w-5" }) },
  { title: "Replace human connection", icon: React.createElement(Users, { className: "h-5 w-5" }) }
];

// Skills Learning Tree
export const skillsData: SkillNode[] = [
  {
    title: "Accelerate",
    level: 1,
    icon: React.createElement(Book, { className: "h-6 w-6" }),
    description: "Learn how to use AI to help you accelerate your abilities",
    isCompleted: false,
    isActive: true,
  },
  {
    title: "Pivot",
    level: 2,
    icon: React.createElement(FileCode, { className: "h-6 w-6" }),
    description: "Learn how to use AI to find your next opportunity",
    isCompleted: false,
    isActive: false,
  },
  {
    title: "Play",
    level: 3,
    icon: React.createElement(Code, { className: "h-6 w-6" }),
    description: "Use AI tools to build - for fun!",
    isCompleted: false,
    isActive: false,
  }
];