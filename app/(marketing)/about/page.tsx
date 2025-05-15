import React from 'react';
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  Separator
} from "@/components/ui";
import { AuroraText } from "@/components/magicui/aurora-text";


export const metadata = {
  title: "Our Mission | Build Apps With",
  description: "Our mission to democratise AI application development through connecting clients with validated builders and practical AI education.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Mission
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Democratizing AI through practical application and human connection
          </p>
        </div>

        {/* BorderBeam wrapper div */}
        <div className="relative p-8 rounded-lg mb-12 bg-slate-50 dark:bg-slate-800/50">
          <BorderBeam className="rounded-lg" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-lg mb-6">
              We envision a world where AI technologies serve humans, not the other way around. 
              A world where everyone, regardless of technical background, can harness the power 
              of AI to solve problems, create opportunities, and have more time for what truly matters &ndash; 
              human connection.
            </p>
            <p className="text-lg">
              <span className="text-primary">Build</span> <AuroraText className="inline-block mx-1">Apps</AuroraText> <span className="text-primary">With</span> is working to make this vision a reality by creating a platform that
              bridges the gap between advanced AI capabilities and practical application for
              non-technical users.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Our Purpose</h2>
            <p className="mb-4">
              To create a trusted ecosystem where anyone can benefit from AI&apos;s potential to enhance 
              efficiency and human connection.
            </p>
            <p>
              Our platform connects those seeking custom AI solutions with verified builders, while 
              simultaneously providing the education resources needed for anyone to understand and 
              leverage AI effectively in their daily lives.
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Our Approach</h2>
            <p className="mb-4">
              We operate on a &quot;race to the top&quot; model that incentivizes quality, knowledge-sharing, 
              and tangible outcomes rather than competing on price.
            </p>
            <p>
              Our platform creates a virtuous cycle where learners become builders, successful builders 
              become mentors, and the ecosystem continuously expands its capabilities, making AI literacy 
              accessible to everyone.
            </p>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-3">Human-Centered AI</h3>
              <p>
                Technology should serve humans, not the other way around. We prioritize solutions 
                that enhance human experiences rather than replace them.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-3">Trust &amp; Authenticity</h3>
              <p>
                We create a safe space where people can learn about AI without fear or hype, 
                with transparent validation of builder capabilities and honest education about 
                what AI can and cannot do.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-3">Accessible Knowledge</h3>
              <p>
                AI literacy should be available to everyone regardless of background. We make 
                complex concepts understandable and provide free resources to those in need.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-3">Community Growth</h3>
              <p>
                Our &quot;race to the top&quot; model encourages builders to compete on quality and value, 
                not price, creating a community that continuously raises standards and shares knowledge.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-3">Efficiency for Connection</h3>
              <p>
                We use AI to make people more efficient so they have more time for what matters most &ndash; 
                human connection, creativity, and meaningful work.
              </p>
            </div>
            
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-3">Sustainable Growth</h3>
              <p>
                We focus on building a platform that can grow organically through community contribution 
                and value creation, ensuring long-term impact rather than short-term gains.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-lg mb-6">
            Whether you&apos;re looking to build an app, learn practical AI skills, or share your expertise,
            <span className="text-primary"> Build </span><AuroraText className="inline-block mx-1">Apps</AuroraText><span className="text-primary"> With</span> offers a path forward. Together, we can democratise AI and ensure its benefits
            are accessible to all.
          </p>
          <a 
            href="/signup" 
            className="inline-block px-6 py-3 rounded-md bg-black text-white dark:bg-black hover:bg-black/90 dark:hover:bg-black/90 transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
}
