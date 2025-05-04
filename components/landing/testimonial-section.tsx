import { TestimonialScroll } from "./ui/testimonial-scroll";

export function TestimonialSection() {
  const testimonials = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Startup Founder",
      img: "https://i.pravatar.cc/150?img=1",
      description: "BuildAppsWith connected me with an AI specialist who helped us implement a recommendation engine that increased conversion by 34%. The booking process was seamless."
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Product Manager",
      img: "https://i.pravatar.cc/150?img=2",
      description: "We needed help integrating AI image recognition into our platform. The builder we found through BuildAppsWith delivered a working prototype in just two sessions."
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "UX Designer",
      img: "https://i.pravatar.cc/150?img=3",
      description: "As a designer, I was struggling with the technical aspects of my AI project. My BuildAppsWith developer explained everything clearly and helped me bring my vision to life."
    },
    {
      id: "4",
      name: "David Kim",
      role: "Solo Entrepreneur",
      img: "https://i.pravatar.cc/150?img=4",
      description: "The quality of AI builders on this platform is exceptional. I've now worked with three different specialists, all delivering excellent results on time and within budget."
    },
    {
      id: "5",
      name: "Jessica Patel",
      role: "Marketing Director",
      img: "https://i.pravatar.cc/150?img=5",
      description: "Our marketing team needed a custom GPT solution for content generation. BuildAppsWith matched us with the perfect expert who understood both AI and marketing needs."
    },
    {
      id: "6",
      name: "Robert Nguyen",
      role: "CTO",
      img: "https://i.pravatar.cc/150?img=6",
      description: "Even as a technical leader, I found immense value working with the specialists here. They brought fresh perspectives and accelerated our AI implementation significantly."
    }
  ];

  return (
    <section
      id="testimonials"
      className="flex flex-col items-center justify-center w-full py-20"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4 text-balance">
          What Our Clients Say
        </h2>
        <p className="text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto">
          Real success stories from clients who have built their applications with our network of AI experts
        </p>
      </div>
      <TestimonialScroll testimonials={testimonials} />
    </section>
  );
}