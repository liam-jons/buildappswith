/**
 * Mock profile data for development and testing
 * NOTE: This file is temporary and will be removed when real API integration is implemented
 */

import { SpecializationArea } from "@/lib/profile/types";

/**
 * Mock established tier builder profile
 */
export const mockEstablishedTierProfile = {
  id: "mock-profile-1",
  name: "Jane Developer",
  title: "AI Application Specialist",
  bio: "Experienced developer focused on building practical AI applications that help people with ADHD increase productivity and reduce cognitive load. I specialize in creating intuitive interfaces and workflows that adapt to your unique needs.",
  avatarUrl: "https://ui-avatars.com/api/?name=Jane+Developer&background=random",
  validationTier: "verified" as const, // Established tier
  joinDate: new Date(2023, 3, 15), // April 15, 2023
  completedProjects: 12,
  rating: 4.8,
  responseRate: 95,
  skills: [
    "AI Integration",
    "React",
    "Next.js",
    "TypeScript",
    "Python",
    "UI/UX",
    "Accessibility",
    "ADHD Tools"
  ],
  availability: {
    status: "available" as const
  },
  adhdFocus: true,
  roles: ["BUILDER"],
  socialLinks: {
    website: "https://example.com",
    linkedin: "https://linkedin.com/in/example",
    github: "https://github.com/example",
    twitter: "https://twitter.com/example"
  },
  portfolio: [
    {
      id: "mock-project-1",
      title: "Focus Flow",
      description: "An AI-powered task management app designed specifically for people with ADHD. Uses machine learning to adapt to individual work patterns and minimize distractions.",
      imageUrl: "https://placehold.co/600x400/e6f7ff/0a85ff?text=Focus+Flow",
      tags: ["ADHD", "Productivity", "AI"],
      technologies: ["React", "Node.js", "TensorFlow.js"],
      demoUrl: "https://example.com/focusflow",
      completionDate: new Date(2023, 8, 10), // September 10, 2023
      featured: true
    },
    {
      id: "mock-project-2",
      title: "Insight Generator",
      description: "An NLP tool that helps extract and organize key insights from lengthy research papers and documents.",
      imageUrl: "https://placehold.co/600x400/fff3e0/ff9800?text=Insight+Generator",
      tags: ["NLP", "Research", "Productivity"],
      technologies: ["Python", "Flask", "HuggingFace", "React"],
      demoUrl: "https://example.com/insight",
      completionDate: new Date(2023, 5, 22), // June 22, 2023
      featured: true
    },
    {
      id: "mock-project-3",
      title: "Visual Study Companion",
      description: "A visual learning tool that transforms complex topics into interactive visual models to aid comprehension for visual thinkers.",
      imageUrl: "https://placehold.co/600x400/e8f5e9/4caf50?text=Visual+Study",
      tags: ["Education", "Visual Learning", "3D"],
      technologies: ["Three.js", "WebGL", "Next.js"],
      completionDate: new Date(2023, 2, 15), // March 15, 2023
      featured: false
    }
  ],
  expertiseAreas: {
    [SpecializationArea.ADHD_PRODUCTIVITY]: {
      description: "I specialize in creating digital tools and systems that help individuals with ADHD leverage their unique cognitive styles and overcome common challenges.",
      bulletPoints: [
        "Custom notification and reminder systems that adapt to individual attention patterns",
        "Visual task management interfaces that reduce cognitive load",
        "Integration of context-aware AI assistants to help maintain focus and track time",
        "Systems designed with hyperfocus and time blindness in mind"
      ],
      testimonials: [
        {
          id: "testimonial-1",
          author: "Alex Chen",
          role: "Startup Founder with ADHD",
          content: "Jane's deep understanding of ADHD challenges transformed how I work. The systems she built for me have literally changed my life.",
          rating: 5,
          date: new Date(2023, 7, 10) // August 10, 2023
        }
      ]
    },
    [SpecializationArea.BUILDING_WITH_AI]: {
      description: "I help clients design and implement practical AI solutions that solve real problems without unnecessary complexity.",
      bulletPoints: [
        "Integration of AI capabilities into existing workflows and applications",
        "Custom LLM-powered tools for content generation and analysis",
        "Prompt engineering and optimization for specific use cases",
        "Development of AI applications with human-centered design principles"
      ],
      testimonials: [
        {
          id: "testimonial-2",
          author: "Robin Taylor",
          role: "Content Creator",
          content: "Jane built a custom AI assistant that helps me organize research and generate content outlines. It feels like it understands exactly how I think.",
          rating: 5,
          date: new Date(2023, 9, 5) // October 5, 2023
        }
      ]
    }
  }
};

