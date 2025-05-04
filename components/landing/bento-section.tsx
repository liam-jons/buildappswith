export function BentoSection() {
  const bentoItems = [
    {
      id: "1",
      title: "AI-Powered Development",
      description: "Build applications that harness the power of artificial intelligence",
      content: (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-10">
          <svg className="w-20 h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      id: "2",
      title: "Expert Collaboration",
      description: "Work directly with skilled developers who understand your vision",
      content: (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-10">
          <svg className="w-20 h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ),
    },
    {
      id: "3",
      title: "Seamless Scheduling",
      description: "Book time with builders when it works best for your project timeline",
      content: (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-10">
          <svg className="w-20 h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      id: "4",
      title: "Verified Expertise",
      description: "Our builders are validated through a thorough assessment process",
      content: (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-red-500/20 to-pink-500/20 p-10">
          <svg className="w-20 h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section
      id="bento"
      className="flex flex-col items-center justify-center w-full relative px-5 md:px-10 py-20"
    >
      <div className="border-x mx-5 md:mx-10 relative max-w-7xl w-full">
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4 text-balance">
            Key Platform Features
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto">
            Everything you need to bring your AI-powered application to life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {bentoItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-start justify-end min-h-[400px] md:min-h-[350px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[350px] group"
            >
              <div className="relative flex size-full items-center justify-center h-full overflow-hidden">
                {item.content}
              </div>
              <div className="flex-1 flex-col gap-2 p-6">
                <h3 className="text-lg tracking-tighter font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}