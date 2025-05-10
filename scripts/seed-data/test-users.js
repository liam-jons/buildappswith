/**
 * Test User Provisioning Script
 *
 * This script creates standardized test users in both Clerk and the database
 * for consistent testing across environments.
 *
 * Requirements:
 * - CLERK_SECRET_KEY environment variable must be set
 * - NODE_ENV should be 'development' or 'test', never 'production'
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const clerk = require('@clerk/clerk-sdk-node');
const prisma = new PrismaClient();

// Define UserRole enum directly instead of importing
const UserRole = {
  CLIENT: 'CLIENT',
  BUILDER: 'BUILDER',
  ADMIN: 'ADMIN'
};

// The clerk SDK is already initialized with the secretKey from environment variables

// Validation
if (!process.env.CLERK_SECRET_KEY) {
  console.error('Error: CLERK_SECRET_KEY environment variable is not set.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  console.error('Error: This script should not be run in production environment.');
  process.exit(1);
}

// Test user definitions
// Based on real test email addresses available for the buildappswith.com domain
const TEST_USERS = [
  // Standard Clients (3)
  {
    email: 'client-test1@buildappswith.com',
    password: 'TestClient123!',
    firstName: 'Client',
    lastName: 'One',
    roles: ['CLIENT'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 80
    },
    databaseFields: {
      roles: ['CLIENT'],
      verified: true
    },
    profiles: {
      clientProfile: {
        companyName: 'Test Company One',
        industry: 'Technology',
        projectPreferences: {
          budgetRange: '5000-10000',
          timeframe: '1-3 months',
          preferredTechnologies: ['React', 'Node.js']
        }
      }
    }
  },
  {
    email: 'client-test2@buildappswith.com',
    password: 'TestClient123!',
    firstName: 'Client',
    lastName: 'Two',
    roles: ['CLIENT'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 85
    },
    databaseFields: {
      roles: ['CLIENT'],
      verified: true
    },
    profiles: {
      clientProfile: {
        companyName: 'Test Company Two',
        industry: 'Healthcare',
        projectPreferences: {
          budgetRange: '3000-8000',
          timeframe: '1-2 months',
          preferredTechnologies: ['Vue', 'Express']
        }
      }
    }
  },
  {
    email: 'client-test3@buildappswith.com',
    password: 'TestClient123!',
    firstName: 'Client',
    lastName: 'Three',
    roles: ['CLIENT'],
    metadata: {
      verified: true,
      onboardingComplete: false,
      profileCompleteness: 50
    },
    databaseFields: {
      roles: ['CLIENT'],
      verified: true
    },
    profiles: {
      clientProfile: {
        companyName: 'Test Company Three',
        industry: 'Education',
        projectPreferences: {
          budgetRange: '2000-5000',
          timeframe: '2-4 weeks',
          preferredTechnologies: ['React', 'Firebase']
        }
      }
    }
  },

  // Premium Clients (3)
  {
    email: 'premium-client-test1@buildappswith.com',
    password: 'PremiumClient123!',
    firstName: 'Premium',
    lastName: 'One',
    roles: ['CLIENT'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 100,
      premiumSubscription: true,
      subscriptionPlan: 'annual',
      subscriptionExpiry: '2025-12-31'
    },
    databaseFields: {
      roles: ['CLIENT'],
      verified: true,
      stripeCustomerId: 'cus_test_premium_client1'
    },
    profiles: {
      clientProfile: {
        companyName: 'Premium Ventures One',
        industry: 'Finance',
        projectPreferences: {
          budgetRange: '10000-50000',
          timeframe: '3-6 months',
          preferredTechnologies: ['React', 'Python', 'AWS']
        }
      }
    }
  },
  {
    email: 'premium-client-test2@buildappswith.com',
    password: 'PremiumClient123!',
    firstName: 'Premium',
    lastName: 'Two',
    roles: ['CLIENT'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 100,
      premiumSubscription: true,
      subscriptionPlan: 'monthly',
      subscriptionExpiry: '2025-06-30'
    },
    databaseFields: {
      roles: ['CLIENT'],
      verified: true,
      stripeCustomerId: 'cus_test_premium_client2'
    },
    profiles: {
      clientProfile: {
        companyName: 'Premium Ventures Two',
        industry: 'Real Estate',
        projectPreferences: {
          budgetRange: '15000-60000',
          timeframe: '2-5 months',
          preferredTechnologies: ['Angular', 'Java', 'GCP']
        }
      }
    }
  },
  {
    email: 'premium-client-test3@buildappswith.com',
    password: 'PremiumClient123!',
    firstName: 'Premium',
    lastName: 'Three',
    roles: ['CLIENT'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 95,
      premiumSubscription: true,
      subscriptionPlan: 'quarterly',
      subscriptionExpiry: '2025-09-30'
    },
    databaseFields: {
      roles: ['CLIENT'],
      verified: true,
      stripeCustomerId: 'cus_test_premium_client3'
    },
    profiles: {
      clientProfile: {
        companyName: 'Premium Ventures Three',
        industry: 'Retail',
        projectPreferences: {
          budgetRange: '12000-40000',
          timeframe: '1-4 months',
          preferredTechnologies: ['React Native', 'Node.js', 'MongoDB']
        }
      }
    }
  },

  // New Builders (3)
  {
    email: 'new-builder1@buildappswith.com',
    password: 'NewBuilder123!',
    firstName: 'New',
    lastName: 'Builder1',
    roles: ['BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: false,
      profileCompleteness: 30
    },
    databaseFields: {
      roles: ['BUILDER'],
      verified: true
    },
    profiles: {
      builderProfile: {
        bio: 'Just getting started as a builder on the platform, focusing on front-end development.',
        headline: 'Junior Front-End Developer',
        hourlyRate: 45,
        validationTier: 1,
        domains: ['Web Development'],
        badges: [],
        availableForHire: true,
        portfolioItems: []
      }
    }
  },
  {
    email: 'new-builder2@buildappswith.com',
    password: 'NewBuilder123!',
    firstName: 'New',
    lastName: 'Builder2',
    roles: ['BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: false,
      profileCompleteness: 40
    },
    databaseFields: {
      roles: ['BUILDER'],
      verified: true
    },
    profiles: {
      builderProfile: {
        bio: 'New builder with a background in mobile application development.',
        headline: 'Mobile App Developer',
        hourlyRate: 55,
        validationTier: 1,
        domains: ['Mobile Development'],
        badges: [],
        availableForHire: true,
        portfolioItems: []
      }
    }
  },
  {
    email: 'new-builder3@buildappswith.com',
    password: 'NewBuilder123!',
    firstName: 'New',
    lastName: 'Builder3',
    roles: ['BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 60
    },
    databaseFields: {
      roles: ['BUILDER'],
      verified: true
    },
    profiles: {
      builderProfile: {
        bio: 'New back-end developer transitioning to full-stack development.',
        headline: 'Back-End to Full-Stack Developer',
        hourlyRate: 60,
        validationTier: 1,
        domains: ['Back-End Development'],
        badges: [],
        availableForHire: true,
        portfolioItems: []
      }
    }
  },

  // Established Builders (3)
  {
    email: 'established-builder1@buildappswith.com',
    password: 'EstablishedBuilder123!',
    firstName: 'Established',
    lastName: 'Builder1',
    roles: ['BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 100,
      featuredBuilder: true
    },
    databaseFields: {
      roles: ['BUILDER'],
      verified: true,
      stripeCustomerId: 'cus_test_established_builder1'
    },
    profiles: {
      builderProfile: {
        bio: 'Experienced developer specializing in AI-powered web applications with over 5 years of professional experience.',
        headline: 'Senior Full Stack AI Developer',
        hourlyRate: 150,
        validationTier: 3,
        domains: ['Web Development', 'AI Integration'],
        badges: ['Top Rated', 'Quick Responder'],
        rating: 4.9,
        availableForHire: true,
        completedProjects: 25,
        responseRate: 98.5,
        expertiseAreas: {
          frontend: ['React', 'NextJS', 'Tailwind'],
          backend: ['Node.js', 'Python', 'PostgreSQL'],
          ai: ['LLM Integration', 'Custom AI Solutions']
        },
        featured: true,
        portfolioItems: [
          {
            title: 'AI-Powered CRM',
            description: 'Custom CRM with AI features for lead scoring and automated follow-ups.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=AI+CRM+Project',
            outcomes: [
              {
                label: 'Lead Conversion',
                value: '+45%',
                trend: 'up'
              }
            ],
            tags: ['AI', 'Web Development', 'CRM']
          },
          {
            title: 'E-commerce Recommendation Engine',
            description: 'Machine learning recommendation system for an e-commerce platform.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=ML+Recommendation+Engine',
            outcomes: [
              {
                label: 'Sales Increase',
                value: '+28%',
                trend: 'up'
              }
            ],
            tags: ['Machine Learning', 'E-commerce']
          }
        ],
        socialLinks: {
          github: 'https://github.com/established-builder1',
          linkedin: 'https://linkedin.com/in/established-builder1',
          website: 'https://established-builder1.dev'
        }
      }
    }
  },
  {
    email: 'established-builder2@buildappswith.com',
    password: 'EstablishedBuilder123!',
    firstName: 'Established',
    lastName: 'Builder2',
    roles: ['BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 98,
      featuredBuilder: false
    },
    databaseFields: {
      roles: ['BUILDER'],
      verified: true,
      stripeCustomerId: 'cus_test_established_builder2'
    },
    profiles: {
      builderProfile: {
        bio: 'Specialized in blockchain and web3 development with a focus on DeFi applications.',
        headline: 'Blockchain & Web3 Developer',
        hourlyRate: 175,
        validationTier: 3,
        domains: ['Blockchain', 'Web3', 'DeFi'],
        badges: ['Web3 Expert', 'Fast Delivery'],
        rating: 4.7,
        availableForHire: true,
        completedProjects: 18,
        responseRate: 94.5,
        expertiseAreas: {
          blockchain: ['Ethereum', 'Solidity', 'Smart Contracts'],
          frontend: ['React', 'Web3.js', 'Ethers.js'],
          backend: ['Node.js', 'GraphQL', 'IPFS']
        },
        featured: false,
        portfolioItems: [
          {
            title: 'DeFi Lending Platform',
            description: 'Decentralized lending platform with automated interest adjustments.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=DeFi+Lending',
            tags: ['Blockchain', 'DeFi', 'Smart Contracts']
          }
        ],
        socialLinks: {
          github: 'https://github.com/established-builder2',
          linkedin: 'https://linkedin.com/in/established-builder2',
          website: 'https://established-builder2.dev'
        }
      }
    }
  },
  {
    email: 'established-builder3@buildappswith.com',
    password: 'EstablishedBuilder123!',
    firstName: 'Established',
    lastName: 'Builder3',
    roles: ['BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 95,
      featuredBuilder: true
    },
    databaseFields: {
      roles: ['BUILDER'],
      verified: true,
      stripeCustomerId: 'cus_test_established_builder3'
    },
    profiles: {
      builderProfile: {
        bio: 'UX/UI specialist with extensive experience in design systems and accessible interfaces.',
        headline: 'UX/UI Designer & Developer',
        hourlyRate: 135,
        validationTier: 2,
        domains: ['UX/UI Design', 'Front-End Development'],
        badges: ['Design Expert', 'Accessibility Advocate'],
        rating: 4.8,
        availableForHire: true,
        completedProjects: 32,
        responseRate: 97.0,
        expertiseAreas: {
          design: ['UI Design', 'UX Research', 'Design Systems'],
          frontend: ['React', 'Figma', 'CSS/SASS'],
          accessibility: ['WCAG 2.1', 'Aria', 'Screen Reader Optimization']
        },
        featured: true,
        portfolioItems: [
          {
            title: 'Healthcare Portal Redesign',
            description: 'Complete UX/UI redesign of healthcare portal with a focus on accessibility.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=UX+Design',
            tags: ['UX/UI', 'Accessibility', 'Healthcare']
          }
        ],
        socialLinks: {
          github: 'https://github.com/established-builder3',
          linkedin: 'https://linkedin.com/in/established-builder3',
          website: 'https://established-builder3.dev'
        }
      }
    }
  },

  // Admin Users (3)
  {
    email: 'admin-test1@buildappswith.com',
    password: 'AdminUser123!',
    firstName: 'Admin',
    lastName: 'One',
    roles: ['ADMIN'],
    metadata: {
      verified: true,
      adminLevel: 'super',
      permissions: ['users:manage', 'content:manage', 'settings:manage']
    },
    databaseFields: {
      roles: ['ADMIN'],
      verified: true,
      isFounder: true
    }
  },
  {
    email: 'admin-test2@buildappswith.com',
    password: 'AdminUser123!',
    firstName: 'Admin',
    lastName: 'Two',
    roles: ['ADMIN'],
    metadata: {
      verified: true,
      adminLevel: 'standard',
      permissions: ['users:view', 'content:manage']
    },
    databaseFields: {
      roles: ['ADMIN'],
      verified: true,
      isFounder: false
    }
  },
  {
    email: 'admin-test3@buildappswith.com',
    password: 'AdminUser123!',
    firstName: 'Admin',
    lastName: 'Three',
    roles: ['ADMIN'],
    metadata: {
      verified: true,
      adminLevel: 'support',
      permissions: ['users:view', 'content:view', 'support:manage']
    },
    databaseFields: {
      roles: ['ADMIN'],
      verified: true,
      isFounder: false
    }
  },

  // Multi-Role (Client & Builder) Users (3)
  {
    email: 'client.builder-test1@buildappswith.com',
    password: 'MultiRole123!',
    firstName: 'Dual',
    lastName: 'Role1',
    roles: ['CLIENT', 'BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 90
    },
    databaseFields: {
      roles: ['CLIENT', 'BUILDER'],
      verified: true,
      stripeCustomerId: 'cus_test_multirole1'
    },
    profiles: {
      clientProfile: {
        companyName: 'Dual Ventures One',
        industry: 'Consulting',
        projectPreferences: {
          budgetRange: '5000-15000',
          timeframe: '1-2 months',
          preferredTechnologies: ['React', 'Node.js']
        }
      },
      builderProfile: {
        bio: 'Professional developer who also hires other builders for larger projects.',
        headline: 'Full Stack Developer & Consultant',
        hourlyRate: 100,
        validationTier: 2,
        domains: ['Web Development', 'Mobile Development'],
        badges: ['Verified Professional'],
        rating: 4.7,
        availableForHire: true,
        portfolioItems: [
          {
            title: 'Client Portal Application',
            description: 'Secure client portal for document sharing and collaboration.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=Client+Portal',
            tags: ['React', 'Node.js', 'Security']
          }
        ]
      }
    }
  },
  {
    email: 'client.builder-test2@buildappswith.com',
    password: 'MultiRole123!',
    firstName: 'Dual',
    lastName: 'Role2',
    roles: ['CLIENT', 'BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 85
    },
    databaseFields: {
      roles: ['CLIENT', 'BUILDER'],
      verified: true,
      stripeCustomerId: 'cus_test_multirole2'
    },
    profiles: {
      clientProfile: {
        companyName: 'Dual Ventures Two',
        industry: 'Marketing',
        projectPreferences: {
          budgetRange: '3000-12000',
          timeframe: '2-4 weeks',
          preferredTechnologies: ['WordPress', 'PHP']
        }
      },
      builderProfile: {
        bio: 'Marketing specialist who builds websites while also hiring developers for complex projects.',
        headline: 'WordPress Developer & Digital Marketer',
        hourlyRate: 85,
        validationTier: 2,
        domains: ['WordPress', 'Digital Marketing'],
        badges: ['Marketing Expert'],
        rating: 4.6,
        availableForHire: true,
        portfolioItems: [
          {
            title: 'E-commerce Marketing Site',
            description: 'WordPress-based marketing site with integrated analytics.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=WordPress+Marketing',
            tags: ['WordPress', 'Marketing', 'E-commerce']
          }
        ]
      }
    }
  },
  {
    email: 'client.builder-test3@buildappswith.com',
    password: 'MultiRole123!',
    firstName: 'Dual',
    lastName: 'Role3',
    roles: ['CLIENT', 'BUILDER'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 80
    },
    databaseFields: {
      roles: ['CLIENT', 'BUILDER'],
      verified: true,
      stripeCustomerId: 'cus_test_multirole3'
    },
    profiles: {
      clientProfile: {
        companyName: 'Dual Ventures Three',
        industry: 'Education',
        projectPreferences: {
          budgetRange: '4000-20000',
          timeframe: '1-3 months',
          preferredTechnologies: ['React', 'Python']
        }
      },
      builderProfile: {
        bio: 'Education technology specialist who both builds and contracts learning platforms.',
        headline: 'EdTech Developer & Consultant',
        hourlyRate: 110,
        validationTier: 2,
        domains: ['Education Technology', 'Web Development'],
        badges: ['EdTech Specialist'],
        rating: 4.5,
        availableForHire: true,
        portfolioItems: [
          {
            title: 'Interactive Learning Platform',
            description: 'Customizable learning platform for educational institutions.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=EdTech+Platform',
            tags: ['Education', 'React', 'Python']
          }
        ]
      }
    }
  },

  // Triple-Role (Client, Builder & Admin) Users (3)
  {
    email: 'client.builder.admin-test1@buildappswith.com',
    password: 'TripleRole123!',
    firstName: 'Triple',
    lastName: 'Role1',
    roles: ['CLIENT', 'BUILDER', 'ADMIN'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 100,
      adminLevel: 'super',
      permissions: ['users:manage', 'content:manage', 'settings:manage']
    },
    databaseFields: {
      roles: ['CLIENT', 'BUILDER', 'ADMIN'],
      verified: true,
      stripeCustomerId: 'cus_test_triplerole1',
      isFounder: false
    },
    profiles: {
      clientProfile: {
        companyName: 'Triple Ventures One',
        industry: 'SaaS',
        projectPreferences: {
          budgetRange: '10000-50000',
          timeframe: '2-6 months',
          preferredTechnologies: ['React', 'Node.js', 'AWS']
        }
      },
      builderProfile: {
        bio: 'Platform expert with multiple roles as developer, client, and administrator.',
        headline: 'Full Stack Platform Architect',
        hourlyRate: 175,
        validationTier: 3,
        domains: ['Full Stack Development', 'DevOps', 'System Architecture'],
        badges: ['Platform Expert', 'System Architect'],
        rating: 4.9,
        availableForHire: true,
        portfolioItems: [
          {
            title: 'Enterprise SaaS Platform',
            description: 'Scalable SaaS platform with multi-tenant architecture.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=SaaS+Platform',
            tags: ['SaaS', 'Enterprise', 'Architecture']
          }
        ]
      }
    }
  },
  {
    email: 'client.builder.admin-test2@buildappswith.com',
    password: 'TripleRole123!',
    firstName: 'Triple',
    lastName: 'Role2',
    roles: ['CLIENT', 'BUILDER', 'ADMIN'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 95,
      adminLevel: 'standard',
      permissions: ['users:view', 'content:manage']
    },
    databaseFields: {
      roles: ['CLIENT', 'BUILDER', 'ADMIN'],
      verified: true,
      stripeCustomerId: 'cus_test_triplerole2',
      isFounder: false
    },
    profiles: {
      clientProfile: {
        companyName: 'Triple Ventures Two',
        industry: 'Finance',
        projectPreferences: {
          budgetRange: '15000-60000',
          timeframe: '3-8 months',
          preferredTechnologies: ['React', 'TypeScript', 'Azure']
        }
      },
      builderProfile: {
        bio: 'Fintech specialist with experience across development, operations, and administration.',
        headline: 'Fintech Solutions Architect',
        hourlyRate: 165,
        validationTier: 3,
        domains: ['Fintech', 'Security', 'Cloud Architecture'],
        badges: ['Fintech Expert', 'Security Specialist'],
        rating: 4.8,
        availableForHire: true,
        portfolioItems: [
          {
            title: 'Financial Data Dashboard',
            description: 'Secure financial analytics platform with real-time data visualization.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=Financial+Dashboard',
            tags: ['Finance', 'Security', 'Analytics']
          }
        ]
      }
    }
  },
  {
    email: 'client.builder.admin-test3@buildappswith.com',
    password: 'TripleRole123!',
    firstName: 'Triple',
    lastName: 'Role3',
    roles: ['CLIENT', 'BUILDER', 'ADMIN'],
    metadata: {
      verified: true,
      onboardingComplete: true,
      profileCompleteness: 90,
      adminLevel: 'support',
      permissions: ['users:view', 'content:view', 'support:manage']
    },
    databaseFields: {
      roles: ['CLIENT', 'BUILDER', 'ADMIN'],
      verified: true,
      stripeCustomerId: 'cus_test_triplerole3',
      isFounder: false
    },
    profiles: {
      clientProfile: {
        companyName: 'Triple Ventures Three',
        industry: 'Healthcare',
        projectPreferences: {
          budgetRange: '8000-40000',
          timeframe: '2-5 months',
          preferredTechnologies: ['Angular', 'Java', 'GCP']
        }
      },
      builderProfile: {
        bio: 'Healthcare tech specialist with experience in development, operations, and compliance.',
        headline: 'Healthcare Solutions Developer',
        hourlyRate: 140,
        validationTier: 2,
        domains: ['Healthcare Technology', 'Compliance', 'Web Development'],
        badges: ['Healthcare Expert', 'HIPAA Compliant'],
        rating: 4.7,
        availableForHire: true,
        portfolioItems: [
          {
            title: 'Patient Portal System',
            description: 'HIPAA-compliant patient portal with secure messaging and record access.',
            imageUrl: 'https://placehold.co/600x400/5271ff/white?text=Healthcare+Portal',
            tags: ['Healthcare', 'Security', 'Compliance']
          }
        ]
      }
    }
  }
];

/**
 * Create test users in Clerk
 * @param {Array} users - Test user definitions
 * @returns {Promise<Array>} - Created Clerk users
 */
