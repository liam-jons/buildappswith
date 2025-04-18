import React from 'react';
import { Metadata } from 'next';
// Note: AuroraBackground component is not available in this project
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import TextShimmer from '@/components/magicui/text-shimmer';
import { BorderBeam } from '@/components/magicui/border-beam';

export const metadata: Metadata = {
  title: 'How it Works | Buildappswith',
  description: 'Learn how Buildappswith can help you benefit from AI today, whether you need an app built, want to learn practical AI skills, or are an experienced builder.',
};

export default function HowItWorksPage() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero section */}
      <section className="w-full py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl opacity-20"></div>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                <TextShimmer>How Buildappswith Works</TextShimmer>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Democratising AI for everyone by connecting clients with validated builders and offering practical AI education
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three paths section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Path</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Buildappswith offers three primary paths, each designed to meet different needs and skill levels.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Path 1 */}
            <div className="flex flex-col items-center space-y-4 border p-6 rounded-lg bg-background relative group overflow-hidden">
              <BorderBeam className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="size-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">I Need an App</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Connect with validated builders who can transform your ideas into reality at an affordable price.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/marketplace">
                  Find a Builder
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            {/* Path 2 */}
            <div className="flex flex-col items-center space-y-4 border p-6 rounded-lg bg-background relative group overflow-hidden">
              <BorderBeam className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="size-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">I Want to Learn</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Develop practical AI skills through our structured learning paths, from beginner to builder.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/for-learners">
                  Start Learning
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            {/* Path 3 */}
            <div className="flex flex-col items-center space-y-4 border p-6 rounded-lg bg-background relative group overflow-hidden">
              <BorderBeam className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="size-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">I Want to Build</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Join our builder community to share your expertise, build your reputation, and help others succeed.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/become-builder">
                  Become a Builder
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Process</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                A transparent approach to AI application development and education.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 mt-16">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 p-3">
                <span className="text-xl font-bold text-primary">01</span>
              </div>
              <h3 className="text-xl font-bold">Transparent Builder Validation</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Our builders are validated based on concrete outcomes, not subjective reviews. See verified results before you choose.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 p-3">
                <span className="text-xl font-bold text-primary">02</span>
              </div>
              <h3 className="text-xl font-bold">Practical AI Education</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Learn through project-based education that focuses on real-world applications, not just theory.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 p-3">
                <span className="text-xl font-bold text-primary">03</span>
              </div>
              <h3 className="text-xl font-bold">Community-Powered Growth</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Join a virtuous cycle where learners become builders, successful builders become mentors, and everyone benefits.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 p-3">
                <span className="text-xl font-bold text-primary">04</span>
              </div>
              <h3 className="text-xl font-bold">Track AI Evolution</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Stay current with our "What AI Can/Can't Do" timeline, helping you understand the rapidly changing landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Join us today and take the first step toward your AI journey.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/signup">
                  Sign Up Now
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/marketplace">
                  Explore Marketplace
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