/**
 * Mock entry level builder profile
 */
export const mockEntryTierProfile = {
  id: "mock-profile-2",
  name: "Chris Builder",
  title: "Junior AI Developer",
  bio: "Passionate about creating AI applications that solve real-world problems. Currently focused on learning best practices for integrating AI into web applications.",
  avatarUrl: "https://ui-avatars.com/api/?name=Chris+Builder&background=random",
  validationTier: "basic" as const, // Entry tier
  joinDate: new Date(2023, 10, 5), // November 5, 2023
  completedProjects: 3,
  rating: 4.2,
  responseRate: 90,
  skills: [
    "JavaScript",
    "React",
    "Node.js",
    "OpenAI API",
    "Python Basics"
  ],
  availability: {
    status: "limited" as const
  },
  adhdFocus: false,
  roles: ["BUILDER"],
  portfolio: [
    {
      id: "mock-project-4",
      title: "AI Text Summarizer",
      description: "A simple web application that uses AI to summarize long articles and documents.",
      imageUrl: "https://placehold.co/600x400/f3e5f5/9c27b0?text=Text+Summarizer",
      tags: ["NLP", "Productivity"],
      technologies: ["JavaScript", "HTML/CSS", "OpenAI API"],
      demoUrl: "https://example.com/summarizer",
      completionDate: new Date(2023, 11, 10), // December 10, 2023
      featured: true
    },
    {
      id: "mock-project-5",
      title: "Intelligent Form Assistant",
      description: "A form assistant that helps users fill out complex forms by providing context-aware suggestions.",
      imageUrl: "https://placehold.co/600x400/e1f5fe/03a9f4?text=Form+Assistant",
      tags: ["Forms", "UX", "AI"],
      technologies: ["React", "TypeScript", "GPT-3.5"],
      completionDate: new Date(2024, 0, 15), // January 15, 2024
      featured: false
    }
  ]
};

/**
 * Mock expert tier builder profile
 */
