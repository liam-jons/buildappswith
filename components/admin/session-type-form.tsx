"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { SessionType } from "@/lib/scheduling/types";
import { DialogFooter } from "@/components/ui/dialog";

// Define the schema for session type form validation
const sessionTypeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  durationMinutes: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  currency: z.string().min(3, "Currency code must be 3 characters").max(3, "Currency code must be 3 characters"),
  isActive: z.boolean().default(true),
  color: z.string().optional(),
  maxParticipants: z.coerce.number().optional(),
});

type SessionTypeFormValues = z.infer<typeof sessionTypeSchema>;

interface SessionTypeFormProps {
  initialData?: SessionType;
  onSubmit: (data: SessionTypeFormValues) => void;
}

export function SessionTypeForm({ 
  initialData, 
  onSubmit 
}: SessionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form with default values or existing data
  const form = useForm<SessionTypeFormValues>({
    resolver: zodResolver(sessionTypeSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      durationMinutes: initialData.durationMinutes,
      price: initialData.price,
      currency: initialData.currency,
      isActive: initialData.isActive,
      color: initialData.color || "",
      maxParticipants: initialData.maxParticipants || undefined,
    } : {
      title: "",
      description: "",
      durationMinutes: 60,
      price: 99,
      currency: "USD",
      isActive: true,
      color: "",
      maxParticipants: undefined,
    },
  });
  
  // Handle form submission
  const handleSubmit = async (values: SessionTypeFormValues) => {
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Individual 1-to-1 Session" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this session offers..." 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={15} step={15} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (optional)</FormLabel>
                <FormControl>
                  <div className="flex space-x-2">
                    <Input placeholder="#4f46e5" {...field} />
                    <div 
                      className="w-10 h-10 rounded-md border"
                      style={{ backgroundColor: field.value || "#ffffff" }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Participants (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    placeholder="Leave empty for 1:1 sessions"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This session type will be available for booking.
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2">Saving...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              initialData ? "Update Session Type" : "Create Session Type"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}