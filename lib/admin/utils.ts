/**
 * Utility functions for administrative tasks
 */

import { VerificationStatus, BuilderVerification, SystemSettings, SessionType } from "./types";

/**
 * Formats builder verification data for display
 * 
 * @param verification The verification record to format
 * @returns Formatted verification data for display
 */
export function formatVerificationData(
  verification: BuilderVerification
): {
  statusColor: string;
  statusText: string;
  timeAgo: string;
  validationTierDisplay: string;
} {
  // Determine status color
  let statusColor = "";
  switch (verification.status) {
    case VerificationStatus.APPROVED:
      statusColor = "green";
      break;
    case VerificationStatus.REJECTED:
      statusColor = "red";
      break;
    case VerificationStatus.PENDING:
      statusColor = "yellow";
      break;
    case VerificationStatus.REQUIRES_ADDITIONAL_INFO:
      statusColor = "orange";
      break;
    default:
      statusColor = "gray";
  }
  
  // Format status text for display
  const statusText = verification.status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  // Calculate time ago
  const lastUpdated = new Date(verification.lastUpdated);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - lastUpdated.getTime();
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  let timeAgo = "";
  if (diffInDays > 0) {
    timeAgo = `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    timeAgo = `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else {
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    timeAgo = `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
  
  // Format validation tier
  const validationTierDisplay = verification.validationTier
    ? `Tier ${verification.validationTier}`
    : "Not Assigned";
  
  return {
    statusColor,
    statusText,
    timeAgo,
    validationTierDisplay,
  };
}

/**
 * Calculates approval metrics based on verification data
 * 
 * @param verifications Array of verification records
 * @returns Approval metrics
 */
export function calculateApprovalMetrics(
  verifications: BuilderVerification[]
): {
  approvalRate: number;
  avgApprovalTime: number;
  pendingCount: number;
  byStatus: Record<VerificationStatus, number>;
} {
  const result = {
    approvalRate: 0,
    avgApprovalTime: 0,
    pendingCount: 0,
    byStatus: {
      [VerificationStatus.PENDING]: 0,
      [VerificationStatus.APPROVED]: 0,
      [VerificationStatus.REJECTED]: 0,
      [VerificationStatus.REQUIRES_ADDITIONAL_INFO]: 0,
    },
  };
  
  if (!verifications.length) {
    return result;
  }
  
  // Count by status
  verifications.forEach((v) => {
    result.byStatus[v.status]++;
    if (v.status === VerificationStatus.PENDING) {
      result.pendingCount++;
    }
  });
  
  // Calculate approval rate
  const decided = result.byStatus[VerificationStatus.APPROVED] + 
                  result.byStatus[VerificationStatus.REJECTED];
  
  if (decided > 0) {
    result.approvalRate = (result.byStatus[VerificationStatus.APPROVED] / decided) * 100;
  }
  
  // Calculate average approval time
  const approvedVerifications = verifications.filter(
    (v) => v.status === VerificationStatus.APPROVED && v.submissionDate && v.approvedAt
  );
  
  if (approvedVerifications.length > 0) {
    let totalHours = 0;
    
    approvedVerifications.forEach((v) => {
      const submissionDate = new Date(v.submissionDate);
      const approvalDate = new Date(v.approvedAt!);
      const diffInMilliseconds = approvalDate.getTime() - submissionDate.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
      totalHours += diffInHours;
    });
    
    result.avgApprovalTime = totalHours / approvedVerifications.length;
  }
  
  return result;
}

/**
 * Performs advanced validation on session type configuration
 * 
 * @param sessionType Session type to validate
 * @param systemSettings System settings for context
 * @returns Validation result with warnings
 */
export function validateSessionTypeConfig(
  sessionType: SessionType,
  systemSettings: SystemSettings
): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check duration against system limits
  if (sessionType.duration > systemSettings.maximumSessionDuration) {
    warnings.push(
      `Session duration (${sessionType.duration} min) exceeds the maximum allowed (${systemSettings.maximumSessionDuration} min)`
    );
  }
  
  // Check for very short sessions
  if (sessionType.duration < 15) {
    warnings.push("Session duration is very short (less than 15 minutes)");
  }
  
  // Check for free sessions
  if (sessionType.price === 0) {
    warnings.push("This is a free session type. Ensure this is intentional.");
  }
  
  // Check for very expensive sessions
  if (sessionType.price > 500) {
    warnings.push("This session has a high price. Ensure this is intentional.");
  }
  
  // Check validation tier requirements
  if (
    sessionType.requiredValidationTier &&
    sessionType.requiredValidationTier > systemSettings.defaultValidationTier
  ) {
    warnings.push(
      `This session requires a higher validation tier (${sessionType.requiredValidationTier}) than the default (${systemSettings.defaultValidationTier})`
    );
  }
  
  // Check currency
  if (sessionType.currency !== systemSettings.defaultCurrency) {
    warnings.push(
      `This session uses a different currency (${sessionType.currency}) than the platform default (${systemSettings.defaultCurrency})`
    );
  }
  
  return {
    isValid: true, // We always return valid but with warnings
    warnings,
  };
}

/**
 * Generates an administrative report based on the provided data
 * 
 * @param data The data to include in the report
 * @param options Report generation options
 * @returns Formatted report content
 */
export function generateAdminReport(
  data: any,
  options: {
    format: "json" | "csv" | "html";
    includeHeaders?: boolean;
    title?: string;
  }
): string {
  const { format, includeHeaders = true, title = "Administrative Report" } = options;
  
  switch (format) {
    case "json":
      return JSON.stringify(
        {
          title,
          generated: new Date().toISOString(),
          data,
        },
        null,
        2
      );
      
    case "csv":
      // This is a simplified CSV implementation - real implementation would be more robust
      if (!Array.isArray(data)) {
        return "Error: Data must be an array for CSV format";
      }
      
      const headers = includeHeaders ? Object.keys(data[0]).join(",") + "\n" : "";
      const rows = data.map((item) => Object.values(item).join(",")).join("\n");
      
      return headers + rows;
      
    case "html":
      // Simple HTML table format
      let html = `<h2>${title}</h2>`;
      html += `<p>Generated: ${new Date().toLocaleString()}</p>`;
      
      if (Array.isArray(data)) {
        html += "<table border='1'>";
        
        // Table headers
        if (includeHeaders && data.length > 0) {
          html += "<thead><tr>";
          Object.keys(data[0]).forEach((key) => {
            html += `<th>${key}</th>`;
          });
          html += "</tr></thead>";
        }
        
        // Table body
        html += "<tbody>";
        data.forEach((row) => {
          html += "<tr>";
          Object.values(row).forEach((value) => {
            html += `<td>${value}</td>`;
          });
          html += "</tr>";
        });
        html += "</tbody></table>";
      } else {
        html += "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
      }
      
      return html;
      
    default:
      return "Unsupported format";
  }
}

/**
 * Formats system settings for display
 * 
 * @param settings The system settings to format
 * @returns Categorized settings for UI display
 */
export function formatSystemSettings(
  settings: SystemSettings
): Record<string, { label: string; value: any; type: string }> {
  return {
    platformName: {
      label: "Platform Name",
      value: settings.platformName,
      type: "text",
    },
    platformDescription: {
      label: "Platform Description",
      value: settings.platformDescription || "",
      type: "textarea",
    },
    contactEmail: {
      label: "Contact Email",
      value: settings.contactEmail,
      type: "email",
    },
    supportEmail: {
      label: "Support Email",
      value: settings.supportEmail,
      type: "email",
    },
    enablePublicMarketplace: {
      label: "Enable Public Marketplace",
      value: settings.enablePublicMarketplace,
      type: "boolean",
    },
    enableCommunityFeatures: {
      label: "Enable Community Features",
      value: settings.enableCommunityFeatures,
      type: "boolean",
    },
    enableLearningFeatures: {
      label: "Enable Learning Features",
      value: settings.enableLearningFeatures,
      type: "boolean",
    },
    enablePaymentProcessing: {
      label: "Enable Payment Processing",
      value: settings.enablePaymentProcessing,
      type: "boolean",
    },
    defaultCurrency: {
      label: "Default Currency",
      value: settings.defaultCurrency,
      type: "select",
    },
    defaultSessionDuration: {
      label: "Default Session Duration (minutes)",
      value: settings.defaultSessionDuration,
      type: "number",
    },
    maximumSessionDuration: {
      label: "Maximum Session Duration (minutes)",
      value: settings.maximumSessionDuration,
      type: "number",
    },
    requireBuilderVerification: {
      label: "Require Builder Verification",
      value: settings.requireBuilderVerification,
      type: "boolean",
    },
    defaultValidationTier: {
      label: "Default Validation Tier",
      value: settings.defaultValidationTier,
      type: "number",
    },
    validationTierNames: {
      label: "Validation Tier Names",
      value: settings.validationTierNames.join(","),
      type: "array",
    },
    stripePublishableKey: {
      label: "Stripe Publishable Key",
      value: settings.stripePublishableKey || "",
      type: "text",
    },
    termsOfServiceUrl: {
      label: "Terms of Service URL",
      value: settings.termsOfServiceUrl || "",
      type: "url",
    },
    privacyPolicyUrl: {
      label: "Privacy Policy URL",
      value: settings.privacyPolicyUrl || "",
      type: "url",
    },
    maxFileSizeUpload: {
      label: "Maximum File Upload Size (MB)",
      value: settings.maxFileSizeUpload,
      type: "number",
    },
    maxSessionsPerBuilder: {
      label: "Maximum Sessions Per Builder",
      value: settings.maxSessionsPerBuilder,
      type: "number",
    },
    maxConcurrentBookings: {
      label: "Maximum Concurrent Bookings",
      value: settings.maxConcurrentBookings,
      type: "number",
    },
  };
}
