import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Buildappswith",
  description: "Manage your profile",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
