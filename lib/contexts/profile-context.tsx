"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { BuilderProfileData, PortfolioProject } from "@/lib/profile/types";
import { toast } from "sonner";

// This would be replaced with an API client in a real application
import { mockEstablishedTierProfile } from "@/lib/mock-data/profiles";

// Define the shape of our context
interface ProfileContextType {
  // State
  profile: BuilderProfileData;
  isLoading: boolean;
  isEditing: boolean;
  
  // Profile actions
  startEditingProfile: () => void;
  cancelEditingProfile: () => void;
  updateProfile: (updatedProfile: Partial<BuilderProfileData>) => Promise<void>;
  
  // Project actions
  addProject: (project: Omit<PortfolioProject, "id" | "createdAt">) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<PortfolioProject>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

// Create the context with a default value
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Hook for components to use the profile context
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

// Provider component to wrap parts of the app that need profile state
export function ProfileProvider({ children }: { children: ReactNode }) {
  // State
  const [profile, setProfile] = useState<BuilderProfileData>(() => {
    // Initialize with proper portfolio property
    const initialProfile = {
      ...mockEstablishedTierProfile,
      portfolio: [] as PortfolioProject[]
    } as unknown as BuilderProfileData;
    return initialProfile;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Helper for simulating API requests
  const simulateApiRequest = async <T,>(
    operation: () => T, 
    successMessage?: string
  ): Promise<T> => {
    setIsLoading(true);
    try {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = operation();
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Operation failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Profile editing actions
  const startEditingProfile = useCallback(() => {
    setIsEditing(true);
  }, []);
  
  const cancelEditingProfile = useCallback(() => {
    setIsEditing(false);
  }, []);
  
  const updateProfile = useCallback(async (updatedProfile: Partial<BuilderProfileData>) => {
    await simulateApiRequest(
      () => {
        setProfile(current => ({ ...current, ...updatedProfile }));
        setIsEditing(false);
        return true;
      },
      "Profile updated successfully"
    );
  }, []);
  
  // Project management actions
  const addProject = useCallback(async (project: Omit<PortfolioProject, "id" | "createdAt">) => {
    await simulateApiRequest(
      () => {
        const newProject: PortfolioProject = {
          ...project,
          id: `project-${Date.now()}`, // In a real app, this would come from the backend
          createdAt: new Date()
        };
        
        setProfile(current => ({
          ...current,
          portfolio: [newProject, ...(current.portfolio || [])],
          completedProjects: current.completedProjects + 1
        }));
        
        return newProject;
      },
      "Project added successfully"
    );
  }, []);
  
  const updateProject = useCallback(async (projectId: string, updates: Partial<PortfolioProject>) => {
    await simulateApiRequest(
      () => {
        setProfile(current => {
          const updatedPortfolio = (current.portfolio || []).map(project => 
            project.id === projectId ? { ...project, ...updates } : project
          );
          
          return { ...current, portfolio: updatedPortfolio };
        });
        
        return true;
      },
      "Project updated successfully"
    );
  }, []);
  
  const deleteProject = useCallback(async (projectId: string) => {
    await simulateApiRequest(
      () => {
        setProfile(current => {
          const updatedPortfolio = (current.portfolio || []).filter(
            project => project.id !== projectId
          );
          
          return { 
            ...current, 
            portfolio: updatedPortfolio,
            completedProjects: Math.max(0, current.completedProjects - 1)
          };
        });
        
        return true;
      },
      "Project deleted successfully"
    );
  }, []);
  
  // Create the context value
  const value: ProfileContextType = {
    // State
    profile,
    isLoading,
    isEditing,
    
    // Profile actions
    startEditingProfile,
    cancelEditingProfile,
    updateProfile,
    
    // Project actions
    addProject,
    updateProject,
    deleteProject,
  };
  
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}