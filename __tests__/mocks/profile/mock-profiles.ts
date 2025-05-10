// Mock data for user profiles
export const mockProfiles = [
  {
    id: 'profile-1',
    userId: 'builder-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'BUILDER',
    bio: 'Full-stack developer with 8 years of experience building modern web applications.',
    expertise: ['React', 'NextJS', 'TypeScript', 'TailwindCSS'],
    hourlyRate: 125,
    availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    projects: [
      {
        id: 'project-101',
        title: 'E-commerce Platform',
        description: 'Built a full-featured e-commerce platform with payment processing',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        imageUrl: 'https://example.com/projects/ecommerce.jpg',
        link: 'https://example-ecommerce.com'
      },
      {
        id: 'project-102',
        title: 'Social Media Dashboard',
        description: 'Analytics dashboard for social media management',
        technologies: ['React', 'TypeScript', 'ChartJS', 'Firebase'],
        imageUrl: 'https://example.com/projects/dashboard.jpg',
        link: 'https://example-dashboard.com'
      }
    ],
    socialLinks: {
      github: 'https://github.com/alexjohnson',
      twitter: 'https://twitter.com/alexjohnson',
      linkedin: 'https://linkedin.com/in/alexjohnson'
    }
  },
  {
    id: 'profile-2',
    userId: 'client-123',
    name: 'Client User',
    email: 'client@example.com',
    role: 'CLIENT',
    bio: 'Startup founder looking for talented developers to bring ideas to life.',
    company: 'InnovateTech Inc.',
    industry: 'SaaS',
    projects: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/clientuser',
      twitter: 'https://twitter.com/clientuser'
    }
  }
];