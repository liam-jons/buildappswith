"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  ChatBubbleIcon, 
  HeartFilledIcon,
  RocketIcon,
  PersonIcon,
  LightningBoltIcon,
  InfoCircledIcon,
  ArrowRightIcon
} from "@radix-ui/react-icons";
import { BorderBeam } from "@/components/magicui/border-beam";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { AppShowcase } from "@/components/profile/app-showcase";
import { MultiRoleBadge } from "@/components/profile/role-badges";
import { ValidationTierBadge } from "@/components/profile/validation-tier-badge";
import { UserRole } from "@prisma/client";

// Mock data for Liam Jons' profile
const adhdApps = [
  {
    id: "app1",
    title: "ADHD Planner AI",
    description: "Personalized daily planning system that adapts to your unique ADHD traits and cognitive patterns",
    imageUrl: "/images/apps/adhd-planner.jpg",
    technologies: ["OpenAI GPT-4", "Next.js", "Firebase", "React"],
    status: "LIVE" as const,
    appUrl: "https://adhdplanner.example.com",
    adhd_focused: true,
    createdAt: new Date("2024-12-10")
  },
  {
    id: "app2",
    title: "Focus Flow",
    description: "Hyperpersonalized productivity system that works with your ADHD brain instead of against it",
    imageUrl: "/images/apps/focus-flow.jpg",
    technologies: ["Claude API", "Vue.js", "MongoDB", "Express"],
    status: "DEMO" as const,
    appUrl: "https://focusflow.example.com",
    adhd_focused: true,
    createdAt: new Date("2024-11-05")
  },
  {
    id: "app3",
    title: "Memory Companion",
    description: "AI assistant that helps you remember important information, tasks, and commitments",
    imageUrl: "/images/apps/memory-companion.jpg",
    technologies: ["Perplexity API", "Svelte", "Supabase", "TailwindCSS"],
    status: "CONCEPT" as const,
    adhd_focused: true,
    createdAt: new Date("2025-01-15")
  }
];

// Session types
const sessionTypes = [
  {
    id: "session1",
    title: "1:1 AI Discovery Session",
    description: "Personalized exploration of how AI can be applied to your unique situation, with tailored recommendations and guidance.",
    duration: "60 minutes",
    price: "£150",
    icon: <PersonIcon className="h-5 w-5" />
  },
  {
    id: "session2",
    title: "ADHD-Focused AI Strategy",
    description: "Specialized session for those with ADHD to develop an AI tool stack that works with your brain's strengths and supports your challenges.",
    duration: "75 minutes",
    price: "£185",
    icon: <HeartFilledIcon className="h-5 w-5" />
  },
  {
    id: "session3",
    title: "AI Literacy Fundamentals",
    description: "Group workshop covering the essentials of AI: what it can/can't do, how to use it effectively, and ethical considerations.",
    duration: "90 minutes",
    price: "£45 per person",
    participantLimit: "10-15 participants",
    icon: <LightningBoltIcon className="h-5 w-5" />
  },
  {
    id: "session4",
    title: "Free Weekly Session for Unemployed",
    description: "Supporting those between jobs with free AI literacy sessions to build valuable skills.",
    duration: "60 minutes",
    price: "Free",
    eligibility: "Currently unemployed individuals",
    icon: <RocketIcon className="h-5 w-5" />
  }
];

