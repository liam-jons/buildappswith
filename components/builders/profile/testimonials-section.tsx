import React from 'react';
import { BuilderProfile, Testimonial } from '@/types/builder';

interface TestimonialsSectionProps {
  profile: BuilderProfile;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ profile }) => {
  // If there are no testimonials yet
  if (!profile.testimonials || profile.testimonials.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Client Testimonials</h2>
        <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5 text-center">
          <p className="text-gray-400">No testimonials available yet.</p>
        </div>
      </div>
    );
  }

  // Sort testimonials by date (newest first)
  const sortedTestimonials = [...profile.testimonials].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Client Testimonials</h2>
        
        {/* Display average rating if there's at least one testimonial */}
        {sortedTestimonials.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStarRating(
                sortedTestimonials.reduce((sum, t) => sum + t.rating, 0) / sortedTestimonials.length
              )}
            </div>
            <span className="text-gray-400 text-sm">
              ({sortedTestimonials.length} {sortedTestimonials.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedTestimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
      <div className="flex justify-between mb-4">
        <div>
          <h4 className="font-bold">{testimonial.clientName}</h4>
          {testimonial.clientCompany && (
            <p className="text-gray-400 text-sm">{testimonial.clientCompany}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex">
            {renderStarRating(testimonial.rating)}
          </div>
          <p className="text-gray-500 text-xs mt-1">{formatDate(testimonial.date)}</p>
        </div>
      </div>
      
      <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-gray-300">
        "{testimonial.text}"
      </blockquote>
    </div>
  );
};

// Helper function to render star ratings
const renderStarRating = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  
  // Half star if needed
  if (hasHalfStar) {
    stars.push(
      <svg key="half" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <defs>
          <linearGradient id="halfGradient">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="#374151" />
          </linearGradient>
        </defs>
        <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  
  // Empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  
  return stars;
};
