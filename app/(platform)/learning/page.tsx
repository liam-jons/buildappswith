import { Metadata } from "next";
import { Button, Card } from "@/components/ui";

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
export default function LearningPage() {
  return (
    <div className="container mx-auto py-8">
      <section className="mb-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Learning Hub</h1>
          <p className="text-xl text-muted-foreground">
            Discover what AI can and cannot do, build practical skills, and track your
            learning progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">AI Capability Timeline</h2>
            <p className="mb-4 text-muted-foreground">Explore an interactive visualization of AI&apos;s capabilities and limitations.</p>
            <Button className="w-full" variant="outline" asChild>
              <a href="/platform/learning/timeline">Explore Timeline</a>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">Learning Modules</h2>
            <p className="mb-4 text-muted-foreground">Structured courses to build your practical AI skills.</p>
            <Button className="w-full" variant="outline" asChild>
              <a href="/platform/learning/modules">Browse Modules</a>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">Skill Tracker</h2>
            <p className="mb-4 text-muted-foreground">Track your progress and showcase your AI literacy achievements.</p>
            <Button className="w-full" variant="outline" asChild>
              <a href="/platform/learning/dashboard">View Progress</a>
            </Button>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">What AI Can & Cannot Do</h2>
        <Card className="p-6">
          <div className="p-12 text-center">
            <p className="text-xl text-muted-foreground">Timeline visualization is loading...</p>
            <p className="mt-4 text-sm text-muted-foreground">This feature is under active development</p>
          </div>
        </Card>
      </section>

      <section className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Start Your Learning Journey</h2>
        <p className="mb-6 text-muted-foreground">
          Whether you&apos;re just getting started with AI or looking to deepen your expertise,
          our structured learning resources will help you build practical skills.
        </p>
        <Button size="lg" asChild>
          <a href="/platform/learning/modules">Begin Learning</a>
        </Button>
      </section>
    </div>
  );
}
