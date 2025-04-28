'use client';

import { Clock, Users, ChevronRight } from 'lucide-react';
import { SessionType } from '@/lib/scheduling/types';
import { Card, CardContent } from '@/components/ui/card';

interface SessionTypeSelectorProps {
  sessionTypes: SessionType[];
  onSelect: (sessionType: SessionType) => void;
}

const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({
  sessionTypes,
  onSelect
}) => {
  if (sessionTypes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No session types available for this builder.</p>
        <p className="text-sm mt-2">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select a Session Type</h3>
      
      <div className="space-y-4">
        {sessionTypes.map((sessionType) => (
          <Card 
            key={sessionType.id}
            className="overflow-hidden hover:border-primary transition-colors cursor-pointer"
            onClick={() => onSelect(sessionType)}
          >
            <CardContent className="p-0">
              <div className="flex items-center p-6">
                {/* Left: Color indicator */}
                <div 
                  className="w-2 self-stretch rounded-l mr-4" 
                  style={{ backgroundColor: sessionType.color || '#6366F1' }}
                ></div>
                
                {/* Center: Session type details */}
                <div className="flex-grow">
                  <h4 className="font-medium text-base">{sessionType.title}</h4>
                  <p className="text-gray-500 text-sm mt-1">{sessionType.description}</p>
                  
                  <div className="flex mt-3 space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {sessionType.durationMinutes} minutes
                    </div>
                    
                    {sessionType.maxParticipants && sessionType.maxParticipants > 1 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        Up to {sessionType.maxParticipants} participants
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right: Price and action */}
                <div className="text-right">
                  <p className="font-semibold">
                    {sessionType.price} {sessionType.currency}
                  </p>
                  <div className="flex items-center justify-end mt-2 text-primary">
                    <span className="text-sm">Select</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SessionTypeSelector;