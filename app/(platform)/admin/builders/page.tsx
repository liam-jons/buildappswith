"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { UserRole } from "@/lib/types/enums";
import * as Sentry from "@sentry/nextjs";

// UI Components
import { 
  Button,
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui";
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";

export default function AdminBuildersPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [builders, setBuilders] = useState<any[]>([]);
  const [isCreatingPrototype, setIsCreatingPrototype] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  // Fetch user roles from backend to check admin status
  useEffect(() => {
    if (isLoaded && userId) {
      fetch("/api/test/auth")
        .then(res => res.json())
        .then(data => {
          if (data.user?.roles) {
            setUserRoles(data.user.roles);
          }
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          Sentry.captureException(error);
        });
    }
  }, [isLoaded, userId]);
  
  // Check authentication and fetch builders
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      router.push("/login");
      return;
    }
    
    // In production, this would check for admin role
    if (process.env.NODE_ENV === 'production' && !userRoles.includes(UserRole.ADMIN)) {
      router.push("/");
      return;
    }
    
    // Fetch builders from API
    fetchBuilders();
  }, [isLoaded, userId, userRoles, router]);
  
  // Fetch all builders
  const fetchBuilders = async () => {
    try {
      const response = await fetch("/api/marketplace/builders?limit=50");
      
      if (response.ok) {
        const data = await response.json();
        setBuilders(data.data || []);
      } else {
        toast.error("Failed to fetch builders");
      }
    } catch (error) {
      console.error("Error fetching builders:", error);
      toast.error("An error occurred while fetching builders");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create prototype builder profile
  const createPrototypeBuilder = async () => {
    setIsCreatingPrototype(true);
    
    try {
      const response = await fetch("/api/admin/builders/prototype", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Prototype builder profile created");
        fetchBuilders(); // Refresh builder list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create prototype builder");
      }
    } catch (error) {
      console.error("Error creating prototype builder:", error);
      toast.error("An error occurred while creating prototype builder");
    } finally {
      setIsCreatingPrototype(false);
    }
  };
  
  if (!isLoaded || isLoading) {
    return (
      <div className="container max-w-7xl py-8">
        <h1 className="text-3xl font-bold mb-6">Builder Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Builder Management</h1>
        <Button 
          onClick={createPrototypeBuilder} 
          disabled={isCreatingPrototype}
        >
          {isCreatingPrototype ? (
            <>
              <span className="animate-spin mr-2">⋯</span>
              Creating Prototype...
            </>
          ) : (
            "Create Prototype Builder"
          )}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Builder Profiles</CardTitle>
          <CardDescription>
            Manage builder profiles and validation levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {builders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No builder profiles found</p>
              <Button onClick={createPrototypeBuilder} disabled={isCreatingPrototype}>
                Create Prototype Builder Profile
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {builders.map((builder) => (
                    <TableRow key={builder.id}>
                      <TableCell className="font-medium">{builder.name}</TableCell>
                      <TableCell>{builder.title}</TableCell>
                      <TableCell>
                        <ValidationTierBadge tier={builder.validationTier} size="sm" />
                      </TableCell>
                      <TableCell>{builder.rating.toFixed(1)}</TableCell>
                      <TableCell>{new Date(builder.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/builder-profile/${builder.id}`)}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
