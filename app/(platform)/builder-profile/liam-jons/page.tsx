"use client";

import { useState, use, useEffect } from "react";
// Import the builder profile utilities
import { getBuilderProfileBySlug, getBuilderSessionTypes } from "@/lib/builders/profile";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import Particles from "@/components/magicui/particles";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidationTierBadge } from "@/components/profile/validation-tier-badge";
import { AppShowcase } from "@/components/profile/app-showcase";
import { AppStatus, UserRole } from "@prisma/client";
import { PortfolioShowcase } from "@/components/profile/portfolio-showcase";
import { MultiRoleBadge } from "@/components/profile/role-badges";
import { 
  CalendarIcon, 
  ChatBubbleIcon, 
  StarFilledIcon,
  CheckIcon,
  GlobeIcon,
  LinkedInLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  PersonIcon,
  IdCardIcon,
  CodeIcon,
  LaptopIcon,
  EnvelopeClosedIcon,
  HeartFilledIcon,
  RocketIcon,
  LightningBoltIcon,
  InfoCircledIcon,
  ArrowRightIcon
} from "@radix-ui/react-icons";

// Session types with details for booking
// Map the session types from the database to the format expected by the UI
const formattedSessionTypes = sessionTypes.map(session => {
  let icon;
  switch(session.id) {
    case 'session1':
      icon = <PersonIcon className="h-5 w-5" />;
      break;
    case 'session2':
      icon = <HeartFilledIcon className="h-5 w-5" />;
      break;
    case 'session3':
      icon = <LightningBoltIcon className="h-5 w-5" />;
      break;
    case 'session4':
      icon = <RocketIcon className="h-5 w-5" />;
      break;
    default:
      icon = <PersonIcon className="h-5 w-5" />;
  }
  
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    duration: `${session.durationMinutes} minutes`,
    price: session.price === 0 ? 'Free' : `${session.currency} ${session.price}`,
    participantLimit: session.maxParticipants ? `${session.maxParticipants} participants` : undefined,
    eligibility: session.id === 'session4' ? 'Currently unemployed individuals' : undefined,
    icon
  };
});

