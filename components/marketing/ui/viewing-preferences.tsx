"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/core/switch";
import { Label } from "@/components/ui/core/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/core/popover";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";

interface ViewingPreferencesProps {
  variant?: "default" | "icon" | "minimal";
  className?: string;
  buttonClassName?: string;
  iconOnly?: boolean;
}

function ViewingPreferences({
  variant = "default",
  className,
  buttonClassName,
  iconOnly = false,
}: ViewingPreferencesProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dyslexicMode, setDyslexicMode] = useState(false);

  // Use refs to track the previous state without triggering re-renders
  const isUpdatingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  // Load initial preferences only once after mounting
  useEffect(() => {
    if (initialLoadDoneRef.current) return;

    setMounted(true);

    // Check for stored dyslexic mode preference
    if (typeof window !== 'undefined') {
      try {
        const storedDyslexicMode = localStorage.getItem("dyslexic-mode");
        if (storedDyslexicMode) {
          const isDyslexicMode = storedDyslexicMode === "true";
          setDyslexicMode(isDyslexicMode);

          // Apply classes directly in the initial effect
          if (isDyslexicMode) {
            document.body.classList.add('dyslexic-mode');
            document.documentElement.classList.add('dyslexic-mode');
          } else {
            document.body.classList.remove('dyslexic-mode');
            document.documentElement.classList.remove('dyslexic-mode');
          }
        }
      } catch (e) {
        console.error("Error reading dyslexic mode preference:", e);
      }

      initialLoadDoneRef.current = true;
    }
  }, []);

  // Memoized handler for dyslexic mode changes to avoid re-creating on every render
  const handleDyslexicModeChange = useCallback((enabled: boolean) => {
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    try {
      setDyslexicMode(enabled);

      if (enabled) {
        document.body.classList.add('dyslexic-mode');
        document.documentElement.classList.add('dyslexic-mode');
      } else {
        document.body.classList.remove('dyslexic-mode');
        document.documentElement.classList.remove('dyslexic-mode');
      }

      // Store the preference
      localStorage.setItem("dyslexic-mode", enabled.toString());
    } catch (e) {
      console.error("Error updating dyslexic mode:", e);
    } finally {
      isUpdatingRef.current = false;
    }
  }, []);

  // Separate effect to handle dyslexic mode changes - REMOVED to prevent potential loops
  // The dyslexic mode is now fully handled by the handleDyslexicModeChange callback

  if (!mounted) return null;

  if (variant === "icon") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-md border border-border bg-accent/50 text-primary",
              buttonClassName
            )}
            aria-label="Toggle viewing preferences"
          >
            {theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ViewingPreferencesContent 
            theme={theme} 
            setTheme={setTheme} 
            dyslexicMode={dyslexicMode} 
            setDyslexicMode={setDyslexicMode} 
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === "minimal") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold",
              buttonClassName
            )}
            aria-label="Toggle viewing preferences"
          >
            VP
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ViewingPreferencesContent 
            theme={theme} 
            setTheme={setTheme} 
            dyslexicMode={dyslexicMode} 
            setDyslexicMode={setDyslexicMode} 
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Default variant
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-9 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm font-medium",
            "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
            iconOnly ? "w-9 p-0 flex items-center justify-center" : "",
            buttonClassName
          )}
          aria-label="Toggle viewing preferences"
        >
          {iconOnly ? (
            theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />
          ) : (
            "Viewing Preferences"
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <ViewingPreferencesContent 
          theme={theme} 
          setTheme={setTheme} 
          dyslexicMode={dyslexicMode} 
          setDyslexicMode={setDyslexicMode} 
        />
      </PopoverContent>
    </Popover>
  );
}

// The content of the preferences popover, extracted for reuse
function ViewingPreferencesContent({
  theme,
  setTheme,
  dyslexicMode,
  setDyslexicMode
}: {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  dyslexicMode: boolean;
  setDyslexicMode: (enabled: boolean) => void;
}) {
  // Memoized handler to avoid recreation on every render
  const handleDyslexicModeChange = useCallback((enabled: boolean) => {
    setDyslexicMode(enabled);
  }, [setDyslexicMode]);
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Viewing Preferences</h4>
        <p className="text-sm text-muted-foreground">
          Customise your viewing experience with these options.
        </p>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
            <Label htmlFor="theme-mode">Dark Mode</Label>
          </div>
          <Switch
            id="theme-mode"
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.60007 2.09998C3.60007 2.70003 4.08235 3.17897 4.72275 3.24449L5.00007 3.26904V2.09998H3.60007ZM5.00007 1.09998V0.0999756H3.50007V1.09998H5.00007ZM6.00007 0.0999756V1.09998L6.60007 1.09998C7.25259 1.09998 7.92308 1.20847 8.54182 1.41333L5.54064 10.4123L6.00007 11.8H8.00007V10.8H6.53384L9.45444 2.09998H10.8001V0.0999756H6.00007ZM11.8001 0.0999756V1.09998H13.8001V2.09998H11.8001V3.09998H13.8001V4.09997H11.8001V5.09997H13.8001V6.09997H11.8001V7.09997H13.8001V8.09997H11.8001V9.09997H13.8001V10.1H11.8001V11.1H13.8001V12.1H11.8001V13.1H13.8001V14.1H11.8001V14.9H14.7001V0.0999756H11.8001ZM0.900024 2.09998V14.9H3.80002V4.09997H1.90002V2.09998H0.900024Z" fill="currentColor"/>
            </svg>
            <Label htmlFor="dyslexic-mode">Dyslexic friendly</Label>
          </div>
          <Switch
            id="dyslexic-mode"
            checked={dyslexicMode}
            onCheckedChange={handleDyslexicModeChange}
          />
        </div>
      </div>
    </div>
  );
}

export default ViewingPreferences;