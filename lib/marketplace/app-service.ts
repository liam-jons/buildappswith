import { AppItem } from "@/components/profile/app-showcase";
import { AppStatus } from "@prisma/client";

/**
 * Fetch apps built by a specific builder
 */
export async function fetchAppsByBuilderId(builderId: string): Promise<AppItem[]> {
  try {
    const response = await fetch(`/api/apps/${builderId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch apps: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching apps for builder ${builderId}:`, error);
    throw error;
  }
}

/**
 * Create a new app for a builder
 */
export async function createApp(builderId: string, appData: {
  title: string;
  description: string;
  imageUrl?: string;
  technologies: string[];
  status: AppStatus;
  appUrl?: string;
  adhd_focused: boolean;
}): Promise<AppItem> {
  try {
    const response = await fetch(`/api/apps/${builderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create app: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error creating app for builder ${builderId}:`, error);
    throw error;
  }
}

/**
 * Update an existing app
 */
export async function updateApp(appId: string, appData: Partial<{
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  status: AppStatus;
  appUrl: string;
  adhd_focused: boolean;
}>): Promise<AppItem> {
  try {
    const response = await fetch(`/api/apps/edit/${appId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update app: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating app ${appId}:`, error);
    throw error;
  }
}

/**
 * Delete an app
 */
export async function deleteApp(appId: string): Promise<void> {
  try {
    const response = await fetch(`/api/apps/edit/${appId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete app: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting app ${appId}:`, error);
    throw error;
  }
}
