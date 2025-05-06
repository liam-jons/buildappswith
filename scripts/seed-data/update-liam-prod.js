/**
 * Script to update Liam's profile in PRODUCTION using direct SQL queries
 * 
 * This script is specifically designed for the production schema
 * which is different from the development schema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Liam\'s profile in PRODUCTION with direct SQL...');

  // Production-specific Clerk ID  
  const clerkUserId = 'user_2wBNHJwI9cJdILyvlRnv4zxu090'; // Liam's production Clerk user ID 
  const liamEmail = 'liam@buildappswith.ai';
  
  // Always run in PRODUCTION mode with safety checks
  console.log('⚠️ RUNNING IN PRODUCTION MODE ⚠️');
  console.log(`Using Clerk ID: ${clerkUserId}`);
  console.log(`Using email: ${liamEmail}`);
  console.log('Database URL:', process.env.DATABASE_URL.substring(0, 25) + '...');
  
  // Give 5 seconds to cancel if needed
  console.log('Waiting 5 seconds before proceeding... Press Ctrl+C to cancel.');
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Check if user exists using raw SQL
    const users = await prisma.$queryRaw`
      SELECT id, name, email FROM "User" 
      WHERE email = ${liamEmail}
      LIMIT 1
    `;
    
    let userId;
    
    if (users.length === 0) {
      console.log(`No user found for Liam. Creating user with Clerk ID: ${clerkUserId}`);
      
      // Create user with fields available in PRODUCTION schema
      // Note: Using 'ADMIN' role instead of array of roles
      const newUser = await prisma.$queryRaw`
        INSERT INTO "User" (id, name, email, "clerkId", verified, role, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(), 
          'Liam Jons', 
          ${liamEmail}, 
          ${clerkUserId},
          true, 
          'ADMIN'::role, -- Production uses a single role enum (not an array)
          NOW(), 
          NOW()
        )
        RETURNING id
      `;
      
      userId = newUser[0].id;
      console.log(`Created user with ID: ${userId}`);
    } else {
      userId = users[0].id;
      console.log(`Found existing user: ${users[0].name} (${users[0].email}) with ID: ${userId}`);
      
      // Update the clerk ID if it's not set
      if (!users[0].clerkId) {
        await prisma.$executeRaw`
          UPDATE "User" 
          SET "clerkId" = ${clerkUserId}
          WHERE id = ${userId}
        `;
        console.log(`Updated user with Clerk ID: ${clerkUserId}`);
      }
    }
    
    // Check if builder profile exists
    const profiles = await prisma.$queryRaw`
      SELECT id FROM "BuilderProfile" 
      WHERE "userId" = ${userId}
      LIMIT 1
    `;
    
    let profileId;
    
    if (profiles.length === 0) {
      console.log('No builder profile found. Creating one...');
      
      // Create a new builder profile with fields available in PRODUCTION schema
      const newProfile = await prisma.$queryRaw`
        INSERT INTO "BuilderProfile" (
          id, 
          "userId", 
          bio, 
          headline, 
          "validationTier", 
          "featuredBuilder", 
          domains, 
          badges, 
          "availableForHire", 
          "createdAt", 
          "updatedAt"
        )
        VALUES (
          gen_random_uuid(), 
          ${userId}, 
          'Founder of BuildAppsWith, helping individuals and businesses leverage AI to build applications that solve real problems. Specialized in ADHD productivity strategies and creating value through thoughtful AI integration.',
          'AI Application Builder & ADHD Productivity Specialist',
          3,
          true,
          ARRAY['AI Development', 'ADHD Productivity', 'Business Strategy', 'AI Literacy']::text[],
          ARRAY['Founder', 'AI Expert', 'Verified']::text[],
          true,
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      
      profileId = newProfile[0].id;
      console.log(`Created builder profile with ID: ${profileId}`);
    } else {
      profileId = profiles[0].id;
      console.log(`Found existing builder profile with ID: ${profileId}`);
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
            date: "2023-09-15"
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
            date: "2023-10-22"
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
            date: "2023-08-05"
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
            date: "2023-11-12"
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
        description: "Custom productivity application designed specifically for ADHD users.",
        imageUrl: "/images/portfolio/adhd-task-manager.jpg",
        tags: ["ADHD", "Productivity", "AI"],
        technologies: ["React", "TypeScript", "OpenAI"],
        demoUrl: "https://adhd-task-manager.buildappswith.ai",
        featured: true
      },
      {
        id: "project2",
        title: "AI Literacy Learning Portal",
        description: "Interactive learning platform to help users understand and use AI tools.",
        imageUrl: "/images/portfolio/ai-literacy.jpg",
        tags: ["Education", "AI Literacy"],
        technologies: ["Next.js", "Tailwind CSS", "Anthropic API"]
      },
      {
        id: "project3",
        title: "Business Value Calculator",
        description: "Tool for businesses to quantify the potential value of AI integration.",
        imageUrl: "/images/portfolio/value-calculator.jpg",
        tags: ["Business", "ROI", "Analytics"],
        technologies: ["Vue.js", "Chart.js", "GPT-4"]
      }
    ];

    // Check if the slug already exists on another profile
    const slugCheck = await prisma.$queryRaw`
      SELECT id FROM "BuilderProfile" WHERE slug = 'liam-jons' AND id != ${profileId}
    `;
    
    if (slugCheck.length > 0) {
      console.log(`Slug 'liam-jons' is already taken by another profile. Using 'liam-jons-2'.`);
      
      // Update with a different slug
      await prisma.$executeRaw`
        UPDATE "BuilderProfile" 
        SET 
          "displayName" = 'Liam Jons',
          "responseRate" = 98,
          "completedProjects" = 87,
          "tagline" = 'Building AI applications with focus on ADHD productivity and business value',
          "slug" = 'liam-jons-2',
          "expertiseAreas" = ${JSON.stringify(expertiseAreas)}::jsonb,
          "featured" = true,
          "searchable" = true,
          "availability" = 'available',
          "socialLinks" = ${JSON.stringify(socialLinks)}::jsonb,
          "portfolioItems" = ARRAY[${JSON.stringify(portfolioItems[0])}::jsonb, ${JSON.stringify(portfolioItems[1])}::jsonb, ${JSON.stringify(portfolioItems[2])}::jsonb],
          "updatedAt" = NOW()
        WHERE "id" = ${profileId}
      `;
    } else {
      // Update with the original slug
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
          "portfolioItems" = ARRAY[${JSON.stringify(portfolioItems[0])}::jsonb, ${JSON.stringify(portfolioItems[1])}::jsonb, ${JSON.stringify(portfolioItems[2])}::jsonb],
          "updatedAt" = NOW()
        WHERE "id" = ${profileId}
      `;
    }
    
    console.log('Successfully updated Liam\'s profile with expertise areas');
    
    // Check if session types exist
    const sessionTypes = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "SessionType" 
      WHERE "builderId" = ${profileId}
    `;
    
    if (parseInt(sessionTypes[0].count) === 0) {
      console.log('Creating session types for Liam');
      
      // Create session types using raw SQL
      await prisma.$executeRaw`
        INSERT INTO "SessionType" (
          id, 
          "builderId", 
          title, 
          description, 
          "durationMinutes", 
          price, 
          currency, 
          "isActive", 
          color, 
          "createdAt", 
          "updatedAt"
        )
        VALUES 
        (
          gen_random_uuid(), 
          ${profileId}, 
          'Quick Strategy Session', 
          '30-minute focused session to discuss a specific challenge or opportunity with AI implementation.',
          30, 
          75, 
          'USD', 
          true, 
          '#4f46e5', 
          NOW(), 
          NOW()
        ),
        (
          gen_random_uuid(), 
          ${profileId}, 
          'ADHD Productivity Consultation', 
          'In-depth session focused on designing AI-powered productivity systems tailored to ADHD minds.',
          60, 
          150, 
          'USD', 
          true, 
          '#9333ea', 
          NOW(), 
          NOW()
        ),
        (
          gen_random_uuid(), 
          ${profileId}, 
          'Business AI Assessment', 
          'Comprehensive evaluation of your business operations to identify high-value AI implementation opportunities.',
          90, 
          250, 
          'USD', 
          true, 
          '#0891b2', 
          NOW(), 
          NOW()
        ),
        (
          gen_random_uuid(), 
          ${profileId}, 
          'AI Literacy Workshop', 
          'Personalized workshop to elevate your AI literacy and prompt engineering skills.',
          120, 
          300, 
          'USD', 
          true, 
          '#16a34a', 
          NOW(), 
          NOW()
        )
      `;
      
      console.log('Created session types for Liam');
    } else {
      console.log(`Found ${sessionTypes[0].count} existing session types, skipping creation`);
    }
    
    console.log('Profile update completed successfully!');
  } catch (error) {
    console.error('Error in profile update:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});