export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Admin Control Panel</h2>
        <p className="text-muted-foreground">
          Manage users, monitor platform activity, and configure system settings.
        </p>
      </section>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">User Management</h3>
          <p className="text-sm text-muted-foreground mb-4">Manage user accounts and permissions</p>
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span>Total Users</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Builders</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Clients</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Admins</span>
              <span className="font-medium">1</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">Platform Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">Monitor system metrics and performance</p>
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span>API Requests (24h)</span>
              <span className="font-medium">127</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Active Sessions</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>New Sign-ups (24h)</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Error Rate</span>
              <span className="font-medium">0.5%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2">System Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">Configure platform behavior and features</p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <span>Maintenance Mode</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" id="maintenance" className="sr-only" />
                <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span>Public Registration</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input type="checkbox" id="registration" className="sr-only" checked />
                <div className="block h-6 bg-primary rounded-full w-10"></div>
                <div className="dot absolute left-5 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors">
            Create User
          </button>
          <button className="bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors">
            View Logs
          </button>
          <button className="bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors">
            Manage Validation
          </button>
          <button className="bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors">
            System Backup
          </button>
        </div>
      </div>
    </div>
  );
}
