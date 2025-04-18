"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BuilderProfile, BuilderProfileData } from "@/components/profile/builder-profile";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { fetchBuilderById } from "@/lib/marketplace/data-service";
import TextShimmer from "@/components/magicui/text-shimmer";

interface BuilderProfilePageProps {
  params: {
    id: string;
  }
}

export default function BuilderProfilePage({ params }: BuilderProfilePageProps) {
  const router = useRouter();
  const [builder, setBuilder] = useState<BuilderProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadBuilder = async () => {
      setLoading(true);
      try {
        const data = await fetchBuilderById(params.id);
        if (data) {
          setBuilder(data);
        } else {
          setError("Builder not found");
        }
      } catch (err) {
        console.error("Error loading builder profile:", err);
        setError("Failed to load builder profile");
      } finally {
        setLoading(false);
      }
    };
    
    loadBuilder();
  }, [params.id]);
  
  const handleScheduleSession = () => {
    if (builder) {
      router.push(`/schedule/${builder.id}`);
    }
  };
  
  const handleSendMessage = () => {
    if (builder) {
      router.push(`/messages?builder=${builder.id}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container pt-6 pb-12">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
        
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-muted rounded-t-lg" />
            <div className="flex gap-4">
              <div className="h-32 w-32 rounded-full bg-muted" />
              <div className="space-y-2 flex-grow">
                <div className="h-8 bg-muted rounded w-1/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-medium mb-2">{error}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              We couldn&apos;t find the builder profile you&apos;re looking for. They may have removed their profile or it might be temporarily unavailable.
            </p>
            <Button onClick={() => router.push("/marketplace")}>
              Return to Marketplace
            </Button>
          </div>
        ) : builder ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BuilderProfile
              profile={builder}
              onScheduleSession={handleScheduleSession}
              onSendMessage={handleSendMessage}
            />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
