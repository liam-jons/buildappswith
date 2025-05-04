import React from 'react';
import TextShimmer from "@/components/magicui/text-shimmer";

const KeyValuesSection = () => {
  return (
    <section id="key-values" className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-8">
        <TextShimmer className="text-3xl md:text-4xl font-bold text-center mb-12">
          AI for Everyone
        </TextShimmer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Placeholder for Key Value 1 */}
          <div className="text-center">
            {/* Icon/Visual Placeholder */}
            <div className="mb-4 inline-block rounded-lg bg-blue-100 dark:bg-blue-900/30 p-4">
              {/* Education icon */}
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">Accessible AI Education</h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              Learn practical AI skills through project-based education, regardless of your technical background.
            </p>
          </div>

          {/* Placeholder for Key Value 2 */}
          <div className="text-center">
            {/* Icon/Visual Placeholder */}
            <div className="mb-4 inline-block rounded-lg bg-purple-100 dark:bg-purple-900/30 p-4">
              {/* Marketplace/Validation icon */}
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">Quality-Driven Marketplace</h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              Find validated builders through transparent metrics focused on concrete outcomes rather than subjective ratings.
            </p>
          </div>

          {/* Placeholder for Key Value 3 */}
          <div className="text-center">
            {/* Icon/Visual Placeholder */}
            <div className="mb-4 inline-block rounded-lg bg-green-100 dark:bg-green-900/30 p-4">
              {/* Community icon */}
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-green-600 dark:text-green-400">Community-Powered Growth</h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              Join a virtuous cycle where learners become builders, successful builders become mentors, and everyone benefits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyValuesSection;
