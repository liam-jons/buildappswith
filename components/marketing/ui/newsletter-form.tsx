"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export function NewsletterForm({
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    try {
      setIsSubmitting(true);
      
      // Simulated form submission - replace with actual API call when ready
      // await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      
      // Success state
      setSuccessMessage("Thanks for subscribing!");
      setEmail("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form 
      className={cn("space-y-2", className)} 
      onSubmit={handleSubmit}
      aria-label="Newsletter subscription form"
    >
      {successMessage ? (
        <div className="text-sm text-green-600 dark:text-green-400 py-2">
          {successMessage}
        </div>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label={placeholder}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? "Subscribing..." : buttonText}
          </button>
        </>
      )}
    </form>
  );
}