import { Metadata } from "next";
import { Suspense } from "react";

// Import domain-specific actions
import { getLearningCategories } from "@/lib/learning/actions";

// Import components using barrel exports
import { Timeline } from "@/components/learning";
import { Button } from "@/components/ui";

// Metadata export for Next.js
export const metadata: Metadata = {
  title: "Learning Hub | Buildappswith",
  description: "Explore what AI can and cannot do through our interactive learning resources.",
};

/**
 * Learning Hub Page
 * 
 * Main entry point for the learning section of the platform, featuring
 * the AI capability timeline and access to learning modules.
 */
export default async function LearningPage() {
  // Server-side data fetching
  const categories = await getLearningCategories();
  
  return (
    <div className="container mx-auto py-8">
      <section className="mb-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Learning Hub</h1>
          <p className="text-xl text-gray-600">
            Discover what AI can and cannot do, build practical skills, and track your
            learning progress.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">AI Capability Timeline</h2>
            <p className="mb-4">Explore an interactive visualization of AI's capabilities and limitations.</p>
            <Button className="w-full" variant="outline" asChild>
              <a href="/platform/learning/timeline">Explore Timeline</a>
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">Learning Modules</h2>
            <p className="mb-4">Structured courses to build your practical AI skills.</p>
            <Button className="w-full" variant="outline" asChild>
              <a href="/platform/learning/modules">Browse Modules</a>
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">Skill Tracker</h2>
            <p className="mb-4">Track your progress and showcase your AI literacy achievements.</p>
            <Button className="w-full" variant="outline" asChild>
              <a href="/platform/learning/dashboard">View Progress</a>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">What AI Can & Cannot Do</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Suspense fallback={<div className="h-96 w-full bg-gray-100 animate-pulse rounded-md"></div>}>
            <Timeline initialFilter="all" />
          </Suspense>
        </div>
      </section>
      
      <section className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Start Your Learning Journey</h2>
        <p className="mb-6">
          Whether you're just getting started with AI or looking to deepen your expertise,
          our structured learning resources will help you build practical skills.
        </p>
        <Button size="lg" asChild>
          <a href="/platform/learning/modules">Begin Learning</a>
        </Button>
      </section>
    </div>
  );
}
