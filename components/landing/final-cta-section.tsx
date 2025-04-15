import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FinalCtaSection = () => {
  return (
    <section id="final-cta" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join the AI Democratization Movement
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Whether you need an app built, want to learn practical AI skills, or are an experienced builder looking for quality-focused clients, Buildappswith is your community.
        </p>
        <Link href="/signup"> {/* Adjust link as needed */}
          <Button size="lg">
            Start Your Journey
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FinalCtaSection;
