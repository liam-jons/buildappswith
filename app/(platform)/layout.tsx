import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Buildappswith Platform",
    template: "%s | Buildappswith",
  },
  description: "Democratizing AI application development through connecting clients with validated builders and practical AI education",
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      {/* Added pt-[3.5rem] to account for the fixed header height */}
      <main className="flex-1 pt-[3.5rem]">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
