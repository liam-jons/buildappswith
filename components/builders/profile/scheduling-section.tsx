import React from 'react';
import { BuilderProfile } from '@/types/builder';

interface SchedulingSectionProps {
  profile: BuilderProfile;
}

export const SchedulingSection: React.FC<SchedulingSectionProps> = ({ profile }) => {
  const { availability } = profile;
  
  const getWeekdayLabel = (day: string) => {
    switch (day) {
      case 'monday': return 'Mon';
      case 'tuesday': return 'Tue';
      case 'wednesday': return 'Wed';
      case 'thursday': return 'Thu';
      case 'friday': return 'Fri';
      case 'saturday': return 'Sat';
      case 'sunday': return 'Sun';
      default: return day.slice(0, 3);
    }
  };
  
  // Array of weekdays in order
  const weekdays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Scheduling & Availability</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability */}
        <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
          <h3 className="text-xl font-semibold mb-4">Availability</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300">
                {availability.preferredHours.start} - {availability.preferredHours.end} ({availability.timezone})
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="text-gray-400 text-sm">Available days:</div>
              <div className="flex gap-2">
                {weekdays.map((day) => (
                  <div 
                    key={day}
                    className={`w-9 h-9 rounded-md flex items-center justify-center text-sm ${
                      availability.weekdayAvailability[day as keyof typeof availability.weekdayAvailability]
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {getWeekdayLabel(day)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Scheduling Options */}
        <div className="bg-black/[0.3] p-6 rounded-xl backdrop-blur-sm border border-white/5">
          <h3 className="text-xl font-semibold mb-4">Book a Session</h3>
          
          <div className="mb-4">
            <div className="font-medium mb-1">Rate</div>
            <div className="text-2xl font-bold text-white">
              ${profile.ratePer15MinutesUSD} <span className="text-sm font-normal text-gray-400">/ 15 mins</span>
            </div>
            
            {profile.freeSessionMinutes > 0 && (
              <div className="mt-2 text-green-400 text-sm">
                First {profile.freeSessionMinutes} minutes free!
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Select Session Duration</label>
              <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {profile.freeSessionMinutes > 0 && (
                  <option value="free">{profile.freeSessionMinutes} min (Free Introduction)</option>
                )}
                <option value="15">15 min (${profile.ratePer15MinutesUSD})</option>
                <option value="30">30 min (${profile.ratePer15MinutesUSD * 2})</option>
                <option value="45">45 min (${profile.ratePer15MinutesUSD * 3})</option>
                <option value="60">60 min (${profile.ratePer15MinutesUSD * 4})</option>
              </select>
            </div>
            
            {availability.schedulingUrl ? (
              <a 
                href={availability.schedulingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors"
              >
                Schedule with {profile.name.split(' ')[0]}
              </a>
            ) : (
              <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors">
                Schedule Session
              </button>
            )}
            
            <div className="text-center text-xs text-gray-500 mt-2">
              By scheduling, you agree to our <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
