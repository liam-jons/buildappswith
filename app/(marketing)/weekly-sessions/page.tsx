import { Metadata } from "next";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui";

import Link from "next/link";


import { CalendarIcon, UserIcon, Clock2Icon } from "lucide-react";

export const metadata: Metadata = {
  title: "Weekly Sessions | Buildappswith",
  description: "Join our regular AI learning sessions and workshops",
};

// Placeholder session data
const upcomingSessions = [
  {
    id: 1,
    title: "The last AI 101 session you will ever need to join",
    description: "Get a comprehensive introduction to AI concepts and practical applications in this beginner-friendly session.",
    date: "2025-04-30T18:00:00Z",
    duration: 60,
    host: "Liam Jons",
    level: "Beginner",
    isFree: true,
    tags: ["AI Basics", "Introduction"],
    spots: 15,
    spotsLeft: 8,
  },
  {
    id: 2,
    title: "Build your first app with AI assistance",
    description: "Learn how to build a simple but useful application with AI tools helping you along the way.",
    date: "2025-05-05T17:00:00Z",
    duration: 90,
    host: "Liam Jons",
    level: "Beginner",
    isFree: false,
    price: 25,
    tags: ["Development", "Practical"],
    spots: 10,
    spotsLeft: 4,
  },
  {
    id: 3,
    title: "Augment yourself and your business with AI",
    description: "Discover practical applications of AI that can boost your productivity and business outcomes today.",
    date: "2025-05-07T19:00:00Z",
    duration: 75,
    host: "Liam Jons",
    level: "Intermediate",
    isFree: true,
    tags: ["Productivity", "Business"],
    spots: 20,
    spotsLeft: 12,
  },
];

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-UK', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function WeeklySessionsPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Weekly AI Learning Sessions</h1>
        <p className="text-muted-foreground text-lg">
          Join our regular sessions to boost your AI skills and knowledge
        </p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">About Our Weekly Sessions</h2>
        <div className="space-y-4">
          <p>
            At Buildappswith, we host three recurring session types each week to help you better understand
            and leverage AI in your personal and professional life:
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>The last AI 101 session you will ever need to join:</strong> A comprehensive introduction
              to AI concepts, capabilities, and practical applications for complete beginners.
            </li>
            <li>
              <strong>Build your first app:</strong> A hands-on workshop guiding you through creating your
              first AI-powered application, even with limited technical experience.
            </li>
            <li>
              <strong>Augment yourself and your business with AI:</strong> Practical techniques to immediately
              boost your productivity and business outcomes using available AI tools.
            </li>
          </ul>
          <p className="font-medium mt-4">
            All sessions marked as &quot;Free for unemployed&quot; are available at no cost to anyone currently without employment.
            Simply contact us before registering to receive your access code.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Upcoming Sessions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{session.title}</CardTitle>
                  <Badge variant={session.isFree ? "secondary" : "default"}>
                    {session.isFree ? "Free for unemployed" : `£${session.price}`}
                  </Badge>
                </div>
                <CardDescription className="text-sm">{session.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{formatDate(session.date)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock2Icon className="mr-2 h-4 w-4" />
                    <span>{session.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Hosted by {session.host}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">{session.level}</Badge>
                    {session.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mt-4">
                    {session.spotsLeft} of {session.spots} spots remaining
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full">Register Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Interested in future sessions?</h2>
        <p className="mb-6">
          Join our community to get notified when new sessions are scheduled and receive exclusive access to recordings.
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Join the Community</Link>
        </Button>
      </div>
    </div>
  );
}
