import React from 'react';
import { ArrowRight, Lightbulb, Users, BookOpen, BarChart } from 'lucide-react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui";


 
 export default function HowItWorksPage() {
   return (
     <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">How <span className="text-primary">Build</span> <span className="text-teal-500">Apps</span> <span className="text-primary">With</span> Works</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg mb-6">
            Buildappswith is a platform dedicated to democratizing AI application development through a human-centered approach. 
            We believe everyone deserves access to the power of AI, regardless of technical background.
          </p>
          <p className="text-lg mb-6">
            Our platform serves as both a marketplace for connecting users with verified AI builders and an educational 
            resource hub for those who want to learn practical AI skills.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">The Process</h2>
          
          <div className="grid gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>1. Discover</CardTitle>
                  <CardDescription>Explore what AI can do for you</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Start by browsing our curated toolkit of recommended AI applications or explore the marketplace 
                  to see what kinds of solutions our builders can create. Understand what&apos;s possible with today&apos;s AI technology.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>2. Connect</CardTitle>
                  <CardDescription>Find the right expertise for your needs</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Whether you&apos;re looking to learn or to have something built, we connect you with verified experts who can help.
                  Our marketplace features transparent validation metrics so you can choose with confidence.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>3. Learn & Build</CardTitle>
                  <CardDescription>Develop practical AI skills through application</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Engage with our educational resources or collaborate with builders to create solutions. Our platform 
                  emphasises learning by doing, with a curriculum focused on practical, immediate application.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>4. Grow</CardTitle>
                  <CardDescription>Evolve from user to community contributor</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  As your skills develop, you can progress from a learner to a builder, sharing your expertise with others 
                  and contributing to our growing community of AI practitioners.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Joining the AI Marketplace</h2>
          <p className="text-lg mb-6">
           Our marketplace operates on a &quot;race to the top&quot; model, where builders compete based on quality and outcomes 
            rather than price. This ensures that clients receive high-quality solutions while builders are fairly compensated 
            for their expertise.
          </p>
          
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-medium mb-3">For Builders</h3>
            <p className="mb-4">
              If you have expertise in AI application development and want to share your knowledge with others, 
              becoming a builder on our platform offers you:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>A transparent validation system that recognises quality</li>
              <li>Direct connections with clients seeking your specific expertise</li>
              <li>Opportunities to mentor and teach others</li>
              <li>A community of fellow AI practitioners</li>
            </ul>
            <Button className="mt-2" asChild>
              <Link href="/marketplace">
                Explore the Marketplace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-medium mb-3">For Clients</h3>
            <p className="mb-4">
             If you&apos;re looking for custom AI solutions for your business or personal needs, our marketplace provides:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access to verified AI application builders</li>
              <li>Transparent success metrics to guide your selection</li>
              <li>Fair pricing with clear value proposition</li>
              <li>Educational resources to help you understand what you&apos;re buying</li>
            </ul>
            <Button className="mt-2" asChild>
              <Link href="/marketplace">
               Find a Builder <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">AI Literacy Resources</h2>
          <p className="text-lg mb-6">
           Stay current with our &quot;What AI Can and Can&apos;t Do&quot; timeline, helping you understand the rapidly changing landscape 
            of AI capabilities and limitations.
          </p>
          <p className="text-lg mb-6">
            Our educational resources are designed for practical application, focusing on skills you can immediately use 
            to improve your personal productivity or business operations.
          </p>
          <div className="flex justify-center mt-8">
            <Button size="lg" asChild>
             <Link href="/toolkit">
               Explore AI Toolkit <ArrowRight className="ml-2 h-4 w-4" />
             </Link>
           </Button>
         </div>
       </section>
     </div>
   </div>
   );
 }
