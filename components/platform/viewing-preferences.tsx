"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/core/switch";
import { Label } from "@/components/ui/core/label";
import { Slider } from "@/components/ui/core/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/core/popover";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon, SettingsIcon } from "lucide-react";

interface ViewingPreferencesProps {
  variant?: "default" | "icon" | "minimal";
  className?: string;
  buttonClassName?: string;
  iconOnly?: boolean;
}

interface PreferencesState {
  theme: "standard" | "dyslexic" | "cyberpunk";
  darkMode: boolean;
  fontSize: number; // 70-130 percentage
  reducedMotion: boolean;
}

const themeDefaults = {
  standard: { fontSize: 100 },
  dyslexic: { fontSize: 90 },
  cyberpunk: { fontSize: 100 }
};

function ViewingPreferences({
  variant = "default",
  className,
  buttonClassName,
  iconOnly = false,
}: ViewingPreferencesProps) {
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesState>({
    theme: "standard",
    darkMode: false,
    fontSize: 100,
    reducedMotion: false
  });

  // Use refs to track the previous state without triggering re-renders
  const isUpdatingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  // Load initial preferences only once after mounting
  useEffect(() => {
    if (initialLoadDoneRef.current) return;

    setMounted(true);

    // Check for stored preferences
    if (typeof window !== 'undefined') {
      try {
        const currentDarkMode = systemTheme === "dark";
        const storedPreferences = localStorage.getItem("viewing-preferences");
        if (storedPreferences) {
          const parsedPreferences = JSON.parse(storedPreferences);
          setPreferences(parsedPreferences);
          applyAllPreferences(parsedPreferences);
        } else {
          // Check for legacy preferences for backward compatibility
          const storedDyslexicMode = localStorage.getItem("dyslexic-mode");
          if (storedDyslexicMode === "true") {
            const legacyPreferences: PreferencesState = {
              theme: "dyslexic",
              darkMode: currentDarkMode,
              fontSize: 90,
              reducedMotion: false
            };
            setPreferences(legacyPreferences);
            applyAllPreferences(legacyPreferences);
          } else {
            // Set initial state with current dark mode
            const initialPreferences: PreferencesState = {
              theme: "standard",
              darkMode: currentDarkMode,
              fontSize: 100,
              reducedMotion: false
            };
            setPreferences(initialPreferences);
          }
        }
      } catch (e) {
        console.error("Error reading preferences:", e);
      }

      initialLoadDoneRef.current = true;
    }
  }, [systemTheme]);

  const applyAllPreferences = useCallback((prefs: PreferencesState) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      // Remove all theme classes first
      document.documentElement.classList.remove(
        'theme-standard',
        'theme-dyslexic',
        'theme-cyberpunk',
        'reduced-motion'
      );
      
      // Remove old dyslexic classes for compatibility
      document.documentElement.classList.remove(
        'dyslexic-mode',
        'dyslexic-font',
        'dyslexic-size',
        'dyslexic-colors',
        'dyslexic-claude',
        'dyslexic-contrast',
        'dyslexic-warm',
        'dyslexic-cool'
      );

      // Apply theme class
      document.documentElement.classList.add(`theme-${prefs.theme}`);
      
      // Apply reduced motion if enabled
      if (prefs.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      }

      // Apply font size
      document.documentElement.style.setProperty('--user-font-scale', (prefs.fontSize / 100).toString());

      // Apply dark mode
      setSystemTheme(prefs.darkMode ? "dark" : "light");

      // Save preferences
      localStorage.setItem('viewing-preferences', JSON.stringify(prefs));
    } catch (e) {
      console.error("Error applying preferences:", e);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [setSystemTheme]);

  const handleThemeChange = useCallback((theme: PreferencesState['theme']) => {
    const newPreferences: PreferencesState = {
      ...preferences,
      theme,
      fontSize: themeDefaults[theme].fontSize
    };
    setPreferences(newPreferences);
    applyAllPreferences(newPreferences);
  }, [preferences, applyAllPreferences]);

  const handlePreferenceChange = useCallback(<K extends keyof PreferencesState>(
    key: K,
    value: PreferencesState[K]
  ) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };
    setPreferences(newPreferences);
    applyAllPreferences(newPreferences);
  }, [preferences, applyAllPreferences]);

  if (!mounted) return null;

  const renderButton = () => {
    switch (variant) {
      case "icon":
        return (
          <button
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-md border border-border bg-accent/50 text-primary",
              buttonClassName
            )}
            aria-label="Toggle viewing preferences"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        );
      case "minimal":
        return (
          <button
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold",
              buttonClassName
            )}
            aria-label="Toggle viewing preferences"
          >
            VP
          </button>
        );
      default:
        return (
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
              <SettingsIcon className="h-4 w-4" />
            ) : (
              "Viewing Preferences"
            )}
          </button>
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {renderButton()}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-6">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Viewing Preferences</h4>
            <p className="text-sm text-muted-foreground">
              Customise your viewing experience
            </p>
          </div>
          
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="space-y-2">
              <button
                onClick={() => handleThemeChange("standard")}
                className={cn(
                  "w-full text-left p-3 rounded-md border transition-colors",
                  preferences.theme === "standard" 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:bg-accent"
                )}
              >
                <div className="font-medium">Standard</div>
                <div className="text-xs text-muted-foreground">Default theme with regular fonts</div>
              </button>
              
              <button
                onClick={() => handleThemeChange("dyslexic")}
                className={cn(
                  "w-full text-left p-3 rounded-md border transition-colors",
                  preferences.theme === "dyslexic" 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:bg-accent"
                )}
              >
                <div className="font-medium">Dyslexic-friendly</div>
                <div className="text-xs text-muted-foreground">OpenDyslexic font with adjusted sizing</div>
              </button>
              
              <button
                onClick={() => handleThemeChange("cyberpunk")}
                className={cn(
                  "w-full text-left p-3 rounded-md border transition-colors",
                  preferences.theme === "cyberpunk" 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:bg-accent"
                )}
              >
                <div className="font-medium">Cyber Punk</div>
                <div className="text-xs text-muted-foreground">Futuristic theme with neon accents</div>
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4 pt-3 border-t">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {preferences.darkMode ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={preferences.darkMode}
                onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">Font Size</Label>
                <span className="text-sm text-muted-foreground">{preferences.fontSize}%</span>
              </div>
              <Slider
                id="font-size"
                min={70}
                max={130}
                step={5}
                value={[preferences.fontSize]}
                onValueChange={([value]) => handlePreferenceChange('fontSize', value)}
                className="w-full"
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1576 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1576 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM5 7C5 5.89543 5.89543 5 7 5C8.10457 5 9 5.89543 9 7C9 8.10457 8.10457 9 7 9C5.89543 9 5 8.10457 5 7Z" fill="currentColor"/>
                </svg>
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
              </div>
              <Switch
                id="reduced-motion"
                checked={preferences.reducedMotion}
                onCheckedChange={(checked) => handlePreferenceChange('reducedMotion', checked)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ViewingPreferences;