import { redirect } from "next/navigation";

export const metadata = {
  title: "Meet Liam Jons | AI Specialist & ADHD Advocate | Buildappswith",
  description: "Learn more about Liam Jons, AI specialist with a focus on helping people with ADHD leverage technology. Book a session to explore how AI can help your unique situation.",
  openGraph: {
    title: "Meet Liam Jons | AI Specialist & ADHD Advocate | Buildappswith",
    description: "Technology expert helping underserved communities harness AI for personal growth",
    type: "profile",
    images: [
      {
        url: "/images/profiles/liam-jons-og.jpg",
        width: 1200,
        height: 630,
        alt: "Liam Jons - AI Specialist & ADHD Advocate",
      },
    ],
  },
};

export default function LiamJonsPage() {
  redirect('/builder-profile/liam-jons');
}
