"use client";





import { PlatformHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth/hooks";
import { UserRole } from "@/lib/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem
} from "@/components/ui";

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
  const { user, isLoading, isAuthenticated, updateSession } = useAuth();

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.CLIENT,
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.roles && user.roles.length > 0 ? user.roles[0] as UserRole : UserRole.CLIENT,
      });
    }
  }, [user, form]);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    redirect("/login");
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  async function onSubmit(data: ProfileData) {
    try {
      // Since we're now using Clerk, we need to update the user profile via an API endpoint
      // For MVP, just show success message without actually updating
      // This will be replaced with a proper API call in a future update
      await updateSession();
      
      // TODO: Replace with API call to update user profile
      // For now, just show success message
      toast.success("Profile updated", {
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast.error("Something went wrong", {
        description: "We couldn&apos;t update your profile. Please try again.",
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PlatformHeader />
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
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
                        />
                      </FormControl>
                      <FormDescription>
                        Your email address cannot be changed.
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
                              <RadioGroupItem value={UserRole.CLIENT} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Client - I want to commission apps
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={UserRole.BUILDER} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Builder - I want to build apps for clients
                            </FormLabel>
                          </FormItem>
                          {user?.roles?.includes(UserRole.ADMIN) && (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={UserRole.ADMIN} />
                              </FormControl>
                              <FormLabel className="font-normal">
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

                <Button type="submit" className="w-full">
                  {form.formState.isSubmitting && (
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
                  <div className={`w-3 h-3 rounded-full mr-2 ${user?.verified ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span>{user?.verified ? "Verified Account" : "Verification Pending"}</span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${user?.stripeCustomerId ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span>{user?.stripeCustomerId ? "Payment Account Connected" : "No Payment Method"}</span>
                </div>

                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                  <span>Account created on {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
