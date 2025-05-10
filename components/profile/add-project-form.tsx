"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/core/form";
import { Input } from "@/components/ui/core/input";
import { Textarea } from "@/components/ui/core/textarea";
import { Button } from "@/components/ui/core/button";
import {
  Cross2Icon,
  PlusIcon,
  CheckIcon,
  ReloadIcon,
  ImageIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/core/select";
import { PortfolioProject } from "./portfolio-showcase";

// Form validation schema
const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(300, "Description cannot exceed 300 characters"),
  imageUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  projectUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
  outcomes: z.array(z.object({
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required"),
    trend: z.enum(["up", "down", "neutral"]).optional(),
  })).min(1, "Add at least one outcome"),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface AddProjectFormProps {
  existingProject?: PortfolioProject;
  onSave: (data: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
}

export function AddProjectForm({ existingProject, onSave, onCancel }: AddProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const isEditing = !!existingProject;

  // Initialize form with existing project data if editing
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: existingProject ? {
      title: existingProject.title,
      description: existingProject.description,
      imageUrl: existingProject.imageUrl,
      projectUrl: existingProject.projectUrl || "",
      tags: existingProject.tags,
      outcomes: existingProject.outcomes,
    } : {
      title: "",
      description: "",
      imageUrl: "",
      projectUrl: "",
      tags: [],
      outcomes: [{ label: "", value: "", trend: "neutral" }],
    },
  });

  // Handle form submission
  async function onSubmit(values: ProjectFormValues) {
    setIsSubmitting(true);
    try {
      await onSave(values);
    } catch (error) {
      console.error("Failed to save project", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle adding a new tag
  function handleAddTag() {
    if (!newTag.trim()) return;
    
    const currentTags = form.getValues("tags");
    if (!currentTags.includes(newTag.trim())) {
      form.setValue("tags", [...currentTags, newTag.trim()]);
      form.trigger("tags");
    }
    setNewTag("");
  }

  // Handle removing a tag
  function handleRemoveTag(tagToRemove: string) {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags", 
      currentTags.filter(tag => tag !== tagToRemove)
    );
    form.trigger("tags");
  }

  // Handle adding a new outcome
  function handleAddOutcome() {
    const currentOutcomes = form.getValues("outcomes");
    form.setValue("outcomes", [
      ...currentOutcomes, 
      { label: "", value: "", trend: "neutral" as const }
    ]);
  }

  // Handle removing an outcome
  function handleRemoveOutcome(index: number) {
    const currentOutcomes = form.getValues("outcomes");
    if (currentOutcomes.length > 1) {
      form.setValue(
        "outcomes", 
        currentOutcomes.filter((_, i) => i !== index)
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">
            {isEditing ? "Edit Project" : "Add New Project"}
          </h3>
          
          {/* Project Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., E-commerce Mobile App" {...field} />
                </FormControl>
                <FormDescription>
                  A concise title for your project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Project Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Briefly describe what you built and what problems it solved..." 
                    className="resize-y"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  {field.value.length}/300 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Project Image */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Image URL</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-muted p-2 rounded-l-md border border-r-0 border-input">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      className="rounded-l-none"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  URL to an image showcasing your project (screenshots, mockups, etc.).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Project URL */}
          <FormField
            control={form.control}
            name="projectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project URL (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-muted p-2 rounded-l-md border border-r-0 border-input">
                      <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://myproject.com" 
                      className="rounded-l-none"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Link to the live project, GitHub repository, or case study.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Project Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem>
                <FormLabel>Project Tags</FormLabel>
                <div className="space-y-4">
                  <div className="flex">
                    <Input
                      placeholder="Add a tag (e.g., Mobile, React Native, E-commerce)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="rounded-r-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddTag}
                      variant="secondary"
                      className="rounded-l-none"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {form.getValues("tags").map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground hover:text-foreground transition-colors rounded-full"
                          aria-label={`Remove ${tag}`}
                        >
                          <Cross2Icon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </div>
                <FormDescription>
                  Add technologies, domains, or other relevant tags.
                </FormDescription>
              </FormItem>
            )}
          />
          
          {/* Project Outcomes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Project Outcomes</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOutcome}
                className="h-8"
              >
                <PlusIcon className="h-3.5 w-3.5 mr-1" />
                Add Outcome
              </Button>
            </div>
            
            <FormDescription className="mt-0">
              Add measurable outcomes achieved with this project.
            </FormDescription>
            
            <div className="space-y-4">
              {form.watch("outcomes").map((_, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="grid grid-cols-5 gap-2 flex-grow">
                    <FormField
                      control={form.control}
                      name={`outcomes.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="col-span-2 space-y-0">
                          <FormControl>
                            <Input placeholder="Metric Label" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`outcomes.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="col-span-2 space-y-0">
                          <FormControl>
                            <Input placeholder="Value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`outcomes.${index}.trend`}
                      render={({ field }) => (
                        <FormItem className="col-span-1 space-y-0">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Trend" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="up">↑ Up</SelectItem>
                              <SelectItem value="neutral">― Neutral</SelectItem>
                              <SelectItem value="down">↓ Down</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch("outcomes").length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOutcome(index)}
                      className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Remove outcome"
                    >
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {form.formState.errors.outcomes && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.outcomes.message}
              </p>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                {isEditing ? "Update Project" : "Add Project"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