async function createClerkUsers(users) {
  console.log('Creating users in Clerk...');
  const createdUsers = [];

  // For now, we'll skip Clerk API operations and just process database records
  // This is a temporary workaround until we can update to the newer Clerk SDK

  console.log('Note: Skipping Clerk user creation due to API changes.');
  console.log('Will create only database records for test users.');

  // Return the users with dummy clerk IDs for database creation
  for (const user of users) {
    createdUsers.push({
      ...user,
      clerkId: `test_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`
    });
  }

  return createdUsers;

  /* Previous implementation - temporarily commented out until Clerk SDK is updated
  for (const user of users) {
    try {
      // Check if user already exists
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [user.email],
      });

      let clerkUser;

      if (existingUsers.length > 0) {
        console.log(`User with email ${user.email} already exists in Clerk. Updating...`);
        clerkUser = existingUsers[0];

        // Update user metadata
        await clerk.users.updateUser(clerkUser.id, {
          firstName: user.firstName,
          lastName: user.lastName,
          publicMetadata: {
            roles: user.roles,
            ...user.metadata
          }
        });
      } else {
        // Create new user
        clerkUser = await clerk.users.createUser({
          emailAddress: [user.email],
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          publicMetadata: {
            roles: user.roles,
            ...user.metadata
          }
        });
        console.log(`Created user ${user.firstName} ${user.lastName} in Clerk`);
      }

      // Verify email (for test users)
      try {
        const emailId = clerkUser.emailAddresses[0].id;
        await clerk.emailAddresses.verifyEmailAddress(emailId);
        console.log(`Verified email for ${user.email}`);
      } catch (verifyError) {
        console.warn(`Could not verify email for ${user.email}:`, verifyError.message);
      }

      createdUsers.push({
        ...user,
        clerkId: clerkUser.id
      });
    } catch (error) {
      console.error(`Error creating user ${user.email} in Clerk:`, error);
    }
  }

  return createdUsers;
  */
}

