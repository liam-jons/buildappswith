"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/contexts/profile-context";
import { PortfolioGallery } from "@/components/profile/portfolio-gallery";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { AddProjectForm } from "@/components/profile/add-project-form";
import { 
  ViewGridIcon, 
  ViewHorizontalIcon,
  PersonIcon
} from "@radix-ui/react-icons";

// Import form helpers
import { 
  createProjectFromFormValues,
  formValuesToProjectUpdates,
  ProjectFormValues
} from "@/lib/utils/profile-form-helpers";

export default function PortfolioPage() {
  const router = useRouter();
  const { 
    profile, 
    addProject,
    updateProject,
    deleteProject 
  } = useProfile();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the current project being edited (if any)
  const currentProject = currentProjectId 
    ? profile.portfolio.find(p => p.id === currentProjectId) 
    : undefined;
  
  // Go back to profile
  const handleBackToProfile = () => {
    router.push("/profile");
  };
  
  // Open dialog to add a new project
  const handleAddProject = () => {
    setCurrentProjectId(null);
    setProjectDialogOpen(true);
  };
  
  // Open dialog to edit an existing project
  const handleEditProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setProjectDialogOpen(true);
  };
  
  // Handle deleting a project
  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };
  
  // Handle saving a project (new or existing)
  const handleSaveProject = async (values: ProjectFormValues) => {
    setIsLoading(true);
    
    try {
      if (currentProjectId) {
        // Update existing project
        await updateProject(currentProjectId, formValuesToProjectUpdates(values));
      } else {
        // Add new project
        await addProject(createProjectFromFormValues(values));
      }
      
      // Close the dialog
      setProjectDialogOpen(false);
      setCurrentProjectId(null);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel project editing
  const handleCancelProject = () => {
    setProjectDialogOpen(false);
    setCurrentProjectId(null);
  };
  
  return (
    <div className="container max-w-7xl py-8">
      {/* Header with view options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Showcase your work and demonstrate your impact to potential clients
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <ViewGridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <ViewHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={handleAddProject}>Add New Project</Button>
        </div>
      </div>
      
      {/* Gallery */}
      <PortfolioGallery
        projects={profile.portfolio}
        validationTier={profile.validationTier}
        gridView={viewMode === "grid"}
        onBack={handleBackToProfile}
        isOwner={true}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />
      
      {/* No projects state */}
      {profile.portfolio.length === 0 && (
        <div className="mt-12 border border-dashed rounded-lg p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
            <PersonIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-medium mb-2">Your portfolio is empty</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Showcase your expertise by adding projects you&apos;ve worked on. Include details about technologies used and measurable outcomes.
          </p>
          <Button onClick={handleAddProject}>Add Your First Project</Button>
        </div>
      )}
      
      {/* Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProjectId ? "Edit Project" : "Add New Project"}
            </DialogTitle>
            <DialogDescription>
              Showcase your work with detailed information about the project and its outcomes.
            </DialogDescription>
          </DialogHeader>
          
          <AddProjectForm 
            existingProject={currentProject}
            onSave={handleSaveProject}
            onCancel={handleCancelProject}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}