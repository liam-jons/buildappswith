import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Buildappswith",
  description: "Privacy Policy for Buildappswith platform",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-lg">
        <p>
          This page contains placeholder content for the Privacy Policy for Buildappswith.
          A full privacy policy document will be implemented that complies with GDPR and UK data protection regulations.
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. Introduction</h2>
        <p>
          At Buildappswith, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our platform.
        </p>

        <h2 className="text-2xl font-semibold mt-8">2. Information We Collect</h2>
        <p>
          We may collect several types of information, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Personal Information (name, email address, phone number)</li>
          <li>Account Information (username, password)</li>
          <li>Profile Information (professional details, skills, expertise)</li>
          <li>Usage Data (how you interact with our platform)</li>
          <li>Technical Data (IP address, browser type, device information)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Respond to comments, questions, and requests</li>
          <li>Send technical notices, updates, security alerts, and support messages</li>
          <li>Monitor and analyze trends, usage, and activities</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">4. Data Storage and Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data
          against unauthorized or unlawful processing, accidental loss, destruction, or damage.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. Sharing Your Information</h2>
        <p>
          We may share your information with:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Service providers who perform services on our behalf</li>
          <li>Business partners with whom we jointly offer products or services</li>
          <li>Legal authorities when required by law</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">6. Your Rights</h2>
        <p>
          Under GDPR and UK data protection laws, you have certain rights regarding your personal data, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Right to access your personal data</li>
          <li>Right to rectify inaccurate personal data</li>
          <li>Right to erasure (right to be forgotten)</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">7. Cookies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our platform and
          hold certain information. You can instruct your browser to refuse all cookies or to indicate
          when a cookie is being sent.
        </p>

        <h2 className="text-2xl font-semibold mt-8">8. Children's Privacy</h2>
        <p>
          Our platform is not intended for children under the age of 18. We do not knowingly collect
          personal information from children under 18.
        </p>

        <h2 className="text-2xl font-semibold mt-8">9. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the date at the top.
        </p>

        <h2 className="text-2xl font-semibold mt-8">10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please{" "}
          <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
