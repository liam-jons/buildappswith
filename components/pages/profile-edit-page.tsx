"use client";

import { useState } from "react";
import { BuilderProfile } from "@/components/profile/builder-profile";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { AddProjectForm } from "@/components/profile/add-project-form";
import { useProfile } from "@/lib/contexts/profile-context";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Import form helpers
import { 
  formValuesToProfileUpdates, 
  formValuesToProjectUpdates,
  createProjectFromFormValues,
  ProfileFormValues,
  ProjectFormValues
} from "@/lib/utils/profile-form-helpers";

// This enum helps us keep track of the project editing state
enum ProjectEditState {
  None,
  Adding,
  Editing
}

export default function ProfileEditPage() {
  const { 
    profile, 
    isEditing, 
    isLoading,
    startEditingProfile, 
    cancelEditingProfile, 
    updateProfile,
    addProject,
    updateProject,
    deleteProject 
  } = useProfile();
  
  // Project editing state
  const [projectEditState, setProjectEditState] = useState<ProjectEditState>(ProjectEditState.None);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the current project being edited (if any)
  const currentProject = currentProjectId 
    ? profile.portfolio.find(p => p.id === currentProjectId) 
    : undefined;

  // Handler for adding a new project
  const handleAddProject = () => {
    setCurrentProjectId(null);
    setProjectEditState(ProjectEditState.Adding);
    setProjectDialogOpen(true);
  };

  // Handler for editing an existing project
  const handleEditProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setProjectEditState(ProjectEditState.Editing);
    setProjectDialogOpen(true);
  };

  // Cancel project editing
  const handleCancelProjectEdit = () => {
    setProjectEditState(ProjectEditState.None);
    setCurrentProjectId(null);
    setProjectDialogOpen(false);
  };

  // Handler for saving profile updates
  const handleSaveProfile = async (formValues: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert form values to profile updates using helper function
      await updateProfile(formValuesToProfileUpdates(formValues));
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for saving a new or edited project
  const handleSaveProject = async (formValues: ProjectFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (projectEditState === ProjectEditState.Adding) {
        // Add new project using helper function
        await addProject(createProjectFromFormValues(formValues));
      } else if (currentProjectId) {
        // Update existing project using helper function
        await updateProject(currentProjectId, formValuesToProjectUpdates(formValues));
      }
      
      // Close dialog and reset state
      setProjectEditState(ProjectEditState.None);
      setCurrentProjectId(null);
      setProjectDialogOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for deleting a project
  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Your Profile</h1>
        <p className="text-muted-foreground">
          Update your profile information and portfolio to showcase your expertise to potential clients.
        </p>
      </div>
      
      {/* Placeholder image alert */}
      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Placeholder Images</AlertTitle>
        <AlertDescription>
          This demo uses placeholder image references. In a production environment, these would be replaced with actual images.
        </AlertDescription>
      </Alert>
      
      {isEditing ? (
        <div className="border rounded-lg p-6 bg-background shadow-sm">
          <EditProfileForm 
            profile={profile}
            onSave={handleSaveProfile}
            onCancel={cancelEditingProfile}
          />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <BuilderProfile
            profile={profile}
            isOwner={true}
            onEditProfile={startEditingProfile}
            onAddProject={handleAddProject}
            onViewAllProjects={() => alert("View all projects would navigate to a dedicated portfolio page")}
          />
        </div>
      )}
      
      {/* Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {projectEditState === ProjectEditState.Adding ? "Add New Project" : "Edit Project"}
            </DialogTitle>
            <DialogDescription>
              Showcase your work with detailed information about the project and its outcomes.
            </DialogDescription>
          </DialogHeader>
          
          <AddProjectForm 
            existingProject={currentProject}
            onSave={handleSaveProject}
            onCancel={handleCancelProjectEdit}
          />
        </DialogContent>
      </Dialog>
      
      {/* Portfolio Management Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold">Portfolio Management</h2>
        <p className="text-muted-foreground">
          Click on any project in your portfolio to edit it, or add a new project to showcase your work.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.portfolio.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
              <h3 className="font-medium text-lg mb-2">{project.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditProject(project.id)}
                >
                  Edit Project
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          
          <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center min-h-[180px]">
            <p className="text-muted-foreground mb-4">Showcase your work and expertise</p>
            <Button onClick={handleAddProject}>Add New Project</Button>
          </div>
        </div>
      </div>
    </div>
  );
}