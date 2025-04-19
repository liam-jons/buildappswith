"use client";

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
import { useAuth } from "@/lib/auth/hooks";
import { UserRole } from "@/lib/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const onboardingSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.enum([UserRole.CLIENT, UserRole.BUILDER], {
    required_error: "Please select a role.",
  }),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { user, isLoading, isAuthenticated, updateSession } = useAuth();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.name || "",
      role: UserRole.CLIENT,
    },
  });

  // Redirect to dashboard if user is already verified
  useEffect(() => {
    if (user?.verified) {
      redirect("/dashboard");
    }
  }, [user]);

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

  async function onSubmit(data: OnboardingData) {
    try {
      // In a real implementation, this would call an API endpoint to update the user profile
      // For MVP, we'll use NextAuth's update session method to update the client-side session
      await updateSession({
        ...user,
        name: data.name,
        role: data.role,
        verified: true,
      });

      toast.success("Profile updated", {
        description: "Your profile has been successfully updated.",
      });

      // Redirect to dashboard after successful onboarding
      redirect("/dashboard");
    } catch (error) {
      toast.error("Something went wrong", {
        description: "We couldn&apos;t update your profile. Please try again.",
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-16">
        <div className="container py-12">
          <div className="mx-auto max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Complete Your Profile</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Tell us a bit about yourself to get started
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
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        You can change this later in your profile settings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Complete Profile
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
