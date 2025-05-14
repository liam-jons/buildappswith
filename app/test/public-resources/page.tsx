/**
 * Test Page for Public Resource Access
 * 
 * This page displays various public resources to verify they load
 * correctly for unauthenticated users. Use this in an incognito
 * window to test.
 */

import Image from 'next/image';

export default function PublicResourcesTest() {
  const logos = [
    'supabase-logo.svg',
    'anthropic-logo.svg',
    'neon-logo.svg',
    'lovable-logo.svg',
    'perplexity-logo.svg',
    'vercel-logo.svg',
  ];
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Public Resources Test Page</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Hero Images</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Light Hero</h3>
            <Image 
              src="/hero-light.png" 
              alt="Hero Light" 
              width={400} 
              height={300}
              className="border border-gray-300 rounded"
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Dark Hero</h3>
            <Image 
              src="/hero-dark.png" 
              alt="Hero Dark" 
              width={400} 
              height={300}
              className="border border-gray-300 rounded"
            />
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Logos</h2>
        <div className="grid grid-cols-3 gap-4">
          {logos.map((logo) => (
            <div key={logo} className="border border-gray-300 p-4 rounded">
              <h3 className="font-semibold mb-2">{logo}</h3>
              <img 
                src={`/logos/${logo}`} 
                alt={logo}
                className="h-16 object-contain"
              />
            </div>
          ))}
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Font Test</h2>
        <div className="space-y-4">
          <p style={{ fontFamily: 'Inter, sans-serif' }}>
            This text uses Inter font (Regular)
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
            This text uses Inter font (Italic)
          </p>
          <p style={{ fontFamily: 'Interceptor, sans-serif' }}>
            This text uses Interceptor font
          </p>
          <p style={{ fontFamily: 'OpenDyslexic, sans-serif' }}>
            This text uses OpenDyslexic font
          </p>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Other Resources</h2>
        <div className="space-y-2">
          <p>
            <img src="/favicon.ico" alt="Favicon" className="inline h-6 w-6 mr-2" />
            Favicon
          </p>
          <p>
            <img src="/images/default-avatar.svg" alt="Default Avatar" className="inline h-6 w-6 mr-2" />
            Default Avatar
          </p>
        </div>
      </section>
    </div>
  );
}