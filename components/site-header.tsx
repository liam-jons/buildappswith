"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlignJustify, XIcon, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { LoginButton } from "@/components/auth/login-button";
import { UserProfile } from "@/components/auth/user-profile";
import { useSession } from "next-auth/react";

// Core platform components
const platformItems = [
  {
    id: 1,
    label: "Builder Marketplace",
    href: "/marketplace",
    description: "Find validated AI app builders for your project"
  },
  {
    id: 2,
    label: "AI Learning Hub",
    href: "/learning",
    description: "Develop practical AI skills through structured paths"
  },
  {
    id: 3,
    label: "What AI Can/Can't Do",
    href: "/ai-timeline",
    description: "Explore our living timeline of AI capabilities"
  },
  {
    id: 4,
    label: "Community Exchange",
    href: "/community",
    description: "Connect with other learners and builders"
  },
];

// Role-based navigation paths
const roleBasedItems = [
  {
    id: 1,
    label: "For Clients",
    href: "/for-clients",
    description: "Commission affordable custom apps"
  },
  {
    id: 2,
    label: "For Learners",
    href: "/for-learners",
    description: "Start your AI literacy journey"
  },
  {
    id: 3,
    label: "For Builders",
    href: "/for-builders",
    description: "Showcase your skills and find opportunities"
  }
];

// About section navigation
const aboutItems = [
  {
    id: 1,
    label: "About Us",
    href: "/about",
    description: "Our mission to democratize AI"
  },
  {
    id: 2,
    label: "Contact",
    href: "/contact",
    description: "Get in touch with our team"
  }
];

