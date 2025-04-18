export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Welcome to your Client Dashboard</h2>
        <p className="text-muted-foreground">
          This is your central hub for managing your projects and builder bookings.
        </p>
      </section>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Your Projects</h3>
          <p className="text-sm text-muted-foreground mb-4">Track the status of your current projects</p>
          <div className="text-center py-8">
            <p>No active projects</p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Upcoming Sessions</h3>
          <p className="text-sm text-muted-foreground mb-4">Your scheduled sessions with builders</p>
          <div className="text-center py-8">
            <p>No upcoming sessions</p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Recommended Builders</h3>
          <p className="text-sm text-muted-foreground mb-4">Based on your project preferences</p>
          <div className="text-center py-8">
            <p>No recommendations yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