export const mockExpertTierProfile = {
  id: "mock-profile-3",
  name: "Dr. Morgan Smith",
  title: "AI Solutions Architect",
  bio: "AI specialist with over 8 years of experience developing enterprise-grade AI solutions. I focus on creating scalable, ethical AI systems that deliver tangible business value while ensuring accessibility and inclusivity.",
  avatarUrl: "https://ui-avatars.com/api/?name=Morgan+Smith&background=random",
  coverImageUrl: "https://placehold.co/1200x400/edf2ff/4263eb?text=AI+Solutions+Architect",
  validationTier: "expert" as const, // Expert tier
  joinDate: new Date(2022, 1, 20), // February 20, 2022
  completedProjects: 27,
  rating: 4.9,
  responseRate: 98,
  skills: [
    "AI Strategy",
    "Enterprise Architecture",
    "Python",
    "TensorFlow",
    "LLM Integration",
    "MLOps",
    "Accessibility",
    "ADHD Support"
  ],
  adhdFocus: true,
  roles: ["BUILDER", "ADMIN"],
  isFounder: true,
  availability: {
    status: "limited" as const,
    nextAvailable: new Date(2024, 3, 15) // April 15, 2024
  },
  socialLinks: {
    website: "https://example.com/morgansmith",
    linkedin: "https://linkedin.com/in/morgansmith",
    github: "https://github.com/morgansmith",
    twitter: "https://twitter.com/morgansmith"
  },
  portfolio: [
    {
      id: "mock-project-6",
      title: "Enterprise AI Knowledge Management",
      description: "A comprehensive AI system for large enterprises that automatically organizes, tags, and makes searchable all company knowledge assets.",
      imageUrl: "https://placehold.co/600x400/e8eaf6/3f51b5?text=Enterprise+KM",
      tags: ["Enterprise", "Knowledge Management", "AI"],
      technologies: ["Python", "TensorFlow", "AWS", "Angular"],
      demoUrl: "https://example.com/enterprise-km",
      completionDate: new Date(2023, 1, 10), // February 10, 2023
      featured: true
    },
    {
      id: "mock-project-7",
      title: "Inclusive AI Assistant Platform",
      description: "An AI assistant platform designed from the ground up to be accessible to users with various cognitive styles and abilities, including ADHD and dyslexia.",
      imageUrl: "https://placehold.co/600x400/fff8e1/ffc107?text=Inclusive+AI",
      tags: ["Accessibility", "ADHD", "Cognitive Diversity"],
      technologies: ["React", "Node.js", "TensorFlow.js", "OpenAI API"],
      demoUrl: "https://example.com/inclusive-ai",
      completionDate: new Date(2023, 4, 20), // May 20, 2023
      featured: true
    },
    {
      id: "mock-project-8",
      title: "AI Ethical Framework Toolkit",
      description: "An open-source toolkit for implementing ethical AI practices across all stages of AI development.",
      imageUrl: "https://placehold.co/600x400/fce4ec/e91e63?text=Ethical+AI",
      tags: ["Ethics", "Open Source", "Diversity"],
      technologies: ["Python", "JavaScript", "Documentation"],
      demoUrl: "https://example.com/ethical-ai",
      repositoryUrl: "https://github.com/example/ethical-ai",
      completionDate: new Date(2022, 8, 5), // September 5, 2022
      featured: true
    }
  ],
  expertiseAreas: {
    [SpecializationArea.ADHD_PRODUCTIVITY]: {
      description: "I create enterprise-grade AI systems designed to support neurodivergent professionals, with a special focus on ADHD-friendly workflows and interfaces.",
      bulletPoints: [
        "Integration of ADHD-friendly features into enterprise software systems",
        "AI assistants that adapt to individual executive functioning needs",
        "Data-driven approaches to identifying and removing accessibility barriers",
        "Training and support for organizations implementing neurodiversity initiatives"
      ],
      testimonials: [
        {
          id: "testimonial-3",
          author: "Jamie Wong",
          role: "CTO, TechCorp",
          content: "Dr. Smith transformed our workflow tools to support all cognitive styles. Since implementation, we've seen a 35% increase in productivity among our neurodivergent team members.",
          rating: 5,
          date: new Date(2023, 3, 15) // April 15, 2023
        }
      ]
    },
    [SpecializationArea.BUSINESS_VALUE]: {
      description: "I help businesses identify and implement AI solutions that deliver measurable ROI while enhancing accessibility and inclusion.",
      bulletPoints: [
        "AI strategy development aligned with business objectives",
        "Cost-benefit analysis of AI implementation options",
        "Measurable metrics for tracking AI solution effectiveness",
        "Accessibility-focused AI implementations that expand market reach"
      ],
      testimonials: [
        {
          id: "testimonial-4",
          author: "Sam Rivera",
          role: "CEO, InnovateCo",
          content: "Morgan's approach to AI strategy helped us focus on solutions that actually moved our business metrics. Their emphasis on inclusivity also opened new market segments we hadn't considered.",
          rating: 5,
          date: new Date(2023, 5, 10) // June 10, 2023
        }
      ]
    },
    [SpecializationArea.AI_LITERACY]: {
      description: "I develop custom AI literacy programs for organizations, ensuring all team members understand AI capabilities and limitations regardless of technical background.",
      bulletPoints: [
        "Customized AI training programs for technical and non-technical staff",
        "Accessible documentation and learning resources for diverse learning styles",
        "Hands-on workshops for practical AI skills development",
        "Ongoing support for teams implementing AI in their workflows"
      ],
      testimonials: [
        {
          id: "testimonial-5",
          author: "Taylor Johnson",
          role: "Director of Learning & Development",
          content: "Dr. Smith's AI literacy program was transformative. Their approach made complex AI concepts accessible to our entire organization, from executives to frontline staff.",
          rating: 5,
          date: new Date(2023, 7, 22) // August 22, 2023
        }
      ]
    }
  },
  metrics: [
    {
      id: "metrics-category-1",
      name: "Project Performance",
      description: "Key metrics from completed projects",
      metrics: [
        {
          id: "metric-1",
          name: "Average Client ROI",
          value: 327,
          suffix: "%",
          description: "Average return on investment reported by clients",
          trend: {
            direction: "up",
            percentage: 12
          }
        },
        {
          id: "metric-2",
          name: "On-time Delivery",
          value: 98,
          suffix: "%",
          description: "Percentage of projects delivered on schedule",
          trend: {
            direction: "up",
            percentage: 3
          }
        },
        {
          id: "metric-3",
          name: "Client Retention",
          value: 92,
          suffix: "%",
          description: "Percentage of clients who return for additional projects",
          trend: {
            direction: "neutral"
          }
        }
      ]
    },
    {
      id: "metrics-category-2",
      name: "AI Solution Impact",
      description: "Measured impact of implemented AI solutions",
      metrics: [
        {
          id: "metric-4",
          name: "Productivity Increase",
          value: 42,
          suffix: "%",
          description: "Average productivity improvement reported by clients",
          trend: {
            direction: "up",
            percentage: 7
          }
        },
        {
          id: "metric-5",
          name: "Accessibility Score",
          value: 97,
          suffix: "/100",
          description: "Average accessibility rating of delivered solutions",
          trend: {
            direction: "up",
            percentage: 5
          }
        }
      ]
    }
  ]
};