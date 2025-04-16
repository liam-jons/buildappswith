/**
 * Builder profile types for Buildappswith platform
 */

export type ValidationTier = 'Entry' | 'Established' | 'Expert';

export interface BuilderMetrics {
  successRate: number; // Percentage of successful projects (0-100)
  onTimeDelivery: number; // Percentage of on-time deliveries (0-100)
  clientSatisfaction: number; // Average rating on a scale of 1-5
  businessImpact: number; // Calculated score based on client business improvements
  entrepreneursCreated: number; // Count of new businesses launched through builder's applications
}

export interface Skill {
  id: string;
  name: string;
  category: string; // e.g., "Frontend", "AI", "Backend", etc.
  proficiencyLevel: number; // 1-5 scale
  verified: boolean; // Whether the skill has been verified by the platform
}

export interface ProjectOutcome {
  type: string; // e.g., "Revenue Increase", "Cost Reduction", "User Acquisition"
  value: string; // e.g., "+23%", "$50,000 annual savings"
  verified: boolean; // Whether the outcome has been verified by the platform
}

export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  challenge: string;
  solution: string;
  outcomes: ProjectOutcome[];
  technologies: string[];
  images: string[];
  date: string; // ISO date string
}

export interface Testimonial {
  id: string;
  clientName: string;
  position: string;
  company: string;
  content: string;
  rating: number; // 1-5 scale
  projectId?: string; // Optional reference to specific project
  date: string; // ISO date string
}

export interface Builder {
  id: string;
  username: string;
  name: string;
  bio: string;
  profileImage: string;
  validationTier: ValidationTier;
  metrics: BuilderMetrics;
  skills: Skill[];
  portfolio: Project[];
  testimonials: Testimonial[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
