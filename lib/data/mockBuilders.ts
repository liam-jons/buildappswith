import { Builder } from '../types/builder';

/**
 * Mock data for testing the Builder Profile component
 */
export const mockBuilders: Builder[] = [
  {
    id: '1',
    username: 'aisha_dev',
    name: 'Aisha Khan',
    bio: 'Experienced AI app developer with a focus on business solutions. I help small businesses leverage AI to improve operations and customer experiences.',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop',
    validationTier: 'Expert',
    metrics: {
      successRate: 97,
      onTimeDelivery: 94,
      clientSatisfaction: 4.9,
      businessImpact: 89,
      entrepreneursCreated: 3
    },
    skills: [
      { id: 's1', name: 'React', category: 'Frontend', proficiencyLevel: 5, verified: true },
      { id: 's2', name: 'Node.js', category: 'Backend', proficiencyLevel: 5, verified: true },
      { id: 's3', name: 'AI Integration', category: 'AI', proficiencyLevel: 5, verified: true },
      { id: 's4', name: 'UI/UX Design', category: 'Design', proficiencyLevel: 4, verified: true },
      { id: 's5', name: 'Next.js', category: 'Frontend', proficiencyLevel: 5, verified: true },
      { id: 's6', name: 'Python', category: 'Backend', proficiencyLevel: 4, verified: true },
      { id: 's7', name: 'LLM Fine-tuning', category: 'AI', proficiencyLevel: 4, verified: true }
    ],
    portfolio: [
      {
        id: 'p1',
        title: 'AI-Powered Inventory Forecasting',
        client: 'GreenGrocer Market',
        description: 'Developed an AI system to predict inventory needs based on seasonal trends and customer behavior.',
        challenge: 'GreenGrocer Market was struggling with inventory management, leading to wastage and stock shortages. They needed a way to predict demand more accurately.',
        solution: 'Built a custom ML model that analyzes historical sales data, seasonal trends, and local events to forecast demand. Integrated with their existing POS system.',
        outcomes: [
          { type: 'Waste Reduction', value: '32%', verified: true },
          { type: 'Revenue Increase', value: '18%', verified: true },
          { type: 'Staff Hours Saved', value: '15 hrs/week', verified: true }
        ],
        technologies: ['Python', 'TensorFlow', 'React', 'Node.js'],
        images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop'],
        date: '2024-02-15'
      },
      {
        id: 'p2',
        title: 'Customer Service AI Assistant',
        client: 'ComfortHome Furniture',
        description: 'Created an AI chatbot to handle customer inquiries and support, integrated with their website and CRM.',
        challenge: 'ComfortHome was experiencing long wait times for customer support, leading to lost sales and customer frustration.',
        solution: 'Developed a context-aware chatbot that can handle common questions, schedule appointments, and provide product recommendations.',
        outcomes: [
          { type: 'Response Time', value: 'Reduced from 4 hrs to 2 min', verified: true },
          { type: 'Support Staff Efficiency', value: '+40%', verified: true },
          { type: 'Customer Satisfaction', value: '+28%', verified: true }
        ],
        technologies: ['OpenAI', 'Next.js', 'Tailwind CSS', 'MongoDB'],
        images: ['https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2570&auto=format&fit=crop'],
        date: '2024-04-01'
      },
      {
        id: 'p3',
        title: 'AI Content Creation Platform',
        client: 'StartUp Studio',
        description: 'Built a platform that helps startups generate marketing content, blog posts, and social media updates using AI.',
        challenge: 'StartUp Studio needed a way to help their clients create consistent marketing content without hiring full-time content creators.',
        solution: 'Created a platform with customizable AI models that learn each client's brand voice and generate content that maintains their unique style.',
        outcomes: [
          { type: 'Content Creation Time', value: 'Reduced by 75%', verified: true },
          { type: 'New Business', value: '5 new startup clients', verified: true },
          { type: 'Cost Savings', value: '$4,000/month per client', verified: false }
        ],
        technologies: ['LangChain', 'React', 'Firebase', 'GPT-4'],
        images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2570&auto=format&fit=crop'],
        date: '2023-11-10'
      }
    ],
    testimonials: [
      {
        id: 't1',
        clientName: 'Maya Rodriguez',
        position: 'Owner',
        company: 'GreenGrocer Market',
        content: 'Aisha's inventory forecasting system has completely transformed our business. We've reduced waste significantly while ensuring we never run out of popular items. The ROI was evident within the first month!',
        rating: 5,
        projectId: 'p1',
        date: '2024-03-01'
      },
      {
        id: 't2',
        clientName: 'James Chen',
        position: 'Customer Service Director',
        company: 'ComfortHome Furniture',
        content: 'Our AI assistant has become an invaluable team member. Customers love the instant responses, and our support team can now focus on complex issues. Aisha understood our needs perfectly and delivered beyond expectations.',
        rating: 5,
        projectId: 'p2',
        date: '2024-04-15'
      },
      {
        id: 't3',
        clientName: 'Sophia Williams',
        position: 'CEO',
        company: 'StartUp Studio',
        content: 'The content platform Aisha built has become our secret weapon. Our clients are amazed by the quality and consistency of the AI-generated content. This has become a major selling point for our agency.',
        rating: 4,
        projectId: 'p3',
        date: '2023-12-20'
      }
    ],
    createdAt: '2022-06-15T10:00:00Z',
    updatedAt: '2024-04-10T14:30:00Z'
  },
  {
    id: '2',
    username: 'dev_miguel',
    name: 'Miguel Hernandez',
    bio: 'Former marketing professional turned AI developer. Specializing in AI content tools and marketing automation solutions.',
    profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2574&auto=format&fit=crop',
    validationTier: 'Established',
    metrics: {
      successRate: 88,
      onTimeDelivery: 90,
      clientSatisfaction: 4.5,
      businessImpact: 75,
      entrepreneursCreated: 1
    },
    skills: [
      { id: 's1', name: 'React', category: 'Frontend', proficiencyLevel: 4, verified: true },
      { id: 's2', name: 'Content Generation', category: 'AI', proficiencyLevel: 5, verified: true },
      { id: 's3', name: 'Marketing Automation', category: 'Marketing', proficiencyLevel: 5, verified: true },
      { id: 's4', name: 'Express.js', category: 'Backend', proficiencyLevel: 3, verified: true },
      { id: 's5', name: 'Analytics', category: 'Data', proficiencyLevel: 4, verified: false }
    ],
    portfolio: [
      {
        id: 'p1',
        title: 'AI Newsletter Generator',
        client: 'Fitness First Gym',
        description: 'Created an automated system to generate personalized newsletters for gym members based on their fitness goals and activity.',
        challenge: 'Fitness First was struggling to keep members engaged, with a high dropout rate after the first 3 months.',
        solution: 'Developed an AI system that tracks member activity and generates personalized content, workout suggestions, and nutrition tips.',
        outcomes: [
          { type: 'Member Retention', value: '+25%', verified: true },
          { type: 'Newsletter Open Rate', value: '48% (from 12%)', verified: true },
          { type: 'New Membership Referrals', value: '+18%', verified: false }
        ],
        technologies: ['OpenAI', 'React', 'Node.js', 'SendGrid'],
        images: ['https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?q=80&w=2574&auto=format&fit=crop'],
        date: '2023-09-20'
      },
      {
        id: 'p2',
        title: 'Social Media Content Calendar',
        client: 'Artisan Bakery',
        description: 'Built an AI tool that generates a month of social media content based on upcoming bakery specials and seasonal trends.',
        challenge: 'Artisan Bakery had no consistent social media presence due to lack of time and creative resources.',
        solution: 'Created a tool that generates content ideas, captions, and hashtag suggestions based on their menu and seasonal events.',
        outcomes: [
          { type: 'Instagram Followers', value: '+200% in 6 months', verified: true },
          { type: 'Weekly Store Visits', value: '+15%', verified: true },
          { type: 'Time Saved', value: '10 hrs/week', verified: false }
        ],
        technologies: ['GPT-4', 'React', 'Firebase', 'Instagram API'],
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2572&auto=format&fit=crop'],
        date: '2024-01-15'
      }
    ],
    testimonials: [
      {
        id: 't1',
        clientName: 'Tyler Johnson',
        position: 'Operations Manager',
        company: 'Fitness First Gym',
        content: 'Miguel's newsletter system has completely transformed our member engagement. We're seeing members stay longer and participate in more classes. The personalized content makes them feel valued.',
        rating: 5,
        projectId: 'p1',
        date: '2023-11-05'
      },
      {
        id: 't2',
        clientName: 'Emma Liu',
        position: 'Owner',
        company: 'Artisan Bakery',
        content: 'As a small business owner, I never had time for social media. Miguel's solution has given us a professional online presence without the work. Our weekend lines are now out the door!',
        rating: 4,
        projectId: 'p2',
        date: '2024-02-28'
      }
    ],
    createdAt: '2023-02-10T08:15:00Z',
    updatedAt: '2024-03-20T11:45:00Z'
  }
];

/**
 * Function to get a mock builder by ID
 */
export const getMockBuilderById = (id: string): Builder | undefined => {
  return mockBuilders.find(builder => builder.id === id);
};

/**
 * Function to get a mock builder by username
 */
export const getMockBuilderByUsername = (username: string): Builder | undefined => {
  return mockBuilders.find(builder => builder.username === username);
};
