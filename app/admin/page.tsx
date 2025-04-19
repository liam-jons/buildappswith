"use client";

import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Builder Profile Management</CardTitle>
          <CardDescription>
            Update your builder profile and manage your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            As an admin, you can update your builder profile, manage your service offerings,
            and track booking requests from clients.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/builder-profile" passHref>
            <Button>Manage Builder Profile</Button>
          </Link>
        </CardFooter>
      </Card>

      {/* For now, we'll just have a placeholder for the site settings */}
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>
            Manage platform settings (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature will be available in a future update. For now, focus on managing
            your builder profile to ensure clients can book sessions with you.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled>
            Manage Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
