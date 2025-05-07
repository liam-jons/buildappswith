import { MarketingHeader, MarketingFooter } from "@/components/marketing";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1 pt-[3.5rem] overflow-hidden">{children}</main>
      <MarketingFooter />
    </div>
  );
}
