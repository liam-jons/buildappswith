// Server Component - no "use client" directive needed
import { Suspense } from "react";

// Internal utilities
import { cn } from "@/lib/utils";
import { getClientProfileData } from "@/lib/profile/actions";

// Internal components using barrel exports
import { ProfileStats } from "@/components/profile/ui";
import { Card, CardContent, CardHeader, CardTitle, Avatar, Skeleton } from "@/components/ui";
import { BookingHistoryList } from "@/components/scheduling";

// Types and interfaces
interface ClientProfileProps {
  userId: string;
  className?: string;
}

/**
 * ClientProfile - Displays a client's profile with booking history and stats
 * 
 * This server component fetches and renders a client's profile information,
 * including their personal details, booking history, and usage statistics.
 * 
 * @param userId - The ID of the client whose profile to display
 * @param className - Optional additional CSS classes
 */
export async function ClientProfile({ userId, className }: ClientProfileProps) {
  // Server-side data fetching
  const clientData = await getClientProfileData(userId);
  
  // Error handling
  if (!clientData) {
    return (
      <div className="p-6 bg-destructive/10 rounded-lg border border-destructive">
        <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
        <p>Unable to load client profile. The user may not exist or you may not have permission to view this profile.</p>
      </div>
    );
  }
  
  // Client stats for ProfileStats component
  const clientStats = [
    {
      label: "Total Bookings",
      value: clientData.bookingCount,
      change: clientData.bookingChange,
    },
    {
      label: "Hours Scheduled",
      value: clientData.scheduledHours,
      change: clientData.scheduledHoursChange,
    },
    {
      label: "Builders Connected",
      value: clientData.builderConnections,
    },
    {
      label: "Projects Completed",
      value: clientData.completedProjects,
      change: clientData.projectsChange,
    },
  ];
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Avatar 
          src={clientData.avatarUrl} 
          alt={clientData.name}
          className="w-16 h-16 md:w-20 md:h-20"
        />
        <div>
          <h1 className="text-2xl font-bold">{clientData.name}</h1>
          <p className="text-muted-foreground">{clientData.email}</p>
          <p className="text-sm">Member since {clientData.memberSince}</p>
        </div>
      </div>
      
      {/* Profile Stats */}
      <Suspense fallback={<ProfileStats stats={[]} isLoading={true} />}>
        <ProfileStats stats={clientStats} />
      </Suspense>
      
      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="w-full h-40" />}>
            <BookingHistoryList userId={userId} userType="client" limit={5} />
          </Suspense>
        </CardContent>
      </Card>
      
      {/* Interests and Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Interests & Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {clientData.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {clientData.interests.map((interest) => (
                  <span 
                    key={interest} 
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No interests specified</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
