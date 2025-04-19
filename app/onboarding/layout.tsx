import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Buildappswith",
  description: "Complete your profile",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
