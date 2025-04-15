import React from 'react';

// Persona-based testimonials that align with our target users
const testimonials = [
  {
    quote: "I never thought I could afford custom app development for my business. Buildappswith connected me with the perfect builder who delivered a solution that increased our efficiency by 40%.",
    name: "Sarah Thompson",
    title: "Small Business Owner",
    avatar: "/avatars/avatar1.png", // Replace with actual path later
  },
  {
    quote: "The skill tree approach to learning AI development gave me a clear path from novice to builder. I'm now creating apps for clients and earning while I continue to learn.",
    name: "Miguel Rodriguez",
    title: "Career Transitioner",
    avatar: "/avatars/avatar2.png", // Replace with actual path later
  },
  {
    quote: "As an experienced AI developer, I was tired of competing on price. The validation system here recognizes my quality work and connects me with clients who value expertise.",
    name: "Aisha Johnson",
    title: "AI Developer",
    avatar: "/avatars/avatar3.png", // Replace with actual path later
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-secondary"> {/* Added background */}
      <div className="container mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Community Wins
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card p-6 rounded-lg shadow-md">
              {/* Optional Avatar */}
              {/* <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mx-auto mb-4" /> */}
              <blockquote className="text-muted-foreground italic mb-4">
                &quot;{testimonial.quote}&quot;
              </blockquote>
              <p className="text-center font-semibold">{testimonial.name}</p>
              <p className="text-center text-sm text-muted-foreground">{testimonial.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;