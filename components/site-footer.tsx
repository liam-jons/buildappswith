import { DiscordLogoIcon, TwitterLogoIcon, GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const footerNavs = [
  {
    label: "Platform",
    items: [
      {
        href: "/marketplace",
        name: "Builder Marketplace",
      },
      {
        href: "/learning",
        name: "AI Learning Hub",
      },
      {
        href: "/ai-timeline",
        name: "What AI Can/Can't Do",
      },
      {
        href: "/community",
        name: "Community Exchange",
      },
    ],
  },
  {
    label: "For Users",
    items: [
      {
        href: "/for-clients",
        name: "For Clients",
      },
      {
        href: "/for-learners",
        name: "For Learners",
      },
      {
        href: "/for-builders",
        name: "For Builders",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        href: "/blog",
        name: "Blog",
      },
      {
        href: "/weekly-sessions",
        name: "Weekly Sessions",
      },
      {
        href: "/faq",
        name: "FAQ",
      },
    ],
  },
  {
    label: "Company",
    items: [
      {
        href: "/about",
        name: "About Us",
      },
      {
        href: "/contact",
        name: "Contact",
      },
      {
        href: "/terms",
        name: "Terms",
      },
      {
        href: "/privacy",
        name: "Privacy",
      },
    ],
  },
];

const footerSocials = [
  {
    href: "https://discord.gg/buildappswith",
    name: "Discord",
    icon: <DiscordLogoIcon className="h-4 w-4" />,
  },
  {
    href: "https://twitter.com/buildappswith",
    name: "Twitter",
    icon: <TwitterLogoIcon className="h-4 w-4" />,
  },
  {
    href: "https://github.com/buildappswith",
    name: "GitHub",
    icon: <GitHubLogoIcon className="h-4 w-4" />,
  },
  {
    href: "https://linkedin.com/company/buildappswith",
    name: "LinkedIn",
    icon: <LinkedInLogoIcon className="h-4 w-4" />,
  },
];

export function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="md:flex md:justify-between px-8 p-4 py-16 sm:pb-16 gap-4">
          <div className="mb-12 flex-col flex gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                Buildappswith
              </span>
            </Link>
            <p className="max-w-xs">Democratizing AI application development through accessible education and transparent validation</p>
            <div className="mt-4">
              <Link href="/for-clients" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mr-2")}>
                For Clients
              </Link>
              <Link href="/for-learners" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mr-2")}>
                For Learners
              </Link>
              <Link href="/for-builders" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                For Builders
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:gap-10 sm:grid-cols-4">
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h2 className="mb-6 text-sm tracking-tighter font-medium text-gray-900 uppercase dark:text-white">
                  {nav.label}
                </h2>
                <ul className="gap-2 grid">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="cursor-pointer text-gray-400 hover:text-gray-200 duration-200 font-[450] text-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex sm:items-center sm:justify-between rounded-md border-neutral-700/20 py-4 px-8 gap-2">
          <div className="flex space-x-5 sm:justify-center sm:mt-0">
            {footerSocials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-600 fill-gray-500 hover:fill-gray-900 dark:hover:fill-gray-600"
              >
                {social.icon}
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="/" className="cursor-pointer">
              Buildappswith
            </Link>
            . All Rights Reserved.
          </span>
        </div>
      </div>
      {/*   <SiteBanner /> */}
    </footer>
  );
}
