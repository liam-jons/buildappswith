"use client";

import { useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BuilderProfile, BuilderProfileData } from "@/components/profile/builder-profile";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { fetchBuilderById } from "@/lib/marketplace/data-service";
import { fetchAppsByBuilderId } from "@/lib/marketplace/app-service";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { AppItem } from "@/components/profile/app-showcase";

// Define our state shape
interface ProfileState {
  builder: BuilderProfileData | null;
  apps: AppItem[];
  loading: boolean;
  error: string | null;
}

// Define the actions for our reducer
type ProfileAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_BUILDER_SUCCESS'; payload: BuilderProfileData }
  | { type: 'FETCH_APPS_SUCCESS'; payload: AppItem[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'MERGE_DATA' };

// Initial state
const initialState: ProfileState = {
  builder: null,
  apps: [],
  loading: true,
  error: null
};

// Reducer function to handle state updates
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_BUILDER_SUCCESS':
      return { 
        ...state, 
        builder: action.payload,
        loading: false
      };
    case 'FETCH_APPS_SUCCESS':
      return { 
        ...state, 
        apps: action.payload 
      };
    case 'FETCH_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      };
    case 'MERGE_DATA':
      return {
        ...state,
        builder: state.builder ? {
          ...state.builder,
          apps: state.apps
        } : null
      };
    default:
      return state;
  }
}

interface BuilderProfileClientProps {
  builderId: string;
}

export default function BuilderProfileClient({ builderId }: BuilderProfileClientProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { builder, apps, loading, error } = state;
  
  // Fetch builder profile data
  useEffect(() => {
    async function loadBuilderData() {
      dispatch({ type: 'FETCH_START' });
      
      try {
        const builderData = await fetchBuilderById(builderId);
        
        if (!builderData) {
          dispatch({ type: 'FETCH_ERROR', payload: "Builder not found" });
          return;
        }
        
        dispatch({ type: 'FETCH_BUILDER_SUCCESS', payload: builderData });
      } catch (err) {
        console.error("Error loading builder profile:", err);
        dispatch({ type: 'FETCH_ERROR', payload: "Failed to load builder profile" });
      }
    }
    
    loadBuilderData();
  }, [builderId]);
  
  // Fetch apps separately
  useEffect(() => {
    async function loadAppsData() {
      try {
        const appsData = await fetchAppsByBuilderId(builderId);
        if (appsData && appsData.length > 0) {
          dispatch({ type: 'FETCH_APPS_SUCCESS', payload: appsData });
        }
      } catch (appError) {
        console.error("Error loading apps:", appError);
        // Don't fail the whole page if apps can't be loaded
      }
    }
    
    if (!loading && !error) {
      loadAppsData();
    }
  }, [builderId, loading, error]);
  
  // Merge apps data into builder profile when apps data is loaded
  useEffect(() => {
    if (builder && apps.length > 0) {
      dispatch({ type: 'MERGE_DATA' });
    }
  }, [builder, apps]);
  
  const handleScheduleSession = () => {
    if (builder) {
      router.push(`/book/${builder.id}`);
    }
  };
  
  const handleSendMessage = () => {
    if (builder) {
      router.push(`/messages?builder=${builder.id}`);
    }
  };
  
  const handleAddApp = () => {
    if (builder) {
      router.push(`/profile/apps/create?builderId=${builder.id}`);
    }
  };
  
  const handleViewAllApps = () => {
    if (builder) {
      router.push(`/profile/apps?builderId=${builder.id}`);
    }
  };
  
  const handleAddProject = () => {
    if (builder) {
      router.push(`/profile/portfolio/create?builderId=${builder.id}`);
    }
  };
  
  const handleViewAllProjects = () => {
    if (builder) {
      router.push(`/profile/portfolio?builderId=${builder.id}`);
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
              onAddApp={handleAddApp}
              onViewAllApps={handleViewAllApps}
              onAddProject={handleAddProject}
              onViewAllProjects={handleViewAllProjects}
            />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}