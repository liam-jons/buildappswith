"use client";

import { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/core/select';
import { getCommonTimezones, detectClientTimezone } from '@/lib/scheduling/utils';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  label?: string;
}

export function TimezoneSelector({
  value,
  onChange,
  label = "Timezone"
}: TimezoneSelectorProps) {
  const [timezones, setTimezones] = useState(getCommonTimezones());
  const [selectedTimezone, setSelectedTimezone] = useState(value || '');

  // Auto-detect timezone on mount if none is provided
  useEffect(() => {
    if (!selectedTimezone) {
      const detected = detectClientTimezone();
      setSelectedTimezone(detected);
      onChange(detected);
    }
  }, [selectedTimezone, onChange]);

  const handleChange = (newTimezone: string) => {
    setSelectedTimezone(newTimezone);
    onChange(newTimezone);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Select value={selectedTimezone} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((timezone) => (
            <SelectItem key={timezone.value} value={timezone.value}>
              {timezone.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Times will be displayed in your selected timezone
      </p>
    </div>
  );
}