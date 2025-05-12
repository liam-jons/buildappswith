import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Build Apps With",
  description: "Create a new account",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}