import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Build Apps With",
  description: "Terms of Service for the Build Apps With platform",
};

export default function TermsPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground text-lg">Last updated: 9th May 2025</p>
      </div>

      <div className="space-y-6 text-lg">
        <p>
          This page contains placeholder content for the Terms of Service for Build Apps With.
          A full terms of service document will be implemented that complies with UK regulations.
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. Introduction</h2>
        <p>
          Welcome to Build Apps With. These Terms of Service govern your use of our platform,
          including any related services, features, content, or applications (collectively, the &quot;Service&quot;).
        </p>

        <h2 className="text-2xl font-semibold mt-8">2. Acceptance of Terms</h2>
        <p>
          By accessing or using the Service, you agree to be bound by these Terms. If you do not
          agree to these Terms, please do not use the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8">3. Eligibility</h2>
        <p>
          You must be at least 18 years old to use the Service. By using the Service, you
          represent and warrant that you meet this eligibility requirement.
        </p>

        <h2 className="text-2xl font-semibold mt-8">4. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate and complete information.
          You are responsible for maintaining the security of your account.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by
          Build Apps With and are protected by international copyright, trademark, and other
          intellectual property laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8">6. User Content</h2>
        <p>
          You retain all rights to any content you submit, post, or display on or through the Service.
          By submitting content to the Service, you grant us a worldwide, non-exclusive license to use,
          reproduce, modify, and display such content in connection with the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8">7. Prohibited Conduct</h2>
        <p>
          You agree not to misuse the Service or help anyone else do so. For example, you must not:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on the rights of others</li>
          <li>Hack, reverse engineer, or attempt to gain unauthorized access to the Service</li>
          <li>Transmit any viruses, malware, or other types of malicious code</li>
          <li>Interfere with the proper working of the Service</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">8. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without prior
          notice or liability, for any reason, including breach of these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8">9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Build Apps With shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
          whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible
          losses, resulting from your use of the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8">10. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. If we make changes, we will provide
          notice of such changes by updating the date at the top of these Terms. Your continued use of
          the Service following the posting of revised Terms means that you accept and agree to the changes.
        </p>

        <h2 className="text-2xl font-semibold mt-8">11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please{" "}
          <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