export default function LiamJonsProfile() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<string>("about");
  
  const handleBookSession = (sessionId?: string) => {
    const url = sessionId 
      ? `/book/liam?session=${sessionId}` 
      : "/book/liam";
    router.push(url);
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 pt-12 pb-20 overflow-hidden">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 mb-2">
                  <MultiRoleBadge 
                    roles={[UserRole.BUILDER, UserRole.ADMIN]} 
                    isFounder={true}
                    size="md"
                  />
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 rounded-md text-sm font-medium">
                    <HeartFilledIcon className="h-4 w-4" />
                    ADHD Specialist
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <TextShimmer>Liam Jons</TextShimmer>
                </h1>
                
                <h2 className="text-xl md:text-2xl text-muted-foreground">
                  AI Specialist & ADHD Advocate
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-lg">
                  Helping everyone—especially those traditionally underserved—harness AI to transform their lives and work with practical, personalized solutions.
                </p>
                
                <div className="pt-4 flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => handleBookSession()}
                    className="gap-2"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    Book a Session
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    asChild
                    className="gap-2"
                  >
                    <Link href="#sessions">
                      View Session Types
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative h-64 w-64 md:h-80 md:w-80">
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                    {!shouldReduceMotion && (
                      <BorderBeam 
                        className="opacity-60" 
                        size={150} 
                        duration={4.5}
                        colorFrom="from-blue-400/80" 
                        colorTo="to-purple-400/0" 
                      />
                    )}
                  </div>
                  <Image
                    src="/images/profiles/liam-jons.jpg"
                    alt="Liam Jons"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 shadow-md">
                  <ValidationTierBadge tier="expert" size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Content Tabs */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full max-w-lg mx-auto mb-12">
              <TabsTrigger 
                value="about" 
                className="flex items-center gap-1.5"
              >
                <PersonIcon className="h-4 w-4" />
                About Liam
              </TabsTrigger>
              
              <TabsTrigger 
                value="apps" 
                className="flex items-center gap-1.5"
              >
                <RocketIcon className="h-4 w-4" />
                ADHD Apps
              </TabsTrigger>
              
              <TabsTrigger 
                value="sessions" 
                className="flex items-center gap-1.5"
                id="sessions"
              >
                <CalendarIcon className="h-4 w-4" />
                Sessions
              </TabsTrigger>
            </TabsList>
            
            {/* About Tab */}
            <TabsContent value="about" className="mt-0 space-y-12">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-3xl font-bold mb-6">My Mission</h2>
                <p className="text-lg">
                  I&apos;m on a mission to make AI accessible to everyone, with a special focus on helping individuals with ADHD and other neurodivergent traits. Having experienced the transformative power of properly applied AI in my own life with ADHD, I&apos;m passionate about creating that same opportunity for others.
                </p>
                <p className="text-lg">
                  Through Buildappswith, I help people understand and leverage AI technologies in ways that make a meaningful difference in their daily lives. I believe that AI is at its most powerful when it&apos;s personalized to work with your unique cognitive patterns, not against them.
                </p>
                <p className="text-lg">
                  My focus is particularly on those who are typically underserved by technology—people who may not have a technical background but have the most to gain from these tools. Hyperpersonalization is where AI truly shines, and it&apos;s how we can create the most significant positive changes in people&apos;s lives.
                </p>
                
                <h2 className="text-3xl font-bold mb-6 mt-12">Background & Expertise</h2>
                <p className="text-lg">
                  With over 15 years in technology development and a specialization in AI applications, I bring both technical expertise and a deeply human approach to my work. My background includes:
                </p>
                <ul className="text-lg">
                  <li>Developing custom AI applications for productivity and cognitive support</li>
                  <li>Researching the intersection of AI and neurodiversity</li>
                  <li>Leading workshops on practical AI literacy for non-technical audiences</li>
                  <li>Creating frameworks for ethical, human-centered AI implementation</li>
                  <li>Advising organizations on AI adoption strategies that prioritize accessibility</li>
                </ul>
                <p className="text-lg">
                  As a founder of Buildappswith, I&apos;m committed to creating a platform where AI literacy is accessible to all, and where the power of these technologies can be harnessed by anyone, regardless of their technical background.
                </p>
              </div>
            </TabsContent>
            
            {/* Apps Tab */}
            <TabsContent value="apps" className="mt-0 space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-bold mb-4">AI Applications for ADHD</h2>
                <p className="text-lg text-muted-foreground">
                  I&apos;ve developed these specialized applications to help individuals with ADHD leverage AI for better focus, organization, and cognitive support.
                </p>
              </div>
              
              <AppShowcase 
                apps={adhdApps}
                maxDisplay={6}
              />
              
              <div className="bg-muted rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center mt-12">
                <div className="flex-shrink-0 p-3 bg-background rounded-full">
                  <InfoCircledIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Need a Custom Solution?</h3>
                  <p className="text-muted-foreground mb-4">
                    I can work with you to develop a personalized AI application tailored to your specific needs and challenges.
                  </p>
                  <Button onClick={() => handleBookSession("session1")} className="gap-2">
                    <ChatBubbleIcon className="h-4 w-4" />
                    Discuss Your Project
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Sessions Tab */}
            <TabsContent value="sessions" className="mt-0 space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-bold mb-4">Work With Liam</h2>
                <p className="text-lg text-muted-foreground">
                  Choose from a variety of session formats designed to help you leverage AI effectively in your personal and professional life.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessionTypes.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: shouldReduceMotion ? 0 : index * 0.1,
                      ease: "easeOut" 
                    }}
                  >
                    <div className={cn(
                      "h-full rounded-lg border p-6 flex flex-col",
                      session.id === "session4" && "border-dashed border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                    )}>
                      {session.id === "session4" && (
                        <div className="mb-4 -mt-2 -mx-2">
                          <span className="inline-block bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                            Free for unemployed
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4 mb-4">
                        <div className={cn(
                          "p-2 rounded-full",
                          session.id === "session1" && "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
                          session.id === "session2" && "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
                          session.id === "session3" && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                          session.id === "session4" && "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
                        )}>
                          {session.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.duration} • {session.price}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-6 flex-grow">
                        {session.description}
                      </p>
                      
                      {session.participantLimit && (
                        <p className="text-sm text-muted-foreground mb-4">
                          <span className="font-medium">Group size:</span> {session.participantLimit}
                        </p>
                      )}
                      
                      {session.eligibility && (
                        <p className="text-sm text-muted-foreground mb-4">
                          <span className="font-medium">Eligibility:</span> {session.eligibility}
                        </p>
                      )}
                      
                      <Button 
                        className="w-full gap-2 mt-auto"
                        onClick={() => handleBookSession(session.id)} 
                        variant={session.id === "session4" ? "secondary" : "default"}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Book {session.id === "session3" || session.id === "session4" ? "Group Session" : "1:1 Session"}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-muted rounded-lg p-6 mt-8">
                <h3 className="text-xl font-medium mb-2">Custom Corporate Training</h3>
                <p className="text-muted-foreground mb-4">
                  I also offer specialized AI literacy workshops for teams and organizations, tailored to your industry and specific needs. Contact me to discuss custom training options.
                </p>
                <Button 
                  variant="outline"
                  asChild
                  className="gap-2"
                >
                  <Link href="/contact?subject=Corporate%20Training">
                    <ChatBubbleIcon className="h-4 w-4" />
                    Inquire About Corporate Training
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform How You Use AI?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book a session with me today and discover how personalized AI strategies can help you overcome challenges and achieve your goals.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => handleBookSession()}
              className="gap-2"
            >
              <CalendarIcon className="h-5 w-5" />
              Book a Session Now
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              asChild
              className="gap-2"
            >
              <Link href="/contact?person=liam">
                <ChatBubbleIcon className="h-5 w-5" />
                Contact Liam
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}