"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Define the list of admin navigation items
const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
  },
  {
    title: "Builders",
    href: "/admin/builders",
    icon: "Users",
  },
  {
    title: "Session Types",
    href: "/admin/session-types",
    icon: "Calendar",
  },
  // Add more admin sections as needed
];

interface AdminNavProps {
  className?: string;
}

export function AdminNav({ className }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {adminNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}