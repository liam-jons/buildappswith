"use client";

import { buttonVariants } from "@/components/ui/core/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlignJustify, XIcon, ChevronDown, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { useAuth, useUser, useSignOut } from "@/lib/auth/hooks";
import { UserRole } from "@/lib/auth/types";
import ViewingPreferences from "@/components/platform/viewing-preferences";
import { AuroraText } from "@/components/magicui/aurora-text";

// Role-based navigation paths
const defaultRoleBasedItems = [
  {
    id: 1,
    label: "Learn how to benefit instantly from AI",
    href: "/toolkit",
    description: "Practical guidance for immediate AI adoption"
  },
  {
    id: 2,
    label: "Learn to build a business with AI",
    href: "/marketplace",
    description: "Turn AI skills into entrepreneurial opportunities"
  },
  {
    id: 3,
    label: "Pay someone to build an app for me",
    href: "/marketplace",
    description: "Connect with skilled AI developers"
  },
  {
    id: 4,
    label: "Teach others how to benefit from AI",
    href: "/how-it-works",
    description: "Share your expertise and help others grow"
  }
];

// About section navigation
const defaultAboutItems = [
  {
    id: 1,
    label: "Our Mission",
    href: "/about",
    description: "Our mission to democratise AI"
  },
  {
    id: 2,
    label: "Contact",
    href: "/contact",
    description: "Get in touch with our team"
  }
];

// User menu items based on role
const getUserMenuItems = (roles: UserRole[] | undefined, userId?: string) => {
  const commonItems = [
    {
      id: 1,
      label: "Profile",
      href: "/profile",
      description: "Manage your account settings",
    },
    {
      id: 2,
      label: "Dashboard",
      href: "/dashboard",
      description: "View your dashboard",
    },
  ];

  const roleSpecificItems = [];

  if (roles?.includes(UserRole.CLIENT)) {
    roleSpecificItems.push({
      id: 3,
      label: "My Projects",
      href: "/dashboard",
      description: "Manage your app development projects",
    },
    {
      id: 4,
      label: "Become a Builder",
      href: "/marketplace",
      description: "Explore the marketplace and become a builder",
    });
  }
  
  if (roles?.includes(UserRole.BUILDER)) {
    roleSpecificItems.push({
      id: 3,
      label: "My Builder Profile",
      href: `/marketplace/builders/${userId}`,
      description: "View your public builder profile",
    },
    {
      id: 4,
      label: "Builder Dashboard",
      href: "/dashboard",
      description: "Manage your services and clients",
    });
  }
  
  if (roles?.includes(UserRole.ADMIN)) {
    roleSpecificItems.push({
      id: 3,
      label: "Admin Dashboard",
      href: "/admin",
      description: "Manage platform settings and users",
    });
  }

  return [...commonItems, ...roleSpecificItems];
};

