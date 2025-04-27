"use client";

import { useState } from "react";
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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Onboarding form schema
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
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with user data when available
  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      role: UserRole.CLIENT,
    },
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has already completed onboarding
      const completedOnboarding = user.publicMetadata.completedOnboarding;
      if (completedOnboarding) {
        router.push("/dashboard");
        return;
      }

      // Set form default values based on user data
      form.reset({
        name: user.fullName || user.username || "",
        role: UserRole.CLIENT,
      });
    }
  }, [isLoaded, user, form, router]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login");
    }
  }, [isLoaded, user, router]);

  async function onSubmit(data: OnboardingData) {
    try {
      setIsSubmitting(true);

      // Call the API to update the user profile
      const response = await fetch("/api/profiles/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          isOnboarding: true, // Flag this as an onboarding request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      // Show success message
      toast.success("Profile created", {
        description: "Your profile has been successfully created.",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong", {
        description: "We couldn't complete your profile. Please try again.",
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
              <h1 className="text-3xl font-bold">Complete Your Profile</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Tell us a bit about yourself to get started
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                aria-label="Onboarding form"
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
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        You can change this later in your profile settings.
                      </FormDescription>
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
