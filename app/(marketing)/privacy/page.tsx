import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Build Apps With",
  description: "Privacy Policy for the Build Apps With platform",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">Last updated: 9th May 2025</p>
      </div>

      <div className="space-y-6 text-lg">
        <p>
          This Privacy Policy explains how Build Apps With collects, uses, and protects your personal data in compliance with the General Data Protection Regulation (GDPR) and UK data protection laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. Introduction</h2>
        <p>
          At Build Apps With, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our platform.
        </p>

        <h2 className="text-2xl font-semibold mt-8">2. Data Controller</h2>
        <p>
          Build Apps With operates as the data controller for personal information collected through our platform.
          You can contact our Data Protection Officer at privacy@buildappswith.com.
        </p>

        <h2 className="text-2xl font-semibold mt-8">3. Information We Collect</h2>
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

        <h2 className="text-2xl font-semibold mt-8">4. Legal Basis for Processing</h2>
        <p>
          We process your personal data based on the following legal grounds:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Contract:</strong> Processing necessary for the performance of our contract with you</li>
          <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate interests, provided these interests don't override your fundamental rights</li>
          <li><strong>Legal Obligation:</strong> Processing necessary to comply with our legal obligations</li>
          <li><strong>Consent:</strong> Processing based on your specific consent</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">5. How We Use Your Information</h2>
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

        <h2 className="text-2xl font-semibold mt-8">6. Data Retention</h2>
        <p>
          We retain your personal data only for as long as necessary to fulfill the purposes for which we collected it,
          including for the purposes of satisfying any legal, accounting, or reporting requirements.
          To determine the appropriate retention period, we consider the amount, nature, and sensitivity of the data,
          the potential risk of harm from unauthorized use or disclosure, and applicable legal requirements.
        </p>

        <h2 className="text-2xl font-semibold mt-8">7. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than the one in which you reside.
          When we transfer your data outside the UK or European Economic Area (EEA), we ensure appropriate safeguards are
          in place through Standard Contractual Clauses approved by the European Commission and UK authorities.
        </p>

        <h2 className="text-2xl font-semibold mt-8">8. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data
          against unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures are
          regularly reviewed and updated to ensure ongoing security.
        </p>

        <h2 className="text-2xl font-semibold mt-8">9. Sharing Your Information</h2>
        <p>
          We may share your information with:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Service providers who perform services on our behalf</li>
          <li>Business partners with whom we jointly offer products or services</li>
          <li>Legal authorities when required by law</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">10. Your GDPR Rights</h2>
        <p>
          Under GDPR and UK data protection laws, you have the following rights:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Right to Access:</strong> Request access to your personal data</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data (right to be forgotten)</li>
          <li><strong>Right to Restrict Processing:</strong> Request restriction of processing of your personal data</li>
          <li><strong>Right to Data Portability:</strong> Request the transfer of your personal data to you or a third party</li>
          <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
          <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent to process your personal data</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, please contact us at privacy@buildappswith.com. We will respond to your request within one month.
          You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) or other relevant data protection authority.
        </p>

        <h2 className="text-2xl font-semibold mt-8">11. Cookies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our platform and
          hold certain information. We provide a detailed cookie control panel that allows you to manage your preferences.
          You can also instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>

        <h2 className="text-2xl font-semibold mt-8">12. Children&apos;s Privacy</h2>
        <p>
          Our platform is not intended for children under the age of 18. We do not knowingly collect
          personal information from children under 18.
        </p>

        <h2 className="text-2xl font-semibold mt-8">13. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the date at the top. For significant changes,
          we will provide a more prominent notice or send you an email notification.
        </p>

        <h2 className="text-2xl font-semibold mt-8">14. Data Protection Officer</h2>
        <p>
          If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at:
        </p>
        <p className="mt-2">
          Email: privacy@buildappswith.com<br />
          Postal Address: Build Apps With, 123 Privacy Street, London, UK
        </p>

        <h2 className="text-2xl font-semibold mt-8">15. Contact Us</h2>
        <p>
          For general inquiries about this Privacy Policy, please{" "}
          <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