/**
 * Create database records for test users
 * @param {Array} users - Test users with clerkId
 * @returns {Promise<void>}
 */
async function createDatabaseUsers(users) {
  console.log('Creating users in database...');
  
  for (const user of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { clerkId: user.clerkId }
          ]
        }
      });
      
      let dbUser;
      
      if (existingUser) {
        console.log(`User with email ${user.email} already exists in database. Updating...`);
        dbUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            clerkId: user.clerkId,
            emailVerified: new Date(),
            imageUrl: user.imageUrl || null,
            roles: user.databaseFields.roles,
            verified: user.databaseFields.verified,
            stripeCustomerId: user.databaseFields.stripeCustomerId,
            isFounder: user.databaseFields.isFounder || false
          }
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            clerkId: user.clerkId,
            emailVerified: new Date(),
            imageUrl: user.imageUrl || null,
            roles: user.databaseFields.roles,
            verified: user.databaseFields.verified,
            stripeCustomerId: user.databaseFields.stripeCustomerId,
            isFounder: user.databaseFields.isFounder || false
          }
        });
        console.log(`Created user ${user.firstName} ${user.lastName} in database`);
      }
      
      // Create profiles if needed
      if (user.profiles) {
        // Client profile
        if (user.profiles.clientProfile && user.databaseFields.roles.includes('CLIENT')) {
          const clientProfile = user.profiles.clientProfile;
          await createOrUpdateClientProfile(dbUser.id, clientProfile);
        }
        
        // Builder profile
        if (user.profiles.builderProfile && user.databaseFields.roles.includes('BUILDER')) {
          const builderProfile = user.profiles.builderProfile;
          await createOrUpdateBuilderProfile(dbUser.id, builderProfile, user.clerkId);
        }
      }
    } catch (error) {
      console.error(`Error creating user ${user.email} in database:`, error);
    }
  }
}

