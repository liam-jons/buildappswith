import React from 'react';

const KeyValuesSection = () => {
  return (
    <section id="key-values" className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          AI for Everyone
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Placeholder for Key Value 1 */}
          <div className="text-center">
            {/* Icon/Visual Placeholder */}
            <div className="mb-4 inline-block rounded-lg bg-muted p-4">
              {/* Replace with actual icon component */}
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Accessible AI Education</h3>
            <p className="text-muted-foreground">
              Learn practical AI skills through project-based education, regardless of your technical background.
            </p>
          </div>

          {/* Placeholder for Key Value 2 */}
          <div className="text-center">
            {/* Icon/Visual Placeholder */}
            <div className="mb-4 inline-block rounded-lg bg-muted p-4">
              {/* Replace with actual icon component */}
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality-Driven Marketplace</h3>
            <p className="text-muted-foreground">
              Find validated builders through transparent metrics focused on concrete outcomes rather than subjective ratings.
            </p>
          </div>

          {/* Placeholder for Key Value 3 */}
          <div className="text-center">
            {/* Icon/Visual Placeholder */}
            <div className="mb-4 inline-block rounded-lg bg-muted p-4">
              {/* Replace with actual icon component */}
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Community-Powered Growth</h3>
            <p className="text-muted-foreground">
              Join a virtuous cycle where learners become builders, successful builders become mentors, and everyone benefits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyValuesSection;