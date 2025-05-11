/**
 * Verification Detail Component
 * 
 * This component displays detailed verification information for a builder,
 * including their current tier, verification history, and next steps.
 */

import { ValidationTierBadge } from "./ui/validation-tier-badge";
import { Card } from "@/components/ui/core";
import { cn } from "@/lib/utils";

interface Verification {
  type: string;
  status: "completed" | "pending" | "failed";
  completedAt?: string;
  notes?: string;
  requiredFor?: string;
}

interface NextStep {
  action: string;
  description: string;
  url: string;
}

interface VerificationData {
  builderId: string;
  currentTier: string;
  verifications: Verification[];
  nextSteps: NextStep[];
}

interface VerificationDetailProps {
  data: VerificationData;
  builderName: string;
}

export function VerificationDetail({ data, builderName }: VerificationDetailProps) {
  const { currentTier, verifications, nextSteps } = data;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  const getVerificationTypeLabel = (type: string) => {
    switch (type) {
      case "email": return "Email Verification";
      case "id": return "Identity Verification";
      case "portfolio": return "Portfolio Review";
      case "skills": return "Skills Assessment";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200"
    };
    
    return (
      <span className={cn(
        "text-xs px-2 py-0.5 rounded-full border",
        styles[status as keyof typeof styles]
      )}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-2">{builderName} Verification</h2>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Current validation tier:</span>
          <ValidationTierBadge tier={currentTier as any} />
        </div>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold mb-4">Verification History</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-medium">Verification Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Completed On</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verifications.map((verification, index) => (
                  <tr key={index} className="bg-card">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getVerificationTypeLabel(verification.type)}
                      {verification.requiredFor && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Required for {verification.requiredFor} tier)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(verification.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(verification.completedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {verification.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
      
      {nextSteps.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => (
              <Card key={index} className="p-5">
                <h4 className="font-medium mb-2">{step.action}</h4>
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                <a 
                  href={step.url}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Complete this step →
                </a>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}