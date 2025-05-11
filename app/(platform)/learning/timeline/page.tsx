import { Metadata } from "next";
import { Card } from "@/components/ui/core";
import { Button } from "@/components/ui";

// Metadata export for Next.js
export const metadata: Metadata = {
  title: "AI Capability Timeline | Buildappswith Learning",
  description: "Interactive timeline showing what AI can and cannot do across different domains and time periods.",
};

/**
 * Timeline Page
 *
 * Dedicated page for exploring the AI capability timeline with
 * comprehensive filtering and detailed information.
 */
export default function TimelinePage() {
  return (
    <div className="container mx-auto py-8">
      <section className="mb-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">AI Capability Timeline</h1>
          <p className="text-xl text-muted-foreground">
            Explore what AI can and cannot do across different domains and time periods.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              <div className="h-40 bg-muted animate-pulse rounded-md"></div>
            </Card>

            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Legend</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span>AI Can Do This</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span>AI Cannot Do This</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span>Emerging Capability</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="p-12 text-center">
              <p className="text-xl text-muted-foreground">Timeline visualization is loading...</p>
              <p className="mt-4 text-sm text-muted-foreground">This feature is under active development</p>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Ready to apply these concepts in practical scenarios?
            </p>
            <Button asChild>
              <a href="/platform/learning/modules">Explore Learning Modules</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
