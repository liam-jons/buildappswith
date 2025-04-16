"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitHubIcon, GoogleIcon } from "./social-icons";
import { z } from "zod";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };
  
  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (!result?.ok) {
        setAuthError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Redirect on successful login
      router.push(callbackUrl);
      
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };
  
  // Demo user credentials
  const demoUsers = [
    { role: "Client", email: "client@example.com", password: "password123" },
    { role: "Learner", email: "learner@example.com", password: "password123" },
    { role: "Builder", email: "builder@example.com", password: "password123" },
  ];
  
  const loginAsDemoUser = (email: string, password: string) => {
    setFormData({ email, password });
    setAuthError(null);
  };
  
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-10">
      <div className="mx-auto max-w-md w-full space-y-6 p-8 border rounded-lg bg-card shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        
        {authError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {authError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        
        <div className="relative flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-muted" />
          <span className="relative bg-card px-2 text-muted-foreground text-sm">
            or continue with
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => signIn("github", { callbackUrl })}
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2"
          >
            <GitHubIcon className="h-4 w-4" />
            <span>GitHub</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => signIn("google", { callbackUrl })}
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2"
          >
            <GoogleIcon className="h-4 w-4" />
            <span>Google</span>
          </Button>
        </div>
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-center text-sm text-muted-foreground mb-2">
            Demo Users (for testing only)
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demoUsers.map((user) => (
              <Button
                key={user.role}
                variant="secondary"
                size="sm"
                onClick={() => loginAsDemoUser(user.email, user.password)}
                className="text-xs"
              >
                Log in as {user.role} ({user.email})
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
