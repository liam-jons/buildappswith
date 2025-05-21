"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { mainNavItems } from "./data";
import { NavigationItem, NavbarProps } from "./types";
import { AnimatedSubscribeButton } from "../magicui/animated-subscribe-button";

const INITIAL_WIDTH = "72rem";
const MAX_WIDTH = "1100px";

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 200,
      staggerChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: 100,
    transition: { duration: 0.1 },
  },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    y: -5,
    transition: { duration: 0.1 } 
  }
};

// Viewing Preferences component
function ViewingPreferences({ isMobile = false }: { isMobile?: boolean }) {
  const { theme, setTheme } = useTheme();
  
  if (isMobile) {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center justify-center px-4 py-2 rounded-md hover:bg-secondary/30 transition-colors"
        aria-label="Toggle theme"
      >
        <span className="mr-2">VP</span>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>
    );
  }
  
  return (
    <AnimatedSubscribeButton
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-auto rounded-md bg-secondary/30 hover:bg-secondary/50 text-primary"
      aria-label="Toggle theme"
      subscribeStatus={theme === "dark"}
    >
      <span className="flex items-center">
        <span className="mr-2">Viewing Preferences</span>
        <Sun className="h-4 w-4" />
      </span>
      <span className="flex items-center">
        <span className="mr-2">Viewing Preferences</span>
        <Moon className="h-4 w-4" />
      </span>
    </AnimatedSubscribeButton>
  );
}

export function Navbar({ className }: NavbarProps) {
  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Handle scroll effects
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setHasScrolled(latest > 10);
    });
    return unsubscribe;
  }, [scrollY]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.dropdown-trigger')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  // Toggle mobile menu
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  // Toggle dropdown menu
  const toggleDropdown = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title);
  };

  return (
    <header
      className={cn(
        "sticky z-50 flex justify-center transition-all duration-300",
        hasScrolled ? "top-6" : "top-4",
        className
      )}
    >
      <motion.div
        initial={{ width: INITIAL_WIDTH }}
        animate={{ width: hasScrolled ? MAX_WIDTH : INITIAL_WIDTH }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full"
      >
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-2xl transition-all duration-300 xl:px-0",
            hasScrolled
              ? "px-2 border border-border backdrop-blur-lg bg-background/75"
              : "shadow-none px-7",
          )}
        >
          <div className="flex h-16 items-center justify-between p-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="text-lg font-bold text-primary">BW</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/how-it-works"
                className="text-primary/60 hover:text-primary transition-colors px-3 py-2"
              >
                How It Works
              </Link>
              
              {/* I would like to... dropdown */}
              <div className="relative dropdown-trigger">
                <button 
                  onClick={() => toggleDropdown("I would like to...")}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-md transition-colors",
                    activeDropdown === "I would like to..." 
                      ? "bg-secondary/50 text-primary" 
                      : "hover:bg-secondary/30 text-primary/60 hover:text-primary"
                  )}
                  aria-expanded={activeDropdown === "I would like to..."}
                >
                  I would like to...
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform", 
                    activeDropdown === "I would like to..." ? "rotate-180" : ""
                  )} />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === "I would like to..." && (
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute left-0 mt-2 w-72 rounded-md border border-border bg-card shadow-lg overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        {mainNavItems[0].items?.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-3 rounded-md text-sm hover:bg-secondary/30 transition-colors"
                          >
                            <div className="font-medium">{subItem.title}</div>
                            {subItem.description && (
                              <div className="text-muted-foreground text-xs mt-1">{subItem.description}</div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Link
                href="/marketplace"
                className="text-primary/60 hover:text-primary transition-colors px-3 py-2"
              >
                Marketplace
              </Link>
              
              <Link
                href="/toolkit"
                className="text-primary/60 hover:text-primary transition-colors px-3 py-2"
              >
                Free Toolkit
              </Link>
              
              {/* About Us dropdown */}
              <div className="relative dropdown-trigger">
                <button 
                  onClick={() => toggleDropdown("About Us")}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-md transition-colors",
                    activeDropdown === "About Us" 
                      ? "bg-secondary/50 text-primary" 
                      : "hover:bg-secondary/30 text-primary/60 hover:text-primary"
                  )}
                  aria-expanded={activeDropdown === "About Us"}
                >
                  About Us
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform", 
                    activeDropdown === "About Us" ? "rotate-180" : ""
                  )} />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === "About Us" && (
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute left-0 mt-2 w-72 rounded-md border border-border bg-card shadow-lg overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        {mainNavItems[1].items?.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-3 rounded-md text-sm hover:bg-secondary/30 transition-colors"
                          >
                            <div className="font-medium">{subItem.title}</div>
                            {subItem.description && (
                              <div className="text-muted-foreground text-xs mt-1">{subItem.description}</div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-4">
              <ViewingPreferences />
              
              <Link
                href="/sign-in"
                className="hidden md:block text-primary/70 hover:text-primary transition-colors border border-border rounded-lg px-4 py-2"
              >
                Sign In
              </Link>
              
              <Link
                href="/sign-up"
                className="bg-primary text-white hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden border border-border size-10 rounded-md flex items-center justify-center"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              className="fixed inset-x-0 w-[95%] mx-auto bottom-3 bg-background border border-border p-4 rounded-xl shadow-lg z-50 max-h-[85vh] overflow-y-auto"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={drawerVariants}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-primary">BuildAppsWith</div>
                  </Link>
                  <button
                    onClick={toggleMobileMenu}
                    className="border border-border rounded-md p-1"
                    aria-label="Close menu"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {mainNavItems.map((item) => (
                    <div key={item.title} className="border border-border rounded-md overflow-hidden">
                      {item.items ? (
                        <MobileDropdownItem item={item} onClose={() => setIsMobileMenuOpen(false)} />
                      ) : (
                        <Link
                          href={item.href || '/'}
                          className="block p-3 hover:bg-secondary/30 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-2 mt-2">
                  <ViewingPreferences isMobile={true} />
                  
                  <Link
                    href="/sign-in"
                    className="text-center py-2 text-primary/80 hover:text-primary transition-colors border border-border rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-primary text-white hover:bg-primary/90 text-center py-3 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// Mobile dropdown component
function MobileDropdownItem({ 
  item, 
  onClose 
}: { 
  item: NavigationItem; 
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className="w-full p-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{item.title}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform", 
          isOpen ? "rotate-180" : ""
        )} />
      </button>
      
      {isOpen && item.items && (
        <div className="border-t border-border bg-secondary/10">
          {item.items.map((subItem) => (
            <Link
              key={subItem.title}
              href={subItem.href}
              className="block p-3 hover:bg-secondary/30 transition-colors"
              onClick={onClose}
            >
              <div className="font-medium">{subItem.title}</div>
              {subItem.description && (
                <div className="text-muted-foreground text-xs mt-1">{subItem.description}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}export default Navbar;
