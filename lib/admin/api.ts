/**
 * Client-side API functions for admin operations
 */

import { AdminClientErrorType, AdminClientResult, BuilderVerificationParams, SystemSettings } from "./types";

/**
 * Fetches administrative dashboard data
 * 
 * @returns Dashboard analytics and metrics
 */
export async function fetchAdminDashboard(): Promise<AdminClientResult<any>> {
  try {
    const response = await fetch("/api/admin/dashboard");

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch admin dashboard data",
        error: {
          type: AdminClientErrorType.RETRIEVAL,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to fetch admin dashboard data",
        error: {
          type: AdminClientErrorType.RETRIEVAL,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return {
      success: false,
      message: "Failed to fetch admin dashboard data",
      error: {
        type: AdminClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Retrieves current system settings
 * 
 * @returns System settings
 */
export async function getSystemSettings(): Promise<AdminClientResult<SystemSettings>> {
  try {
    const response = await fetch("/api/admin/settings");

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to retrieve system settings",
        error: {
          type: AdminClientErrorType.RETRIEVAL,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to retrieve system settings",
        error: {
          type: AdminClientErrorType.RETRIEVAL,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "System settings retrieved successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error retrieving system settings:", error);
    return {
      success: false,
      message: "Failed to retrieve system settings",
      error: {
        type: AdminClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Updates system settings
 * 
 * @param settings The settings to update
 * @returns Updated settings
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<AdminClientResult<SystemSettings>> {
  try {
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to update system settings",
        error: {
          type: AdminClientErrorType.UPDATE,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to update system settings",
        error: {
          type: AdminClientErrorType.UPDATE,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "System settings updated successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error updating system settings:", error);
    return {
      success: false,
      message: "Failed to update system settings",
      error: {
        type: AdminClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Retrieves pending builder verifications
 * 
 * @param options Pagination and filter options
 * @returns List of builders pending verification
 */
export async function getVerificationQueue(
  options: { limit?: number; offset?: number; status?: string } = {}
): Promise<AdminClientResult<any[]>> {
  try {
    const { limit = 10, offset = 0, status } = options;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (status) {
      queryParams.append("status", status);
    }
    
    const response = await fetch(`/api/admin/verifications?${queryParams.toString()}`);

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to retrieve verification queue",
        error: {
          type: AdminClientErrorType.RETRIEVAL,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to retrieve verification queue",
        error: {
          type: AdminClientErrorType.RETRIEVAL,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Verification queue retrieved successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error retrieving verification queue:", error);
    return {
      success: false,
      message: "Failed to retrieve verification queue",
      error: {
        type: AdminClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Updates a builder's verification status
 * 
 * @param builderId The ID of the builder to update
 * @param verificationParams Verification parameters
 * @returns Updated builder verification status
 */
export async function updateBuilderStatus(
  builderId: string,
  verificationParams: BuilderVerificationParams
): Promise<AdminClientResult<any>> {
  try {
    const response = await fetch(`/api/admin/builders/${builderId}/verification`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationParams),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to update builder verification status",
        error: {
          type: AdminClientErrorType.UPDATE,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to update builder verification status",
        error: {
          type: AdminClientErrorType.UPDATE,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Builder verification status updated successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error updating builder verification status:", error);
    return {
      success: false,
      message: "Failed to update builder verification status",
      error: {
        type: AdminClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Manages session types (create, update, delete)
 * 
 * @param method The HTTP method (POST, PUT, DELETE)
 * @param sessionTypeId Optional ID for update or delete operations
 * @param data Session type data for create or update
 * @returns Result of the operation
 */
export async function manageSessionType(
  method: "POST" | "PUT" | "DELETE",
  sessionTypeId?: string,
  data?: any
): Promise<AdminClientResult<any>> {
  try {
    const url = sessionTypeId
      ? `/api/admin/session-types/${sessionTypeId}`
      : "/api/admin/session-types";
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to manage session type",
        error: {
          type: AdminClientErrorType.OPERATION,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const responseData = await response.json();

    if (!responseData.success) {
      return {
        success: false,
        message: responseData.message || "Failed to manage session type",
        error: {
          type: AdminClientErrorType.OPERATION,
          detail: responseData.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "Session type operation completed successfully",
      data: responseData.data,
    };
  } catch (error) {
    console.error("Error managing session type:", error);
    return {
      success: false,
      message: "Failed to manage session type",
      error: {
        type: AdminClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Manages user roles (assign, remove)
 * 
 * @param userId The ID of the user
 * @param role The role to assign or remove
 * @param action Whether to add or remove the role
 * @returns Result of the operation
 */
export async function manageUserRole(
  userId: string,
  role: string,
  action: "add" | "remove"
): Promise<AdminClientResult<any>> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/roles`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
        action,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to manage user role",
        error: {
          type: AdminClientErrorType.UPDATE,
          detail: `Server responded with ${response.status}`,
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to manage user role",
        error: {
          type: AdminClientErrorType.UPDATE,
          detail: data.error?.detail || "Unknown error",
        },
      };
    }

    return {
      success: true,
      message: "User role updated successfully",
      data: data.data,
    };
  } catch (error) {
    console.error("Error managing user role:", error);
    return {
      success: false,
      message: "Failed to manage user role",
      error: {
        type: AdminClientErrorType.NETWORK,
        detail: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
