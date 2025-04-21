import React from 'react';
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata = {
  title: "Contact Us | Buildappswith",
  description: "Get in touch with the Buildappswith team for any questions, feedback, or partnership inquiries.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <TextShimmer>Contact Us</TextShimmer>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            We'd love to hear from you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
            <p className="mb-6">
              Have questions about Buildappswith or want to learn more about how we can help you 
              leverage AI effectively? We're here to help.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">General Inquiries</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  For general questions about our platform or services
                </p>
                <p className="font-medium mt-1">hello@buildappswith.app</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Support</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  For assistance with your account or technical issues
                </p>
                <p className="font-medium mt-1">support@buildappswith.app</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Business Development</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  For partnership opportunities and business inquiries
                </p>
                <p className="font-medium mt-1">partners@buildappswith.app</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Remote-first company with team members across the globe
                </p>
                <p className="font-medium mt-1">London, UK (HQ)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800/30 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="mb-6">
            Follow us on social media to stay updated on the latest AI developments, 
            platform updates, and educational resources.
          </p>
          
          <div className="flex justify-center gap-6">
            <a 
              href="https://twitter.com/buildappswith" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="Twitter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            
            <a 
              href="https://linkedin.com/company/buildappswith" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            
            <a 
              href="https://github.com/buildappswith" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