export function PlatformHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { isLoaded, isSignedIn, isAdmin, isBuilder, isClient } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const signOut = useSignOut();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const isAuthenticated = !!isSignedIn && !!user?.id;
  
  // Use navigation items directly - no API calls
  const navigationItems = {
    roleBasedItems: defaultRoleBasedItems,
    aboutItems: defaultAboutItems
  };
  
  // After mounting, we can access browser APIs
  useEffect(() => setMounted(true), []);
  
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
  const rolesDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for dropdowns
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Click outside handlers for dropdowns
  useOnClickOutside(rolesDropdownRef, () => setRolesDropdownOpen(false));
  useOnClickOutside(aboutDropdownRef, () => setAboutDropdownOpen(false));
  useOnClickOutside(userDropdownRef, () => setUserDropdownOpen(false));
  
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

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Get user menu items based on role
  const userMenuItems = getUserMenuItems(user?.roles, user?.builderProfile?.id || user?.id);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b bg-background/80 backdrop-blur-[12px]">
        <div className="container flex h-[3.5rem] items-center justify-between">
          <Link className="text-md flex items-center font-semibold" href="/">
            <span>B</span><AuroraText className="inline-block mx-0.5">W</AuroraText>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="mx-4 hidden md:flex space-x-4 items-center">
            {/* How it works link */}
            <Link 
              href="/how-it-works"
              className={cn(
                "px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                pathname === "/how-it-works" ? "bg-slate-100 dark:bg-slate-800" : ""
              )}
            >
              How It Works
            </Link>
            
            {/* I would like to... dropdown */}
            <div ref={rolesDropdownRef} className="relative">
              <button
                onClick={() => {
                  setRolesDropdownOpen(!rolesDropdownOpen);
                  setAboutDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                onKeyDown={(e) => handleKeyDown(e, setRolesDropdownOpen)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  rolesDropdownOpen ? "bg-slate-100 dark:bg-slate-800" : ""
                )}
                aria-expanded={rolesDropdownOpen}
                aria-haspopup="true"
              >
                I would like to...
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
                      {navigationItems.roleBasedItems.map((item) => (
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

            {/* Marketplace link */}
            <Link 
              href="/marketplace"
              className={cn(
                "px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                pathname === "/marketplace" ? "bg-slate-100 dark:bg-slate-800" : ""
              )}
            >
              Marketplace
            </Link>

            {/* BW Toolkit link */}
            <Link 
              href="/toolkit"
              className={cn(
                "px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                pathname === "/toolkit" ? "bg-slate-100 dark:bg-slate-800" : ""
              )}
            >
              Free Toolkit
            </Link>

            {/* About dropdown */}
            <div ref={aboutDropdownRef} className="relative">
              <button
                onClick={() => {
                  setAboutDropdownOpen(!aboutDropdownOpen);
                  setRolesDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                onKeyDown={(e) => handleKeyDown(e, setAboutDropdownOpen)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  aboutDropdownOpen ? "bg-slate-100 dark:bg-slate-800" : ""
                )}
                aria-expanded={aboutDropdownOpen}
                aria-haspopup="true"
              >
                About Us
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
                      {navigationItems.aboutItems.map((item) => (
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

          {/* ViewingPreferences and Auth buttons grouped together */}
          <div className="ml-auto flex h-full items-center gap-2">
            {/* ViewingPreferences integrated directly into header */}
            <ViewingPreferences className="hidden md:block" />
            
            {isAuthenticated ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setRolesDropdownOpen(false);
                    setAboutDropdownOpen(false);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, setUserDropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                    userDropdownOpen ? "bg-slate-100 dark:bg-slate-800" : ""
                  )}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <User size={18} />
                  <span className="hidden md:inline">{user?.name || user?.email}</span>
                  <ChevronDown size={16} className={cn("transition-transform", userDropdownOpen ? "rotate-180" : "")} />
                </button>
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                      animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-64 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium">{user?.name || "User"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {userMenuItems.map((item) => (
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
                      <div className="py-1 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "text-sm"
                  )}
                  href="/sign-in"
                >
                  Log In
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "text-sm bg-black text-white hover:bg-black/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
                  )}
                  href="/sign-up"
                >
                  Sign Up
                </Link>
              </>
            )}
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
      
      {/* Mobile Navigation */}
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
              <span>B</span><AuroraText className="inline-block mx-0.5">W</AuroraText>
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
            {/* User Profile Section (if authenticated) */}
            {isAuthenticated && (
              <div className="mb-6">
                <div className="px-4 py-3 mb-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50">
                  <p className="text-md font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">My Account</h2>
                <motion.ul
                  className={`flex flex-col ease-in rounded-lg overflow-hidden bg-slate-100/50 dark:bg-slate-800/50`}
                  variants={containerVariants}
                  initial="initial"
                  animate={hamburgerMenuIsOpen ? "open" : "exit"}
                >
                  {userMenuItems.map((item) => (
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
                  <motion.li
                    variants={mobileLinkVar}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <button
                      onClick={handleSignOut}
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 flex w-full flex-col p-4 transition-colors text-left text-red-600 dark:text-red-400"
                    >
                      <span className="font-medium">Sign out</span>
                    </button>
                  </motion.li>
                </motion.ul>
              </div>
            )}
            
            {/* Main Navigation Links */}
            <div className="mb-6">
              <motion.ul
                className={`flex flex-col ease-in rounded-lg overflow-hidden bg-slate-100/50 dark:bg-slate-800/50`}
                variants={containerVariants}
                initial="initial"
                animate={hamburgerMenuIsOpen ? "open" : "exit"}
              >
                <motion.li
                  variants={mobileLinkVar}
                  className="border-b border-slate-200 dark:border-slate-700"
                >
                  <Link
                    className={`hover:bg-slate-200 dark:hover:bg-slate-700 flex w-full flex-col p-4 transition-colors ${pathname === "/how-it-works" ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                    href="/how-it-works"
                  >
                    <span className="font-medium">How it works</span>
                  </Link>
                </motion.li>
                <motion.li
                  variants={mobileLinkVar}
                  className="border-b border-slate-200 dark:border-slate-700"
                >
                  <Link
                    className={`hover:bg-slate-200 dark:hover:bg-slate-700 flex w-full flex-col p-4 transition-colors ${pathname === "/marketplace" ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                    href="/marketplace"
                  >
                    <span className="font-medium">Marketplace</span>
                  </Link>
                </motion.li>
                <motion.li
                  variants={mobileLinkVar}
                  className="border-b border-slate-200 dark:border-slate-700"
                >
                  <Link
                    className={`hover:bg-slate-200 dark:hover:bg-slate-700 flex w-full flex-col p-4 transition-colors ${pathname === "/toolkit" ? "bg-slate-200 dark:bg-slate-700" : ""}`}
                    href="/toolkit"
                  >
                    <span className="font-medium">Free Toolkit</span>
                  </Link>
                </motion.li>
                
                {/* ViewingPreferences in mobile menu */}
                <motion.li
                  variants={mobileLinkVar}
                  className="border-b border-slate-200 dark:border-slate-700 last:border-none"
                >
                  <div className="p-4">
                    <ViewingPreferences variant="minimal" />
                  </div>
                </motion.li>
              </motion.ul>
            </div>
            
            {/* I would like to... Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">I would like to...</h2>
              <motion.ul
                className={`flex flex-col ease-in rounded-lg overflow-hidden bg-slate-100/50 dark:bg-slate-800/50`}
                variants={containerVariants}
                initial="initial"
                animate={hamburgerMenuIsOpen ? "open" : "exit"}
              >
                {navigationItems.roleBasedItems.map((item) => (
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
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">About</h2>
              <motion.ul
                className={`flex flex-col ease-in rounded-lg overflow-hidden bg-slate-100/50 dark:bg-slate-800/50`}
                variants={containerVariants}
                initial="initial"
                animate={hamburgerMenuIsOpen ? "open" : "exit"}
              >
                {navigationItems.aboutItems.map((item) => (
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
            
            {/* Login/Signup buttons for non-authenticated users */}
            {!isAuthenticated && (
              <div className="mt-6 flex flex-col space-y-4">
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full"
                  )}
                  href="/sign-in"
                >
                  Log In
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "w-full bg-black text-white hover:bg-black/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
                  )}
                  href="/sign-up"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}

export default PlatformHeader;