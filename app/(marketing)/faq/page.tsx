import { Metadata } from "next";
import { FAQAccordion } from "@/components/client/faq-accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Buildappswith",
  description: "Get answers to common questions about Buildappswith",
};

export default function FAQPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Get answers to common questions about using Buildappswith
        </p>
      </div>

      <FAQAccordion items={[
        {
          id: "item-1",
          question: "What is Buildappswith?",
          answer: (
            <p>
              Buildappswith is a platform designed to democratize AI application development through an innovative
              marketplace where users can either commission affordable custom apps or learn to build them alongside
              experienced developers. Our mission is to make AI literacy accessible to everyone while creating a
              community that rewards quality, knowledge-sharing, and tangible outcomes.
            </p>
          ),
        },
        {
          id: "item-2",
          question: "How can I benefit from using Buildappswith?",
          answer: (
            <div>
              <p>There are several ways to benefit from our platform:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>As a client, you can find affordable custom AI application development</li>
                <li>As a learner, you can develop practical AI skills through our learning resources</li>
                <li>As a builder, you can offer your services and build your reputation</li>
                <li>Everyone can access our curated toolkit of recommended AI tools</li>
              </ul>
            </div>
          ),
        },
        {
          id: "item-3",
          question: "How does the builder validation system work?",
          answer: (
            <p>
              Our builder validation system focuses on tangible outcomes rather than subjective reviews. Builders are
              rated based on factors like project completion success, client business impacts, technical quality, and
              knowledge contributions. This creates a "race to the top" environment where the most skilled and
              helpful builders gain recognition.
            </p>
          ),
        },
        {
          id: "item-4",
          question: "Are there any free resources available?",
          answer: (
            <div>
              <p>Yes! We offer several free resources including:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Weekly AI 101 sessions (free for unemployed individuals)</li>
                <li>A comprehensive AI toolkit with recommendations</li>
                <li>Basic learning resources about practical AI applications</li>
                <li>"What AI Can/Can't Do" guides to understand capabilities</li>
              </ul>
            </div>
          ),
        },
        {
          id: "item-5",
          question: "How much does it cost to have an app built?",
          answer: (
            <p>
              App development costs vary based on complexity, features, and the builder's expertise level. Our platform
              offers transparent pricing, and you can get custom quotes from builders based on your specific requirements.
              The marketplace model helps keep costs affordable while maintaining high quality standards.
            </p>
          ),
        },
        {
          id: "item-6",
          question: "How can I become a builder on the platform?",
          answer: (
            <p>
              To become a builder, you'll need to create a profile and demonstrate your skills through our validation
              process. We're currently in the early stages with a selective onboarding process. You can express interest
              by visiting the "Teach someone to build" section of our platform, and we'll guide you through the next steps.
            </p>
          ),
        },
        {
          id: "item-7",
          question: "What types of apps can be built on the platform?",
          answer: (
            <div>
              <p>Our platform supports a wide range of AI applications, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Business automation tools</li>
                <li>Content generation applications</li>
                <li>Data analysis and visualization tools</li>
                <li>Customer service chatbots</li>
                <li>Personalized recommendation systems</li>
                <li>Custom productivity applications</li>
              </ul>
            </div>
          ),
        },
        {
          id: "item-8",
          question: "How do I get started with learning AI skills?",
          answer: (
            <p>
              The best way to start is by visiting our "Learn how to build" section, where you'll find structured
              learning paths tailored to different skill levels. We recommend beginning with our AI literacy fundamentals
              and gradually progressing to more specialized topics. You can also attend our weekly sessions for guided
              learning experiences.
            </p>
          ),
        },
        {
          id: "item-9",
          question: "How do you ensure quality and security in built applications?",
          answer: (
            <p>
              We maintain quality through our validation system, which incentivizes builders to adhere to best practices.
              Security considerations are built into our educational resources and development guidelines. Each project
              includes milestone-based reviews, and we encourage transparent communication about potential limitations
              or risks.
            </p>
          ),
        },
        {
          id: "item-10",
          question: "What support is available if I have issues?",
          answer: (
            <div>
              <p>We offer several support options:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Direct communication with builders for project-specific questions</li>
                <li>Community forums for general queries</li>
                <li>Help documentation and tutorials</li>
                <li>Contact form for platform-related issues</li>
              </ul>
              <p>You can reach out through our contact page for any concerns or questions.</p>
            </div>
          ),
        },
      ]} />
    </div>
  );
}
