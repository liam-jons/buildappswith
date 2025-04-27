"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/lib/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  role: z.enum([UserRole.CLIENT, UserRole.BUILDER, UserRole.ADMIN], {
    required_error: "Please select a role.",
  }),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.CLIENT,
    },
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      // Get user roles from public metadata
      const roles = user.publicMetadata.roles as UserRole[] || [UserRole.CLIENT];
      
      // Set form values based on user data
      form.reset({
        name: user.fullName || user.username || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        role: roles.includes(UserRole.ADMIN) 
          ? UserRole.ADMIN 
          : roles.includes(UserRole.BUILDER) 
            ? UserRole.BUILDER 
            : UserRole.CLIENT,
      });
    }
  }, [isLoaded, user, form]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login");
    }
  }, [isLoaded, user, router]);

  async function onSubmit(data: ProfileData) {
    try {
      setIsSubmitting(true);

      // Call the API to update the user profile
      const response = await fetch("/api/profiles/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          role: data.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      // Show success message
      toast.success("Profile updated", {
        description: "Your profile has been successfully updated.",
      });
      
      // Refresh the user session to get updated data
      await user?.reload();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Something went wrong", {
        description: "We couldn't update your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state while checking user
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-16">
        <div className="container py-12">
          <div className="mx-auto max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Manage your account information
              </p>
            </div>

            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-8"
                aria-label="Profile settings form"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          aria-label="Your name"
                        />
                      </FormControl>
                      <FormDescription>
                        This is how you&apos;ll appear on the platform.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          type="email"
                          disabled
                          {...field}
                          aria-label="Your email address"
                        />
                      </FormControl>
                      <FormDescription>
                        Your email address cannot be changed here. To change your email address, please use your account settings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem 
                                value={UserRole.CLIENT} 
                                id="role-client"
                              />
                            </FormControl>
                            <FormLabel 
                              className="font-normal"
                              htmlFor="role-client"
                            >
                              Client - I want to commission apps
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem 
                                value={UserRole.BUILDER} 
                                id="role-builder"
                              />
                            </FormControl>
                            <FormLabel 
                              className="font-normal"
                              htmlFor="role-builder"
                            >
                              Builder - I want to build apps for clients
                            </FormLabel>
                          </FormItem>
                          {user?.publicMetadata.roles && (user.publicMetadata.roles as string[]).includes(UserRole.ADMIN) && (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem 
                                  value={UserRole.ADMIN} 
                                  id="role-admin"
                                />
                              </FormControl>
                              <FormLabel 
                                className="font-normal"
                                htmlFor="role-admin"
                              >
                                Admin - Platform administration
                              </FormLabel>
                            </FormItem>
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Profile
                </Button>
              </form>
            </Form>

            <div className="mt-8 p-6 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Account Status</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${user?.primaryEmailAddress?.verification?.status === "verified" ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span>
                    {user?.primaryEmailAddress?.verification?.status === "verified" 
                      ? "Verified Account" 
                      : "Verification Pending"}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${user?.publicMetadata.stripeCustomerId ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span>
                    {user?.publicMetadata.stripeCustomerId 
                      ? "Payment Account Connected" 
                      : "No Payment Method"}
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                  <span>
                    Account created on {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