// Add missing fields that are in the mock but not in the database profile
const enhancedProfile = {
  ...liamJonsProfile,
  name: liamJonsProfile.user?.name || 'Liam Jons',
  title: liamJonsProfile.headline || 'Founder & AI Application Builder',
  // Use fallback bio if not available
  founderBio: "As the founder of Buildappswith, I created this platform with a clear mission: to help people understand and leverage AI in practical ways. I believe that AI should serve humans, not the other way around, and that technology is at its best when it enhances our human connections rather than replacing them. My focus is especially on helping those who have been traditionally underserved by technology - including people with ADHD and neurodivergent traits - to benefit from the efficiency and personalization AI can provide.",
  avatarUrl: liamJonsProfile.user?.image || "/assets/liam-profile.jpg",
  coverImageUrl: "/assets/liam-cover.jpg", // This would need to be added to the public directory
  validationTier: "expert", // Map from numeric tier to string
  adhd_focus: liamJonsProfile.adhd_focus || false,
  joinDate: new Date(liamJonsProfile.createdAt) || new Date(2024, 2, 15),
  completedProjects: 12, // Hardcoded for now, could be calculated from completed bookings
  rating: liamJonsProfile.rating || 5.0,
  responseRate: 98, // Hardcoded for now
  skills: liamJonsProfile.skills ? 
    liamJonsProfile.skills.map(s => s.skill.name) : 
    ["AI Application Design", "ADHD Productivity Tools", "Human-Centered AI", "Next.js Development"],
  availability: {
    status: "limited",
    nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  // Fallback testimonials from people helped
  testimonials: [
    {
      id: "testimonial-1",
      name: "Sarah K.",
      title: "Small Business Owner",
      content: "Liam helped me understand how to use AI in my business in a way that actually made sense. No technical jargon, just practical applications that saved me time and money.",
      imageUrl: "/assets/testimonials/sarah.jpg"
    },
    {
      id: "testimonial-2",
      name: "Marcus T.",
      title: "Marketing Professional with ADHD",
      content: "As someone with ADHD, I&apos;ve always struggled with organization and focus. Liam&apos;s approach to AI implementation has literally changed my life. I now have systems that work with my brain, not against it.",
      imageUrl: "/assets/testimonials/marcus.jpg"
    },
    {
      id: "testimonial-3",
      name: "Jennifer P.",
      title: "Entrepreneur",
      content: "I went from being intimidated by AI to leveraging it daily in my startup. Liam has a gift for making complex technology accessible and human-centered.",
      imageUrl: "/assets/testimonials/jennifer.jpg"
    }
  ],
  // Extract portfolio from the portfolioItems JSON field
  portfolio: liamJonsProfile.portfolioItems || [
    {
      id: "success-1",
      title: "Small Business Transformation",
      description: "Helped a local retail business implement AI for inventory management and customer recommendations, resulting in significant efficiency gains.",
      imageUrl: "/assets/portfolio/retail-business.jpg",
      outcomes: [
        { label: "Time Saved", value: "15 hrs/week", trend: "down" },
        { label: "Revenue", value: "+22%", trend: "up" },
        { label: "Customer Satisfaction", value: "+35%", trend: "up" }
      ],
      tags: ["Small Business", "Retail", "AI Implementation"],
      createdAt: new Date(2024, 3, 15)
    },
    {
      id: "success-2",
      title: "Freelancer Productivity System",
      description: "Designed a custom AI workflow for a freelance designer with ADHD, helping them manage clients and deadlines more effectively.",
      imageUrl: "/assets/portfolio/freelancer.jpg",
      outcomes: [
        { label: "Missed Deadlines", value: "-80%", trend: "down" },
        { label: "Client Capacity", value: "+40%", trend: "up" },
        { label: "Stress Level", value: "-65%", trend: "down" }
      ],
      tags: ["Freelancer", "ADHD", "Productivity"],
      createdAt: new Date(2024, 4, 28)
    },
  ]
};

// Server component to fetch profile data
async function getProfileData() {
  const profile = await getBuilderProfileBySlug('liam-jons');
  const sessionTypes = await getBuilderSessionTypes('liam-jons');
  return { profile, sessionTypes };
}

export default function LiamJonsProfile() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  
  // Get profile data from server component
  const { profile: liamJonsProfile, sessionTypes } = use(getProfileData());
  
  // Format bio with show more/less if longer than 280 characters
  const bioIsTruncated = enhancedProfile.bio && enhancedProfile.bio.length > 280;
  const displayBio = showFullBio ? enhancedProfile.bio : bioIsTruncated ? enhancedProfile.bio.slice(0, 280) + "..." : enhancedProfile.bio;
  
  // Get appropriate availability label and styling
  const availabilityLabel = enhancedProfile.availability ? {
    available: "Available Now",
    limited: "Limited Availability",
    unavailable: "Unavailable"
  }[enhancedProfile.availability.status] : "Availability Unknown";
  
  const availabilityStyle = enhancedProfile.availability ? {
    available: "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30",
    limited: "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    unavailable: "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/30"
  }[enhancedProfile.availability.status] : "text-muted-foreground bg-muted";
  
  // Handle booking of specific session types
  const handleBookSession = (sessionId?: string) => {
    const url = sessionId 
      ? `/book/liam-jons?session=${sessionId}` 
      : "/book/liam-jons";
    router.push(url);
  };
  
  const handleSendMessage = () => {
    router.push("/messages/new?recipient=liam-jons");
  };
  
  return (
    <div className="container max-w-7xl pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 pt-12 pb-20 overflow-hidden rounded-t-lg">
        <Particles
          className="absolute inset-0"
          quantity={100}
          color="#ffffff"
          ease={1}
        />
        
        <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 mb-2">
                  <MultiRoleBadge 
                    roles={[UserRole.BUILDER, UserRole.ADMIN]} 
                    isFounder={enhancedProfile.user?.isFounder || true}
                    size="md"
                  />
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 rounded-md text-sm font-medium">
                    <HeartFilledIcon className="h-4 w-4" />
                    ADHD Specialist
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <TextShimmer>{enhancedProfile.name}</TextShimmer>
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
                    onClick={handleSendMessage}
                    className="gap-2"
                  >
                    <ChatBubbleIcon className="h-5 w-5" />
                    Message Liam
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative h-64 w-64 md:h-80 md:w-80">
                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-background">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600">
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
                  
                  {/* Fallback for avatar image */}
                  <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
                    {liamJonsProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Only try to load image if it exists */}
                  {liamJonsProfile.avatarUrl && (
                    <Image
                      src={liamJonsProfile.avatarUrl}
                      alt={liamJonsProfile.name}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        // Prevent infinite error loop
                        e.currentTarget.onerror = null;
                        // Keep the fallback visible
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                
                <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 shadow-md">
                  <ValidationTierBadge tier={liamJonsProfile.validationTier} size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Content Tabs */}
      <section className="py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="builder" onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-lg mx-auto mb-8">
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <CodeIcon className="h-4 w-4" />
                <span>Builder Profile</span>
              </TabsTrigger>
              <TabsTrigger value="adhd" className="flex items-center gap-2">
                <HeartFilledIcon className="h-4 w-4" />
                <span>ADHD Focus</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="founder" className="flex items-center gap-2">
                <PersonIcon className="h-4 w-4" />
                <span>Founder Story</span>
              </TabsTrigger>
            </TabsList>
          
          {/* Builder profile content */}
          <TabsContent value="builder" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="space-y-8">
                {/* Bio section */}
                <section>
                  <h3 className="text-lg font-medium mb-3">About</h3>
                  <p className="text-muted-foreground">
                    {displayBio}
                    {bioIsTruncated && (
                      <button 
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="ml-1 text-primary hover:underline"
                      >
                        {showFullBio ? "Show less" : "Show more"}
                      </button>
                    )}
                  </p>
                </section>
                
                {/* Availability */}
                <section>
                  <h3 className="text-lg font-medium mb-3">Availability</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${availabilityStyle}`}>
                    {availabilityLabel}
                  </div>
                  {liamJonsProfile.availability?.status === "limited" && (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/weekly-sessions">
                          View Weekly Sessions
                        </Link>
                      </Button>
                    </div>
                  )}
                </section>
                
                {/* ADHD Specialization note */}
                {liamJonsProfile.adhd_focus && (
                  <section>
                    <h3 className="text-lg font-medium mb-3">ADHD Specialization</h3>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                          I specialize in helping people with ADHD and similar neurodivergent traits leverage AI to create personalized systems that work with their unique brain wiring, not against it. My approach focuses on:
                        </p>
                        <ul className="mt-3 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                          <li>Building custom solutions that reduce cognitive load</li>
                          <li>Creating environments that minimize distractions</li>
                          <li>Designing systems that accommodate variable focus levels</li>
                          <li>Implementing effective reminders and memory aids</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </section>
                )}
                
                {/* Skills */}
                <section>
                  <h3 className="text-lg font-medium mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {liamJonsProfile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-muted rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
                
                {/* Social links */}
                {liamJonsProfile.socialLinks && Object.values(liamJonsProfile.socialLinks).some(Boolean) && (
                  <section>
                    <h3 className="text-lg font-medium mb-3">Connect</h3>
                    <div className="flex flex-wrap gap-3">
                      {liamJonsProfile.socialLinks.website && (
                        <a 
                          href={liamJonsProfile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="Website"
                        >
                          <GlobeIcon className="h-5 w-5" />
                        </a>
                      )}
                      {liamJonsProfile.socialLinks.linkedin && (
                        <a 
                          href={liamJonsProfile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="LinkedIn"
                        >
                          <LinkedInLogoIcon className="h-5 w-5" />
                        </a>
                      )}
                      {liamJonsProfile.socialLinks.github && (
                        <a 
                          href={liamJonsProfile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="GitHub"
                        >
                          <GitHubLogoIcon className="h-5 w-5" />
                        </a>
                      )}
                      {liamJonsProfile.socialLinks.twitter && (
                        <a 
                          href={liamJonsProfile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="Twitter"
                        >
                          <TwitterLogoIcon className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </section>
                )}
              </div>
              
              {/* Main content */}
              <div className="lg:col-span-2 space-y-12">
                {/* App Showcase Section */}
                <section>
                  <h3 className="text-xl font-medium mb-6">Applications I&apos;ve Built</h3>
                  <AppShowcase 
                    apps={enhancedProfile.apps}
                    maxDisplay={3}
                  />
                </section>
                
                {/* Portfolio/Client Success Stories */}
                <section>
                  <h3 className="text-xl font-medium mb-6">Client Success Stories</h3>
                  <PortfolioShowcase
                    projects={enhancedProfile.portfolio}
                    maxDisplay={2}
                  />
                </section>
                
                {/* Testimonials */}
                {liamJonsProfile.testimonials && liamJonsProfile.testimonials.length > 0 && (
                  <section>
                    <h3 className="text-xl font-medium mb-6">What People Say</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {enhancedProfile.testimonials.map((testimonial) => (
                        <Card key={testimonial.id} className="h-full">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                                {testimonial.imageUrl && (
                                  <Image
                                    src={testimonial.imageUrl}
                                    alt={testimonial.name}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                              <div>
                                <CardTitle className="text-base">{testimonial.name}</CardTitle>
                                <CardDescription>{testimonial.title}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground italic">&quot;{testimonial.content}&quot;</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}
                
                {/* Call to Action */}
                <section className="mt-10">
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-0">
                    <CardContent className="pt-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                      <div>
                        <h3 className="text-xl font-medium mb-2">Ready to work together?</h3>
                        <p className="text-muted-foreground mb-0 md:mb-0">Book a session and discover how AI can enhance your productivity.</p>
                      </div>
                      <Button 
                        onClick={() => handleBookSession()}
                        className="whitespace-nowrap gap-2"
                        size="lg"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Book a Session
                      </Button>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </div>
          </TabsContent>
          
          {/* ADHD Specialization Tab */}
          <TabsContent value="adhd" className="mt-6">
            <div className="space-y-10">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <h2 className="text-3xl font-bold mb-4">AI Solutions for ADHD</h2>
                <p className="text-lg text-muted-foreground">
                  I specialize in helping people with ADHD and similar neurodivergent traits leverage AI to create personalized systems that work with their unique brain wiring, not against it.
                </p>
              </div>
              
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>My ADHD Approach</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Having experienced the transformative power of properly applied AI in my own life with ADHD, I&apos;m passionate about creating that same opportunity for others. My approach focuses on:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Building custom solutions that reduce cognitive load</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Creating environments that minimize distractions</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Designing systems that accommodate variable focus levels</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Implementing effective reminders and memory aids</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>ADHD-Optimized AI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      I believe AI is at its most powerful when it&apos;s personalized to work with your unique cognitive patterns. For people with ADHD, this means systems that:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Adapt to your energy fluctuations and time awareness challenges</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Provide just-in-time support when executive function falters</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Leverage hyperfocus periods productively while preventing burnout</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Turn what seem like liabilities into unique cognitive assets</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-6">ADHD-Optimized Applications</h3>
                <AppShowcase 
                  apps={enhancedProfile.apps.filter(app => app.adhd_focused)}
                  maxDisplay={6}
                />
              </div>
              
              <div className="bg-muted rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center mt-6">
                <div className="flex-shrink-0 p-3 bg-background rounded-full">
                  <InfoCircledIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Need a Custom ADHD Solution?</h3>
                  <p className="text-muted-foreground mb-4">
                    I can work with you to develop a personalized AI application tailored to your specific ADHD challenges and strengths.
                  </p>
                  <Button onClick={() => handleBookSession("session2")} className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Book an ADHD AI Strategy Session
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Sessions Tab */}
          <TabsContent value="sessions" className="mt-6">
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-bold mb-4">Work With Liam</h2>
                <p className="text-lg text-muted-foreground">
                  Choose from a variety of session formats designed to help you leverage AI effectively in your personal and professional life.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formattedSessionTypes.map((session, index) => (
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
                  onClick={handleSendMessage}
                  className="gap-2"
                >
                  <ChatBubbleIcon className="h-4 w-4" />
                  Inquire About Corporate Training
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Founder story content */}
          <TabsContent value="founder" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main content - Founder story */}
              <div className="lg:col-span-8 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-6">
                    <TextShimmer>My Vision for Buildappswith</TextShimmer>
                  </h2>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      {enhancedProfile.founderBio}
                    </p>
                    
                    <h3 className="text-xl font-medium mt-8 mb-4">Why I Started Buildappswith</h3>
                    <p>
                      Technology has always fascinated me, but I&apos;ve often been frustrated by how inaccessible it can be for most people. When AI began to rapidly advance, I saw both incredible potential and concerning barriers forming. Many were being left behind – especially those who could benefit most from personalized AI solutions, like people with ADHD and other neurodivergent traits.
                    </p>
                    
                    <p>
                      I founded Buildappswith on a simple principle: AI should be a tool that empowers everyone, not just those with technical backgrounds. Our platform aims to bridge that gap by connecting people with builders who can create custom solutions, while also providing accessible education to help anyone understand and utilize AI in their daily lives.
                    </p>
                    
                    <h3 className="text-xl font-medium mt-8 mb-4">Our Approach: Human-Centered AI</h3>
                    <p>
                      At Buildappswith, we believe in putting humans at the center of technology, not the other way around. This means:
                    </p>
                    
                    <ul>
                      <li><strong>AI literacy for everyone</strong> – Explaining capabilities in clear, jargon-free language</li>
                      <li><strong>Practical applications over theory</strong> – Focusing on real-world benefits, not technical details</li>
                      <li><strong>Ethical, transparent development</strong> – Creating systems people can understand and trust</li>
                      <li><strong>Personalization for diverse needs</strong> – Recognizing that one-size-fits-all solutions rarely work</li>
                    </ul>
                    
                    <h3 className="text-xl font-medium mt-8 mb-4">Supporting the Underserved</h3>
                    <p>
                      I&apos;m particularly passionate about helping those who are typically underserved by traditional technology. People with ADHD, for example, often struggle with systems designed for neurotypical minds. Yet with the right AI tools, they can create environments that work harmoniously with their unique cognitive style.
                    </p>
                    
                    <p>
                      This is why we offer free weekly sessions for unemployed individuals, and why we focus on creating a community of builders who understand diverse needs and challenges.
                    </p>
                    
                    <h3 className="text-xl font-medium mt-8 mb-4">Join Our Community</h3>
                    <p>
                      Whether you&apos;re looking to build an app, learn about AI, or contribute your skills as a builder, there&apos;s a place for you in our community. Together, we&apos;re creating a future where technology truly serves human needs and enhances our connections rather than replacing them.
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <Button size="lg" asChild>
                      <Link href="/weekly-sessions">
                        Join Our Weekly Sessions
                      </Link>
                    </Button>
                  </div>
                </section>
              </div>
              
              {/* Sidebar - Mission and contact */}
              <div className="lg:col-span-4 space-y-8">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-muted-foreground/10">
                  <CardHeader>
                    <CardTitle>Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mt-1">
                        <LaptopIcon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Democratize AI</h4>
                        <p className="text-sm text-muted-foreground">Make AI accessible to everyone regardless of technical background or resources</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mt-1">
                        <HeartFilledIcon className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Human-Centered Technology</h4>
                        <p className="text-sm text-muted-foreground">Create technology that enhances human capabilities and connections</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full mt-1">
                        <PersonIcon className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Serve the Underserved</h4>
                        <p className="text-sm text-muted-foreground">Focus on communities traditionally left behind by technological advances</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription>Interested in learning more?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <EnvelopeClosedIcon className="h-5 w-5 text-muted-foreground" />
                      <a href="mailto:liam@buildappswith.ai" className="text-primary hover:underline">
                        liam@buildappswith.ai
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      <Link href="/book/liam-jons" className="text-primary hover:underline">
                        Schedule a call
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <GlobeIcon className="h-5 w-5 text-muted-foreground" />
                      <a href="https://buildappswith.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        buildappswith.ai
                      </a>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Sessions</CardTitle>
                    <CardDescription>Free for unemployed individuals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-full mt-1 flex-shrink-0">
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        <p className="text-sm">The last AI 101 session you&apos;ll ever need to join</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-full mt-1 flex-shrink-0">
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        <p className="text-sm">Build your first app with AI assistance</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-full mt-1 flex-shrink-0">
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        <p className="text-sm">Augment yourself and your business with practical AI applications</p>
                      </li>
                    </ul>
                    
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <Link href="/weekly-sessions">
                        View Session Schedule
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </section>
    </div>
  );
}
