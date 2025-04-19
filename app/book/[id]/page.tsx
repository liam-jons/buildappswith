"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Session types with pricing
const sessionTypes = [
  {
    id: "individual-1-to-1",
    title: "Individuals - 1-to-1",
    description: "Personal one-to-one session to discuss your specific AI needs",
    price: 99,
    duration: 60
  },
  {
    id: "individual-group",
    title: "Individuals - Group",
    description: "Join a small group session with other individuals interested in AI",
    price: 49,
    duration: 90
  },
  {
    id: "business-1-to-1",
    title: "Businesses - 1-to-1",
    description: "Focused session for businesses to discuss AI implementation strategies",
    price: 199,
    duration: 60
  },
  {
    id: "business-group",
    title: "Businesses - Group",
    description: "Group session for businesses to learn about AI applications",
    price: 99,
    duration: 90
  }
];

// Available time slots (demo data)
const availableSlots = [
  { date: "2025-04-22", times: ["10:00", "14:00", "16:00"] },
  { date: "2025-04-23", times: ["09:00", "13:00", "15:00"] },
  { date: "2025-04-24", times: ["11:00", "14:00", "17:00"] },
  { date: "2025-04-25", times: ["10:00", "12:00", "16:00"] },
  { date: "2025-04-26", times: ["09:00", "13:00", "15:00"] }
];

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedSession || !selectedDate || !selectedTime) {
      alert("Please select a session type, date, and time");
      return;
    }

    setIsLoading(true);

    try {
      // Get the selected session details
      const session = sessionTypes.find(s => s.id === selectedSession);

      if (!session) {
        throw new Error("Session type not found");
      }

      // Calculate start and end times
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(startTime.getTime() + session.duration * 60000);

      // Prepare booking data
      const bookingData = {
        builderId: params.id,
        clientId: "temp-client-id", // In a real app, this would come from the authenticated user
        sessionTypeId: session.id,
        title: session.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: "PENDING"
      };

      // Initialize Stripe checkout
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingData,
          returnUrl: `${window.location.origin}/book/${params.id}/confirmation`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error processing your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Book a Session</h1>

      <Tabs defaultValue="session" className="space-y-8">
        <TabsList>
          <TabsTrigger value="session">1. Select Session Type</TabsTrigger>
          <TabsTrigger value="datetime" disabled={!selectedSession}>2. Select Date & Time</TabsTrigger>
          <TabsTrigger value="confirm" disabled={!selectedSession || !selectedDate || !selectedTime}>3. Confirm</TabsTrigger>
        </TabsList>

        {/* Session Type Selection */}
        <TabsContent value="session" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionTypes.map((session) => (
              <Card 
                key={session.id} 
                className={`cursor-pointer transition-all ${selectedSession === session.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => setSelectedSession(session.id)}
              >
                <CardHeader>
                  <CardTitle>{session.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{session.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{session.duration} minutes</span>
                    </div>
                    <p className="font-bold">${session.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              disabled={!selectedSession} 
              onClick={() => (document.querySelector('[data-value="datetime"]') as HTMLElement)?.click()}
              type="button"
            >
              Next: Select Date & Time
            </Button>
          </div>
        </TabsContent>

        {/* Date & Time Selection */}
        <TabsContent value="datetime" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Select a Date</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.date}
                  variant={selectedDate === slot.date ? "default" : "outline"}
                  className="flex flex-col h-auto py-3"
                  onClick={() => {
                    setSelectedDate(slot.date);
                    setSelectedTime(null);
                  }}
                  type="button"
                >
                  <CalendarIcon className="h-4 w-4 mb-1" />
                  <span>{formatDate(slot.date)}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Select a Time</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.find(slot => slot.date === selectedDate)?.times.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    type="button"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => (document.querySelector('[data-value="session"]') as HTMLElement)?.click()}
              type="button"
            >
              Back
            </Button>
            <Button 
              disabled={!selectedDate || !selectedTime} 
              onClick={() => (document.querySelector('[data-value="confirm"]') as HTMLElement)?.click()}
              type="button"
            >
              Next: Confirm Booking
            </Button>
          </div>
        </TabsContent>

        {/* Confirmation */}
        <TabsContent value="confirm">
          {selectedSession && selectedDate && selectedTime && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Your Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="font-medium">Session Type</p>
                  <p className="text-muted-foreground">
                    {sessionTypes.find(s => s.id === selectedSession)?.title}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground">
                    {formatDate(selectedDate)} at {selectedTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Duration</p>
                  <p className="text-muted-foreground">
                    {sessionTypes.find(s => s.id === selectedSession)?.duration} minutes
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Price</p>
                  <p className="text-xl font-bold">
                    ${sessionTypes.find(s => s.id === selectedSession)?.price}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => (document.querySelector('[data-value="datetime"]') as HTMLElement)?.click()}
                  type="button"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleCheckout} 
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? "Processing..." : "Proceed to Payment"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
