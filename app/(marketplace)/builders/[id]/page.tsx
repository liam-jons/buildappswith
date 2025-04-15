import React from 'react';
import { 
  ProfileHeader, 
  SkillsSection, 
  PortfolioSection, 
  TestimonialsSection, 
  SchedulingSection 
} from '@/components/builders/profile';
import { BuilderProfile, ValidationTier } from '@/types/builder';

// This is a mock profile for development purpose
// In production, this would be fetched from the API
const mockProfile: BuilderProfile = {
  id: 'builder_123',
  userId: 'user_123',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
  headline: 'AI Integration Specialist & Full Stack Developer',
  bio: 'Experienced developer with a passion for building AI-powered applications. I specialize in integrating AI capabilities into existing applications and building new AI-focused products from scratch. With over 7 years of experience in full stack development, I bring a comprehensive approach to every project.',
  location: 'Seattle, WA',
  website: 'https://sarahjohnson.dev',
  github: 'https://github.com/sarahjohnson',
  linkedin: 'https://linkedin.com/in/sarahjohnson',
  twitter: 'sarahjohnsondev',
  validationTier: ValidationTier.ESTABLISHED,
  specializationTags: ['AI Integration', 'Full Stack Development', 'React', 'Node.js', 'Python'],
  techStack: [
    { name: 'JavaScript', yearsOfExperience: 7, proficiencyLevel: 'expert' },
    { name: 'React', yearsOfExperience: 5, proficiencyLevel: 'expert' },
    { name: 'Node.js', yearsOfExperience: 5, proficiencyLevel: 'advanced' },
    { name: 'Python', yearsOfExperience: 4, proficiencyLevel: 'advanced' },
    { name: 'TensorFlow', yearsOfExperience: 3, proficiencyLevel: 'intermediate' },
    { name: 'AWS', yearsOfExperience: 4, proficiencyLevel: 'advanced' },
    { name: 'TypeScript', yearsOfExperience: 3, proficiencyLevel: 'advanced' },
    { name: 'Next.js', yearsOfExperience: 2, proficiencyLevel: 'advanced' },
  ],
  portfolioProjects: [
    {
      id: 'project_1',
      title: 'AI Content Generator',
      description: 'A web application that uses AI to generate blog posts, marketing copy, and social media content. Built with React, Node.js, and OpenAI GPT.',
      technologies: ['React', 'Node.js', 'Express', 'OpenAI API', 'MongoDB', 'AWS'],
      imageUrl: '/images/projects/ai-content-generator.jpg',
      projectUrl: 'https://ai-content-generator.example.com',
      githubUrl: 'https://github.com/sarahjohnson/ai-content-generator',
      featured: true,
      completionDate: '2024-10-15'
    },
    {
      id: 'project_2',
      title: 'Smart Home Assistant Dashboard',
      description: 'A dashboard for monitoring and controlling smart home devices with AI-powered automation recommendations.',
      technologies: ['React', 'TypeScript', 'Python', 'TensorFlow', 'IoT Protocols', 'AWS'],
      imageUrl: '/images/projects/smart-home-dashboard.jpg',
      projectUrl: 'https://smarthome.example.com',
      githubUrl: 'https://github.com/sarahjohnson/smart-home-dashboard',
      featured: true,
      completionDate: '2024-06-20'
    },
    {
      id: 'project_3',
      title: 'E-commerce Recommendation Engine',
      description: 'An AI-powered recommendation engine for e-commerce platforms that provides personalized product suggestions.',
      technologies: ['Python', 'Django', 'TensorFlow', 'PostgreSQL', 'Docker'],
      projectUrl: 'https://recommendation-engine.example.com',
      featured: false,
      completionDate: '2023-11-05'
    },
    {
      id: 'project_4',
      title: 'Customer Support Chatbot',
      description: 'An intelligent chatbot for customer support that can handle common queries and escalate complex issues to human agents.',
      technologies: ['Node.js', 'Express', 'MongoDB', 'NLP', 'AWS Lambda'],
      githubUrl: 'https://github.com/sarahjohnson/support-chatbot',
      featured: false,
      completionDate: '2023-08-12'
    },
  ],
  testimonials: [
    {
      id: 'testimonial_1',
      clientName: 'Michael Chen',
      clientCompany: 'TechNova Startup',
      text: 'Sarah was instrumental in helping us integrate AI capabilities into our product. Her technical expertise and problem-solving skills were exceptional. The recommendation engine she built has significantly improved our user engagement metrics.',
      rating: 5,
      date: '2024-09-10',
      projectId: 'project_3'
    },
    {
      id: 'testimonial_2',
      clientName: 'Priya Patel',
      clientCompany: 'RetailPlus',
      text: 'Working with Sarah was a pleasure. She understood our business needs and delivered a chatbot solution that has reduced our customer support response times by 60%. Highly recommended!',
      rating: 5,
      date: '2024-07-22',
      projectId: 'project_4'
    },
    {
      id: 'testimonial_3',
      clientName: 'Alex Rodriguez',
      clientCompany: 'HomeConnect',
      text: 'Sarah helped us build a complex dashboard for our smart home product line. Her attention to detail and expertise in both frontend and backend technologies made the project a success.',
      rating: 4,
      date: '2024-05-15',
      projectId: 'project_2'
    },
  ],
  availability: {
    timezone: 'America/Los_Angeles',
    weekdayAvailability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    preferredHours: {
      start: '09:00',
      end: '17:00'
    },
    schedulingUrl: 'https://calendly.com/sarahjohnson/session'
  },
  ratePer15MinutesUSD: 30,
  freeSessionMinutes: 30,
  achievementBadges: [
    {
      id: 'badge_1',
      name: 'AWS Certified Solutions Architect',
      description: 'Amazon Web Services Certified Solutions Architect - Associate Level',
      imageUrl: '/images/badges/aws-certified.png',
      dateAwarded: '2023-12-10',
      category: 'certification'
    },
    {
      id: 'badge_2',
      name: 'TensorFlow Developer Certificate',
      description: 'Google TensorFlow Developer Certificate',
      imageUrl: '/images/badges/tensorflow-cert.png',
      dateAwarded: '2023-10-05',
      category: 'certification'
    },
  ],
  skills: [
    'AI Integration', 'Machine Learning', 'API Development', 'Database Design', 
    'Frontend Development', 'Backend Development', 'Cloud Architecture', 
    'DevOps', 'UX/UI Design', 'Technical Writing'
  ],
  clientSatisfactionScore: 4.7,
  projectCompletionRate: 100,
  responseTimeMinutes: 120,
  createdAt: '2023-05-01T00:00:00Z',
  updatedAt: '2024-09-20T00:00:00Z'
};

interface BuilderProfilePageProps {
  params: {
    id: string;
  };
}

export default async function BuilderProfilePage({ params }: BuilderProfilePageProps) {
  const { id } = params;
  
  // In production, fetch the builder profile from the API
  // const profile = await fetchBuilderProfile(id);
  
  // For development, we'll use the mock profile
  const profile = mockProfile;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader profile={profile} />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">About {profile.name.split(' ')[0]}</h2>
        <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
          <p className="text-gray-300 whitespace-pre-line">{profile.bio}</p>
        </div>
      </div>
      
      <SkillsSection profile={profile} />
      <PortfolioSection profile={profile} />
      <TestimonialsSection profile={profile} />
      <SchedulingSection profile={profile} />
    </div>
  );
}