export function SiteHeader() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const mobilenavbarVariant = {
    initial: {
      opacity: 0,
      scale: 1,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        delay: 0.2,
        ease: "easeOut",
      },
    },
  };

  const mobileLinkVar = {
    initial: {
      y: "-20px",
      opacity: 0,
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);

  // Create refs for dropdown menus
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const rolesDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for dropdowns
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  
  // Click outside handlers for dropdowns
  useOnClickOutside(platformDropdownRef, () => setPlatformDropdownOpen(false));
  useOnClickOutside(rolesDropdownRef, () => setRolesDropdownOpen(false));
  useOnClickOutside(aboutDropdownRef, () => setAboutDropdownOpen(false));
  
  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, setDropdown: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (e.key === "Escape") {
      setDropdown(false);
    }
  };
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.classList.toggle("overflow-hidden", hamburgerMenuIsOpen);
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);
    window.addEventListener("orientationchange", closeHamburgerNavigation);
    window.addEventListener("resize", closeHamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation);
      window.removeEventListener("resize", closeHamburgerNavigation);
    };
  }, [setHamburgerMenuIsOpen]);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in border-b opacity-0 backdrop-blur-[12px] [--animation-delay:600ms]">
        <div className="container flex h-[3.5rem] items-center justify-between">
          <Link className="text-md flex items-center font-semibold" href="/">
            Buildappswith
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="mx-4 hidden md:flex space-x-4 items-center">
            {/* Platform dropdown */}
            <div ref={platformDropdownRef} className="relative">
              <button
                onClick={() => {
                  setPlatformDropdownOpen(!platformDropdownOpen);
                  setRolesDropdownOpen(false);
                  setAboutDropdownOpen(false);
                }}
                onKeyDown={(e) => handleKeyDown(e, setPlatformDropdownOpen)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  platformDropdownOpen ? "bg-slate-100 dark:bg-slate-800" : ""
                )}
                aria-expanded={platformDropdownOpen}
                aria-haspopup="true"
              >
                Platform
                <ChevronDown size={16} className={cn("transition-transform", platformDropdownOpen ? "rotate-180" : "")} />
              </button>
              <AnimatePresence>
                {platformDropdownOpen && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 w-64 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {platformItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            "block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                            pathname === item.href ? "bg-slate-100 dark:bg-slate-800" : ""
                          )}
                        >
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Roles dropdown */}
            <div ref={rolesDropdownRef} className="relative">
              <button
                onClick={() => {
                  setRolesDropdownOpen(!rolesDropdownOpen);
                  setPlatformDropdownOpen(false);
                  setAboutDropdownOpen(false);
                }}
                onKeyDown={(e) => handleKeyDown(e, setRolesDropdownOpen)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  rolesDropdownOpen ? "bg-slate-100 dark:bg-slate-800" : ""
                )}
                aria-expanded={rolesDropdownOpen}
                aria-haspopup="true"
              >
                I am a...
                <ChevronDown size={16} className={cn("transition-transform", rolesDropdownOpen ? "rotate-180" : "")} />
              </button>
              <AnimatePresence>
                {rolesDropdownOpen && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 w-64 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {roleBasedItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            "block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                            pathname === item.href ? "bg-slate-100 dark:bg-slate-800" : ""
                          )}
                        >
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About dropdown */}
            <div ref={aboutDropdownRef} className="relative">
              <button
                onClick={() => {
                  setAboutDropdownOpen(!aboutDropdownOpen);
                  setPlatformDropdownOpen(false);
                  setRolesDropdownOpen(false);
                }}
                onKeyDown={(e) => handleKeyDown(e, setAboutDropdownOpen)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  aboutDropdownOpen ? "bg-slate-100 dark:bg-slate-800" : ""
                )}
                aria-expanded={aboutDropdownOpen}
                aria-haspopup="true"
              >
                About
                <ChevronDown size={16} className={cn("transition-transform", aboutDropdownOpen ? "rotate-180" : "")} />
              </button>
              <AnimatePresence>
                {aboutDropdownOpen && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1 w-64 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {aboutItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            "block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                            pathname === item.href ? "bg-slate-100 dark:bg-slate-800" : ""
                          )}
                        >
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="ml-auto flex h-full items-center">
            <div className="flex items-center gap-4">
              {/* Authentication components */}
              <div className="flex items-center gap-3">
                {(() => {
                  const { data: session, status } = useSession();
                  return status === "loading" ? (
                    <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                  ) : session?.user ? (
                    <UserProfile />
                  ) : (
                    <>
                      <LoginButton variant="login" className="mr-2" />
                      <LoginButton variant="signup" />
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <button
            className="ml-6 md:hidden"
            onClick={() => setHamburgerMenuIsOpen((open) => !open)}
            aria-label="Toggle mobile menu"
            aria-expanded={hamburgerMenuIsOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Toggle menu</span>
            {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        <motion.nav
          initial="initial"
          exit="exit"
          variants={mobilenavbarVariant}
          animate={hamburgerMenuIsOpen ? "animate" : "exit"}
          className={cn(
            `fixed left-0 top-0 z-50 h-screen w-full overflow-auto bg-background/70 backdrop-blur-[12px] `,
            {
              "pointer-events-none": !hamburgerMenuIsOpen,
            }
          )}
          id="mobile-menu"
          aria-label="Mobile navigation"
        >
          <div className="container flex h-[3.5rem] items-center justify-between">
            <Link className="text-md flex items-center font-semibold" href="/">
              Buildappswith
            </Link>

            <button
              className="ml-6 md:hidden"
              onClick={() => setHamburgerMenuIsOpen((open) => !open)}
              aria-label="Close mobile menu"
            >
              <span className="sr-only">Close menu</span>
              {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
            </button>
          </div>
          
          {/* Mobile Navigation Structure */}
          <div className="container py-4">
            {/* Platform Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">Platform</h2>
              <motion.ul
                className={`flex flex-col ease-in rounded-lg overflow-hidden bg-slate-100/50 dark:bg-slate-800/50`}
                variants={containerVariants}
                initial="initial"
                animate={hamburgerMenuIsOpen ? "open" : "exit"}
              >
                {platformItems.map((item) => (
                  <motion.li
                    variants={mobileLinkVar}
                    key={item.id}
                    className="border-b border-slate-200 dark:border-slate-700 last:border-none"
                  >
                    <Link
                      className={`hover:bg-slate-200 dark:hover:bg-slate-700 flex w-full flex-col p-4 transition-colors ${pathname === item.href ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                      href={item.href}
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">{item.description}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            
            {/* Roles Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">I am a...</h2>
              <motion.ul
                className={`flex flex-col ease-in rounded-lg overflow-hidden bg-slate-100/50 dark:bg-slate-800/50`}
                variants={containerVariants}
                initial="initial"
                animate={hamburgerMenuIsOpen ? "open" : "exit"}
              >
                {roleBasedItems.map((item) => (
                  <motion.li
                    variants={mobileLinkVar}
                    key={item.id}
                    className="border-b border-slate-200 dark:border-slate-700 last:border-none"
                  >
                    <Link
                      className={`hover:bg-slate-200 dark:hover:bg-slate-700 flex w-full flex-col p-4 transition-colors ${pathname === item.href ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                      href={item.href}
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">{item.description}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            
            {/* About Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">About</h2>
              <motion.ul
                className={`flex flex-col ease-in rounded-lg overflow-hidden bg-slate-100/50 dark:bg-slate-800/50`}
                variants={containerVariants}
                initial="initial"
                animate={hamburgerMenuIsOpen ? "open" : "exit"}
              >
                {aboutItems.map((item) => (
                  <motion.li
                    variants={mobileLinkVar}
                    key={item.id}
                    className="border-b border-slate-200 dark:border-slate-700 last:border-none"
                  >
                    <Link
                      className={`hover:bg-slate-200 dark:hover:bg-slate-700 flex w-full flex-col p-4 transition-colors ${pathname === item.href ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                      href={item.href}
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">{item.description}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            
            {/* Authentication Section */}
            <div className="mt-8 flex flex-col gap-4">
              {/* Show user profile when logged in, otherwise show login/signup buttons */}
              {(() => {
                const { data: session, status } = useSession();
                return status === "loading" ? (
                  <div className="w-full flex justify-center">
                    <div className="h-10 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                  </div>
                ) : session?.user ? (
                  <div className="w-full flex justify-center">
                    <UserProfile />
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-2">
                    <LoginButton variant="login" className="w-full" />
                    <LoginButton variant="signup" className="w-full" />
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
