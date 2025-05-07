"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge
} from "@/components/ui";
import { Loader2 } from "lucide-react";
import { SessionTypeForm } from "@/components/admin/session-type-form";
import { SessionType } from "@/lib/scheduling/types";

export default function AdminSessionTypesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [selectedBuilder, setSelectedBuilder] = useState<string | null>(null);
  const [builders, setBuilders] = useState<any[]>([]);
  
  // Fetch session types and builders when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch builders first
        const buildersResponse = await fetch("/api/admin/builders");
        
        if (!buildersResponse.ok) {
          throw new Error("Failed to fetch builders");
        }
        
        const buildersData = await buildersResponse.json();
        setBuilders(buildersData.data || []);
        
        // Set default builder if available
        if (buildersData.data && buildersData.data.length > 0) {
          setSelectedBuilder(buildersData.data[0].id);
          
          // Fetch session types for the first builder
          await fetchSessionTypes(buildersData.data[0].id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch session types for a specific builder
  const fetchSessionTypes = async (builderId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/session-types?builderId=${builderId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch session types");
      }
      
      const data = await response.json();
      setSessionTypes(data.data || []);
    } catch (error) {
      console.error("Error fetching session types:", error);
      toast.error("Failed to load session types");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle builder change
  const handleBuilderChange = async (builderId: string) => {
    setSelectedBuilder(builderId);
    await fetchSessionTypes(builderId);
  };
  
  // Handle session type creation/update
  const handleSessionTypeSubmit = async (sessionType: Partial<SessionType>, isEditing: boolean) => {
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing 
        ? `/api/admin/session-types/${sessionType.id}` 
        : "/api/admin/session-types";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionType),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save session type");
      }
      
      toast.success(isEditing ? "Session type updated" : "Session type created");
      
      // Refresh the session types list
      if (selectedBuilder) {
        await fetchSessionTypes(selectedBuilder);
      }
    } catch (error) {
      console.error("Error saving session type:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  
  // Handle session type deletion
  const handleSessionTypeDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session type?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/session-types/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete session type");
      }
      
      toast.success("Session type deleted");
      
      // Refresh the session types list
      if (selectedBuilder) {
        await fetchSessionTypes(selectedBuilder);
      }
    } catch (error) {
      console.error("Error deleting session type:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  
  // Toggle session type active status
  const toggleSessionTypeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/session-types/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update session type status");
      }
      
      toast.success(`Session type ${currentStatus ? "deactivated" : "activated"}`);
      
      // Refresh the session types list
      if (selectedBuilder) {
        await fetchSessionTypes(selectedBuilder);
      }
    } catch (error) {
      console.error("Error updating session type status:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl py-8">
        <h1 className="text-3xl font-bold mb-6">Session Types Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Session Types Management</h1>
        
        {/* Builder selection dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Builder:</span>
          <select
            className="form-select rounded-md border-border bg-card px-3 py-2"
            value={selectedBuilder || ""}
            onChange={(e) => handleBuilderChange(e.target.value)}
          >
            {builders.map((builder) => (
              <option key={builder.id} value={builder.id}>
                {builder.name}
              </option>
            ))}
          </select>
          
          {/* Create new session type */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Session Type</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Session Type</DialogTitle>
                <DialogDescription>
                  Create a new session type for the selected builder.
                </DialogDescription>
              </DialogHeader>
              <SessionTypeForm 
                onSubmit={(data) => {
                  if (selectedBuilder) {
                    handleSessionTypeSubmit({
                      ...data,
                      builderId: selectedBuilder
                    }, false);
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Types</CardTitle>
          <CardDescription>
            Manage session types for {builders.find(b => b.id === selectedBuilder)?.name || "the selected builder"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionTypes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No session types found for this builder</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create First Session Type</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Session Type</DialogTitle>
                    <DialogDescription>
                      Create your first session type for this builder.
                    </DialogDescription>
                  </DialogHeader>
                  <SessionTypeForm 
                    onSubmit={(data) => {
                      if (selectedBuilder) {
                        handleSessionTypeSubmit({
                          ...data,
                          builderId: selectedBuilder
                        }, false);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Max Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionTypes.map((sessionType) => (
                    <TableRow key={sessionType.id}>
                      <TableCell className="font-medium">{sessionType.title}</TableCell>
                      <TableCell>{sessionType.durationMinutes} mins</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: sessionType.currency,
                        }).format(sessionType.price)}
                      </TableCell>
                      <TableCell>
                        {sessionType.maxParticipants || 'Individual'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sessionType.isActive ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSessionTypeStatus(sessionType.id, sessionType.isActive)}
                        >
                          {sessionType.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Edit</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Session Type</DialogTitle>
                                <DialogDescription>
                                  Update the selected session type.
                                </DialogDescription>
                              </DialogHeader>
                              <SessionTypeForm 
                                initialData={sessionType}
                                onSubmit={(data) => {
                                  handleSessionTypeSubmit({
                                    ...data,
                                    id: sessionType.id,
                                    builderId: sessionType.builderId
                                  }, true);
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleSessionTypeDelete(sessionType.id)}
                          >
                            Delete
                          </Button>
                        </div>
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