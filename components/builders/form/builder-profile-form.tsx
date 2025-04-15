import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { builderProfileSchema } from '@/lib/validations/builder-profile';
import { TechStack, ValidationTier } from '@/types/builder';

type FormData = typeof builderProfileSchema._type;

interface BuilderProfileFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export const BuilderProfileForm: React.FC<BuilderProfileFormProps> = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(builderProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      headline: '',
      bio: '',
      location: '',
      specializationTags: [''],
      techStack: [{ name: '', yearsOfExperience: 0, proficiencyLevel: 'beginner' }],
      portfolioProjects: [],
      testimonials: [],
      availability: {
        timezone: 'UTC',
        weekdayAvailability: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
        },
        preferredHours: {
          start: '09:00',
          end: '17:00',
        },
      },
      ratePer15MinutesUSD: 0,
      freeSessionMinutes: 0,
      skills: [''],
      ...defaultValues,
    },
  });

  const {
    fields: techStackFields,
    append: appendTechStack,
    remove: removeTechStack,
  } = useFieldArray({
    control,
    name: 'techStack',
  });

  const {
    fields: specializationFields,
    append: appendSpecialization,
    remove: removeSpecialization,
  } = useFieldArray({
    control,
    name: 'specializationTags',
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location *
            </label>
            <input
              id="location"
              type="text"
              {...register('location')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="City, Country"
            />
            {errors.location && (
              <p className="mt-1 text-red-500 text-sm">{errors.location.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium mb-1">
              Profile Image URL
            </label>
            <input
              id="profileImage"
              type="text"
              {...register('profileImage')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/your-image.jpg"
            />
            {errors.profileImage && (
              <p className="mt-1 text-red-500 text-sm">{errors.profileImage.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="headline" className="block text-sm font-medium mb-1">
              Professional Headline *
            </label>
            <input
              id="headline"
              type="text"
              {...register('headline')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Full Stack Developer specializing in AI Applications"
            />
            {errors.headline && (
              <p className="mt-1 text-red-500 text-sm">{errors.headline.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Professional Bio *
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={5}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell potential clients about yourself, your experience, and your approach..."
            />
            {errors.bio && (
              <p className="mt-1 text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Social & Web Presence */}
      <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
        <h2 className="text-xl font-semibold mb-4">Social & Web Presence</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-1">
              Website
            </label>
            <input
              id="website"
              type="text"
              {...register('website')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://yourwebsite.com"
            />
            {errors.website && (
              <p className="mt-1 text-red-500 text-sm">{errors.website.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="github" className="block text-sm font-medium mb-1">
              GitHub URL
            </label>
            <input
              id="github"
              type="text"
              {...register('github')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://github.com/yourusername"
            />
            {errors.github && (
              <p className="mt-1 text-red-500 text-sm">{errors.github.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium mb-1">
              LinkedIn URL
            </label>
            <input
              id="linkedin"
              type="text"
              {...register('linkedin')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://linkedin.com/in/yourusername"
            />
            {errors.linkedin && (
              <p className="mt-1 text-red-500 text-sm">{errors.linkedin.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium mb-1">
              Twitter Username
            </label>
            <input
              id="twitter"
              type="text"
              {...register('twitter')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="yourusername (without @)"
            />
            {errors.twitter && (
              <p className="mt-1 text-red-500 text-sm">{errors.twitter.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Specializations & Skills */}
      <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
        <h2 className="text-xl font-semibold mb-4">Specializations & Skills</h2>
        
        {/* Specialization Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Specialization Tags *
          </label>
          <p className="text-sm text-gray-400 mb-3">Add tags that best describe your specializations (e.g., "AI Integration", "Full Stack Development")</p>
          
          {specializationFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`specializationTags.${index}`)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Full Stack Development"
              />
              <button
                type="button"
                onClick={() => removeSpecialization(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
                disabled={specializationFields.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => appendSpecialization('')}
            className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Specialization
          </button>
          
          {errors.specializationTags && (
            <p className="mt-1 text-red-500 text-sm">{errors.specializationTags.message}</p>
          )}
        </div>
        
        {/* Tech Stack */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Tech Stack *
          </label>
          <p className="text-sm text-gray-400 mb-3">Add technologies you're proficient in, with your experience level</p>
          
          {techStackFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border border-gray-700 rounded-md">
              <div>
                <label className="block text-xs mb-1">Technology</label>
                <input
                  {...register(`techStack.${index}.name`)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. JavaScript"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1">Years of Experience</label>
                <input
                  type="number"
                  {...register(`techStack.${index}.yearsOfExperience`, { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.5"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1">Proficiency Level</label>
                <select
                  {...register(`techStack.${index}.proficiencyLevel`)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeTechStack(index)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors w-full"
                  disabled={techStackFields.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => appendTechStack({ name: '', yearsOfExperience: 0, proficiencyLevel: 'beginner' })}
            className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Technology
          </button>
          
          {errors.techStack && (
            <p className="mt-1 text-red-500 text-sm">{errors.techStack.message}</p>
          )}
        </div>
        
        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Other Skills *
          </label>
          <p className="text-sm text-gray-400 mb-3">Add additional skills that aren't covered in your tech stack</p>
          
          {skillFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`skills.${index}`)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Project Management"
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
                disabled={skillFields.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => appendSkill('')}
            className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Skill
          </button>
          
          {errors.skills && (
            <p className="mt-1 text-red-500 text-sm">{errors.skills.message}</p>
          )}
        </div>
      </div>
      
      {/* Availability & Rates */}
      <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
        <h2 className="text-xl font-semibold mb-4">Availability & Rates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium mb-1">
              Timezone *
            </label>
            <input
              id="timezone"
              {...register('availability.timezone')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. America/New_York"
            />
            {errors.availability?.timezone && (
              <p className="mt-1 text-red-500 text-sm">{errors.availability.timezone.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="schedulingUrl" className="block text-sm font-medium mb-1">
              Scheduling URL (Calendly/Cal.com)
            </label>
            <input
              id="schedulingUrl"
              {...register('availability.schedulingUrl')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://calendly.com/yourusername"
            />
            {errors.availability?.schedulingUrl && (
              <p className="mt-1 text-red-500 text-sm">{errors.availability.schedulingUrl.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Hours *
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  type="time"
                  {...register('availability.preferredHours.start')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.availability?.preferredHours?.start && (
                  <p className="mt-1 text-red-500 text-sm">{errors.availability.preferredHours.start.message}</p>
                )}
              </div>
              <span>to</span>
              <div className="flex-1">
                <input
                  type="time"
                  {...register('availability.preferredHours.end')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.availability?.preferredHours?.end && (
                  <p className="mt-1 text-red-500 text-sm">{errors.availability.preferredHours.end.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Available Days *
            </label>
            <div className="grid grid-cols-7 gap-1">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className="flex flex-col items-center">
                  <label className="text-xs mb-1 capitalize">{day.slice(0, 3)}</label>
                  <input
                    type="checkbox"
                    {...register(`availability.weekdayAvailability.${day}` as const)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 bg-gray-800 border-gray-700"
                  />
                </div>
              ))}
            </div>
            {errors.availability?.weekdayAvailability && (
              <p className="mt-1 text-red-500 text-sm">Please select at least one available day</p>
            )}
          </div>
          
          <div>
            <label htmlFor="ratePer15MinutesUSD" className="block text-sm font-medium mb-1">
              Rate per 15 Minutes (USD) *
            </label>
            <input
              id="ratePer15MinutesUSD"
              type="number"
              {...register('ratePer15MinutesUSD', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              step="0.01"
              placeholder="e.g. 25"
            />
            {errors.ratePer15MinutesUSD && (
              <p className="mt-1 text-red-500 text-sm">{errors.ratePer15MinutesUSD.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="freeSessionMinutes" className="block text-sm font-medium mb-1">
              Free Consultation Minutes *
            </label>
            <input
              id="freeSessionMinutes"
              type="number"
              {...register('freeSessionMinutes', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              step="15"
              placeholder="e.g. 30"
            />
            <p className="mt-1 text-xs text-gray-400">
              How many minutes of free consultation do you offer? (0 for none, recommended: 15-30)
            </p>
            {errors.freeSessionMinutes && (
              <p className="mt-1 text-red-500 text-sm">{errors.freeSessionMinutes.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Profile...
            </span>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </form>
  );
};
