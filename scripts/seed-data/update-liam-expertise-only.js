/**
 * Script to only update Liam's expertise areas
 * 
 * This script assumes Liam's user and basic profile already exist via Clerk webhooks
 * and only updates the expertise areas and related profile fields.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Liam\'s expertise areas...');

  // Use the appropriate Clerk ID based on environment
  const isProd = process.env.NODE_ENV === 'production';
  const clerkUserId = isProd 
    ? 'user_2wBNHJwI9cJdILyvlRnv4zxu090' // Liam's production Clerk user ID
    : 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx'; // Liam's development Clerk user ID (with admin)

  // Find Liam's user by Clerk ID
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: {
      id: true,
      name: true,
      email: true,
      builderProfile: true
    }
  });

  if (!user) {
    console.log(`User with Clerk ID ${clerkUserId} not found in database. Creating user.`);
    
    // Create the user with minimal required fields
    try {
      const email = isProd ? 'liam@buildappswith.ai' : 'liam.jones@buildappswith.com';
      
      user = await prisma.user.create({
        data: {
          name: 'Liam Jons',
          email: email,
          clerkId: clerkUserId,
          roles: ['ADMIN', 'BUILDER'],
          isFounder: true,
          verified: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          builderProfile: true
        }
      });
      
      console.log(`Created user: ${user.name} (${user.email})`);
    } catch (error) {
      console.error('Error creating user:', error);
      console.log('Trying to get existing user by email instead...');
      
      // Try to find by email as fallback
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: 'liam@buildappswith.ai' },
            { email: 'liam.jones@buildappswith.com' }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          builderProfile: true
        }
      });
      
      if (!user) {
        console.error('Could not find or create user. Exiting.');
        process.exit(1);
      }
      
      // Update the user's clerkId
      await prisma.user.update({
        where: { id: user.id },
        data: { clerkId: clerkUserId }
      });
      
      console.log(`Updated existing user with Clerk ID: ${user.name} (${user.email})`);
    }
  }

  console.log(`Found user: ${user.name} (${user.email})`);

  // Check if builder profile exists
  let builderProfile = user.builderProfile;
  
  if (!builderProfile) {
    console.log('Builder profile not found. Creating a new one.');
    
    builderProfile = await prisma.builderProfile.create({
      data: {
        userId: user.id,
        bio: "Founder of BuildAppsWith, helping individuals and businesses leverage AI to build applications that solve real problems. Specialized in ADHD productivity strategies and creating value through thoughtful AI integration. With over 10 years of experience in software development and AI, I focus on practical implementations that deliver tangible results.",
        headline: "AI Application Builder & ADHD Productivity Specialist",
        adhd_focus: true,
        validationTier: 3,
        domains: ["AI Development", "ADHD Productivity", "Business Strategy", "AI Literacy"],
        badges: ["Founder", "AI Expert", "Verified"]
      }
    });
    
    console.log(`Created builder profile: ${builderProfile.id}`);
  } else {
    console.log(`Found existing builder profile: ${builderProfile.id}`);
  }

  // Prepare expertise areas JSON
  const expertiseAreas = {
    ADHD_PRODUCTIVITY: {
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
    AI_LITERACY: {
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
    BUILDING_WITH_AI: {
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
    BUSINESS_VALUE: {
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
  };

  // Prepare social links JSON
  const socialLinks = {
    website: "https://buildappswith.ai",
    linkedin: "https://linkedin.com/in/liamjons",
    github: "https://github.com/buildappswith",
    twitter: "https://twitter.com/buildappswith"
  };

  // Prepare portfolio items JSON
  const portfolioItems = [
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
  ];

  // Update the profile with expertise areas via direct SQL to avoid schema issues
  try {
    // Use Prisma's $queryRaw to execute SQL directly
    await prisma.$executeRaw`
      UPDATE "BuilderProfile" 
      SET 
        "displayName" = 'Liam Jons',
        "responseRate" = 98,
        "completedProjects" = 87,
        "tagline" = 'Building AI applications with focus on ADHD productivity and business value',
        "slug" = 'liam-jons',
        "expertiseAreas" = ${JSON.stringify(expertiseAreas)}::jsonb,
        "featured" = true,
        "searchable" = true,
        "availability" = 'available',
        "socialLinks" = ${JSON.stringify(socialLinks)}::jsonb,
        "portfolioItems" = ${JSON.stringify(portfolioItems)}::jsonb
      WHERE "id" = ${builderProfile.id}
    `;

    console.log('Successfully updated Liam\'s profile with expertise areas.');
  } catch (error) {
    console.error('Error updating profile:', error);
    process.exit(1);
  }

  // Create session types for Liam if they don't exist
  try {
    const existingSessionTypes = await prisma.sessionType.findMany({
      where: { builderId: builderProfile.id }
    });

    if (existingSessionTypes.length === 0) {
      console.log('Creating session types for Liam');
      
      const sessionTypes = [
        {
          title: "Quick Strategy Session",
          description: "30-minute focused session to discuss a specific challenge or opportunity with AI implementation.",
          durationMinutes: 30,
          price: 75,
          currency: "USD",
          isActive: true,
          color: "#4f46e5", // Indigo
          builderId: builderProfile.id
        },
        {
          title: "ADHD Productivity Consultation",
          description: "In-depth session focused on designing AI-powered productivity systems tailored to ADHD minds.",
          durationMinutes: 60,
          price: 150,
          currency: "USD",
          isActive: true,
          color: "#9333ea", // Purple
          builderId: builderProfile.id
        },
        {
          title: "Business AI Assessment",
          description: "Comprehensive evaluation of your business operations to identify high-value AI implementation opportunities.",
          durationMinutes: 90,
          price: 250,
          currency: "USD",
          isActive: true,
          color: "#0891b2", // Cyan
          builderId: builderProfile.id
        },
        {
          title: "AI Literacy Workshop",
          description: "Personalized workshop to elevate your AI literacy and prompt engineering skills.",
          durationMinutes: 120,
          price: 300,
          currency: "USD",
          isActive: true,
          color: "#16a34a", // Green
          builderId: builderProfile.id
        }
      ];

      // Create session types
      await prisma.sessionType.createMany({
        data: sessionTypes
      });
      
      console.log('Created session types for Liam');
    } else {
      console.log(`Found ${existingSessionTypes.length} existing session types, skipping creation`);
    }
  } catch (error) {
    console.error('Error creating session types:', error);
    // Continue execution - don't exit as this is non-critical
  }

  console.log('Profile update completed successfully!');
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });