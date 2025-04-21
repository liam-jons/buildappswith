"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would eventually handle form submission
    // For now, we're just preventing the default behavior
    console.log('Form submission prevented - placeholder functionality');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="your.email@example.com" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" placeholder="What's this regarding?" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          placeholder="Tell us how we can help you" 
          className="min-h-[150px]" 
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-black text-white hover:bg-black/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
      >
        Send Message
      </Button>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
        Note: This is a placeholder form. Actual submission functionality will be implemented soon.
      </p>
    </form>
  );
}
