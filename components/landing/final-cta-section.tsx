import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FinalCtaSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Join Buildappswith today and start leveraging AI to create the applications you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/signup">Sign Up Now</Link>
          </Button>
          <Button variant="outline" size="lg">
            Just keep me informed for now
          </Button>
        </div>
      </div>
    </section>
  );
}