/**
 * Create or update client profile
 * @param {string} userId - Database user ID
 * @param {Object} profileData - Client profile data
 * @returns {Promise<Object>} - Created/updated profile
 */
async function createOrUpdateClientProfile(userId, profileData) {
  try {
    // Check if profile already exists
    const existingProfile = await prisma.clientProfile.findFirst({
      where: { userId }
    });
    
    if (existingProfile) {
      console.log(`Updating client profile for user ${userId}`);
      return await prisma.clientProfile.update({
        where: { id: existingProfile.id },
        data: {
          companyName: profileData.companyName,
          industry: profileData.industry,
          projectPreferences: profileData.projectPreferences
        }
      });
    } else {
      console.log(`Creating client profile for user ${userId}`);
      return await prisma.clientProfile.create({
        data: {
          userId,
          companyName: profileData.companyName,
          industry: profileData.industry,
          projectPreferences: profileData.projectPreferences
        }
      });
    }
  } catch (error) {
    console.error(`Error creating client profile for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Create or update builder profile
 * @param {string} userId - Database user ID
 * @param {Object} profileData - Builder profile data
 * @param {string} clerkUserId - Clerk user ID
 * @returns {Promise<Object>} - Created/updated profile
 */
async function createOrUpdateBuilderProfile(userId, profileData, clerkUserId) {
  try {
    // Check if profile already exists
    const existingProfile = await prisma.builderProfile.findFirst({
      where: { userId }
    });
    
    const profileCreateData = {
      userId,
      bio: profileData.bio,
      headline: profileData.headline,
      hourlyRate: profileData.hourlyRate,
      validationTier: profileData.validationTier,
      domains: profileData.domains || [],
      badges: profileData.badges || [],
      rating: profileData.rating,
      availableForHire: profileData.availableForHire,
      completedProjects: profileData.completedProjects || 0,
      responseRate: profileData.responseRate,
      expertiseAreas: profileData.expertiseAreas,
      featured: profileData.featured || false,
      portfolioItems: profileData.portfolioItems || [],
      socialLinks: profileData.socialLinks,
      clerkUserId
    };
    
    if (existingProfile) {
      console.log(`Updating builder profile for user ${userId}`);
      const profile = await prisma.builderProfile.update({
        where: { id: existingProfile.id },
        data: profileCreateData
      });
      
      // Create session types if available
      if (profileData.sessionTypes && profileData.sessionTypes.length > 0) {
        await createSessionTypesForBuilder(profile.id, profileData.sessionTypes);
      }
      
      return profile;
    } else {
      console.log(`Creating builder profile for user ${userId}`);
      const profile = await prisma.builderProfile.create({
        data: profileCreateData
      });
      
      // Create session types if available
      if (profileData.sessionTypes && profileData.sessionTypes.length > 0) {
        await createSessionTypesForBuilder(profile.id, profileData.sessionTypes);
      }
      
      return profile;
    }
  } catch (error) {
    console.error(`Error creating builder profile for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Create session types for a builder
 * @param {string} builderId - Builder profile ID
 * @param {Array} sessionTypes - Session type definitions
 * @returns {Promise<Array>} - Created session types
 */
async function createSessionTypesForBuilder(builderId, sessionTypes) {
  const createdTypes = [];
  
  for (const sessionType of sessionTypes) {
    try {
      // Check if session type already exists
      const existingType = await prisma.sessionType.findFirst({
        where: {
          builderId,
          title: sessionType.title
        }
      });
      
      if (existingType) {
        console.log(`Updating session type ${sessionType.title} for builder ${builderId}`);
        const updated = await prisma.sessionType.update({
          where: { id: existingType.id },
          data: {
            title: sessionType.title,
            description: sessionType.description,
            durationMinutes: sessionType.durationMinutes,
            price: sessionType.price,
            currency: sessionType.currency,
            isActive: sessionType.isActive
          }
        });
        createdTypes.push(updated);
      } else {
        console.log(`Creating session type ${sessionType.title} for builder ${builderId}`);
        const created = await prisma.sessionType.create({
          data: {
            builderId,
            title: sessionType.title,
            description: sessionType.description,
            durationMinutes: sessionType.durationMinutes,
            price: sessionType.price,
            currency: sessionType.currency,
            isActive: sessionType.isActive
          }
        });
        createdTypes.push(created);
      }
    } catch (error) {
      console.error(`Error creating session type ${sessionType.title}:`, error);
    }
  }
  
  return createdTypes;
}

/**
 * Main function to provision test users
 */
async function provisionTestUsers() {
  try {
    console.log('Starting test user provisioning...');
    
    // Step 1: Create users in Clerk
    const usersWithClerkIds = await createClerkUsers(TEST_USERS);
    
    // Step 2: Create corresponding records in database
    await createDatabaseUsers(usersWithClerkIds);
    
    console.log('Test user provisioning completed successfully!');
  } catch (error) {
    console.error('Error during test user provisioning:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Command line options
const args = process.argv.slice(2);
const options = {
  reset: args.includes('--reset'),
  verify: args.includes('--verify')
};

// Execute based on options
if (options.verify) {
  // TODO: Implement verification mode
  console.log('Verification mode not yet implemented');
  process.exit(0);
} else {
  provisionTestUsers()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}