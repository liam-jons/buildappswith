'use client';

export default function CalendlyDirectTest() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Direct Calendly Embed Test</h1>
      
      <p className="mb-4">Testing with the official Calendly embed code:</p>
      
      {/* Official Calendly embed code */}
      <div 
        className="calendly-inline-widget" 
        data-url="https://calendly.com/liam-buildappswith/getting-started-businesses"
        style={{ minWidth: '320px', height: '700px' }}
      />
      <script 
        type="text/javascript" 
        src="https://assets.calendly.com/assets/external/widget.js" 
        async 
      />
    </div>
  );
}