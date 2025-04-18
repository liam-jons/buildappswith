import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Builder Dashboard",
  description: "Manage your builder profile, bookings, and availability",
};

export default function BuilderDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Welcome to your Builder Dashboard</h2>
        <p className="text-muted-foreground">
          This is your central hub for managing your builder profile, availability, and client bookings.
        </p>
      </section>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Upcoming Bookings</h3>
          <p className="text-sm text-muted-foreground mb-4">Your scheduled sessions with clients</p>
          <div className="text-center py-8">
            <p>No upcoming bookings</p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Profile Completeness</h3>
          <p className="text-sm text-muted-foreground mb-4">Enhance your visibility to potential clients</p>
          <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
            <div className="bg-primary h-2.5 rounded-full w-3/4"></div>
          </div>
          <p className="text-sm">75% complete</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">Latest updates and notifications</p>
          <div className="text-center py-8">
            <p>No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
