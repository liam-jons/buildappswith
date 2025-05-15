import { PlatformHeader } from "@/components/ui";
import { SiteFooter } from "@/components/site-footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PlatformHeader />
      <main className="flex-1 pt-[3.5rem] overflow-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}
