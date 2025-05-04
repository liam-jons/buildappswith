// Server component for administrative settings management

// Import server-side data fetching
import { getSystemSettings } from "@/lib/admin/actions";

// Import components - using barrel exports
import { AdminCard } from "@/components/admin/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

// Types and interfaces
interface SettingsPanelProps {
  section?: string;
  className?: string;
}

/**
 * SettingsPanel component for managing system settings
 * 
 * Server component that renders administrative settings panels
 * with data fetched directly on the server.
 */
export async function SettingsPanel({ 
  section = "general", 
  className 
}: SettingsPanelProps) {
  // Server-side data fetching
  const settings = await getSystemSettings();
  
  // Error handling for data fetching
  if (!settings) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-700">Error: Could not load system settings</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Tabs defaultValue={section} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <AdminCard
              title="Platform Name"
              description="Configure the name of the platform"
              actionLabel="Update"
              status="default"
            >
              <div className="py-2">
                <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {settings.general.platformName}
                </p>
              </div>
            </AdminCard>
            
            <AdminCard
              title="Support Email"
              description="Email address for platform support"
              actionLabel="Update"
              status="default"
            >
              <div className="py-2">
                <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {settings.general.supportEmail}
                </p>
              </div>
            </AdminCard>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <AdminCard
              title="Authentication"
              description="Authentication provider settings"
              actionLabel="Configure"
              status={settings.security.status}
            >
              <div className="py-2">
                <p className="font-semibold">Current Provider:</p>
                <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {settings.security.authProvider}
                </p>
              </div>
            </AdminCard>
            
            <AdminCard
              title="API Access"
              description="Manage API access and security"
              actionLabel="Configure"
              status="default"
            >
              <div className="py-2">
                <p className="font-semibold">API Keys:</p>
                <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {settings.security.apiKeysCount} active keys
                </p>
              </div>
            </AdminCard>
          </div>
        </TabsContent>
        
        <TabsContent value="integrations">
          <p>Integration settings will be implemented in a future release.</p>
        </TabsContent>
        
        <TabsContent value="advanced">
          <p>Advanced settings will be implemented in a future release.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
