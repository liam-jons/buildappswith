export enum ValidationTier {
  ENTRY = 'entry',
  ESTABLISHED = 'established',
  EXPERT = 'expert'
}

export type TechStack = {
  name: string;
  yearsOfExperience: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
};

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  completionDate: string; // ISO date string
};

export type Testimonial = {
  id: string;
  clientName: string;
  clientCompany?: string;
  text: string;
  rating: number; // 1-5 star rating
  date: string; // ISO date string
  projectId?: string; // Reference to a portfolio project
};

export type Availability = {
  timezone: string;
  weekdayAvailability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  preferredHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  schedulingUrl?: string; // Calendly/Cal.com URL
};

export type AchievementBadge = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  dateAwarded: string; // ISO date string
  category: 'certification' | 'community' | 'project' | 'skill';
};

export type BuilderProfile = {
  id: string;
  userId: string;
  name: string;
  email: string;
  profileImage?: string;
  headline: string;
  bio: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  validationTier: ValidationTier;
  specializationTags: string[];
  techStack: TechStack[];
  portfolioProjects: PortfolioProject[];
  testimonials: Testimonial[];
  availability: Availability;
  ratePer15MinutesUSD: number;
  freeSessionMinutes: number; // Minutes offered for free consultation
  achievementBadges: AchievementBadge[];
  skills: string[];
  
  // Validation metrics
  clientSatisfactionScore?: number; // Average rating from testimonials
  projectCompletionRate?: number; // Percentage of successful project completions
  responseTimeMinutes?: number; // Average response time to messages
  
  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type BuilderProfileUpdateInput = Partial<Omit<BuilderProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'validationTier'>>;

export type BuilderSearchFilters = {
  validationTier?: ValidationTier[];
  specializations?: string[];
  skills?: string[];
  availability?: {
    timezone?: string;
    days?: string[];
  };
  rateRange?: {
    min?: number;
    max?: number;
  };
  freeSessionsOnly?: boolean;
  keyword?: string;
  sortBy?: 'rating' | 'experience' | 'price' | 'relevance';
  sortDirection?: 'asc' | 'desc';
};
