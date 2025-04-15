import { Metadata } from "next";

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
      {/* We'll add the platform header later */}
      <main className="flex-1">{children}</main>
      {/* We'll add the platform footer later */}
    </div>
  );
}
