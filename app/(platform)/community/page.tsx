import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | Buildappswith",
  description: "Connect, learn, and share with the Buildappswith community",
};

/**
 * Simplified CommunityPage
 * 
 * This is a temporary, simplified version of the community page
 * to allow builds to complete while the full implementation is in progress.
 */
export default function CommunityPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Community</h1>
          <p className="text-muted-foreground max-w-prose">
            Our community features are coming soon! We're building a space where you can connect,
            learn, and share with other members of the Buildappswith community.
          </p>
        </div>
      </div>
      
      <div className="grid gap-8 mt-10">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Our community platform is currently under development
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 font-medium">Discussions</h4>
                  <p className="text-sm text-muted-foreground">
                    Join conversations, ask questions, and share your insights with the community.
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 font-medium">Knowledge Base</h4>
                  <p className="text-sm text-muted-foreground">
                    Access and contribute to our growing collection of AI knowledge and best practices.
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 font-medium">Events</h4>
                  <p className="text-sm text-muted-foreground">
                    Participate in virtual workshops, webinars, and community meetups.
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="mb-2 font-medium">Member Spotlights</h4>
                  <p className="text-sm text-muted-foreground">
                    Discover inspiring stories and achievements from our community members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}