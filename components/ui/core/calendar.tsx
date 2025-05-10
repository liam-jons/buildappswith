'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(new Date());

  const handlePreviousClick = () => {
    setMonth(subMonths(month, 1));
  };

  const handleNextClick = () => {
    setMonth(addMonths(month, 1));
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">
          {format(month, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handlePreviousClick}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handleNextClick}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs font-medium text-center mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="py-1.5">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays(month, props.selected).map((day, i) => (
          <div 
            key={i}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md text-sm",
              day.isCurrentMonth ? "hover:bg-accent cursor-pointer" : "text-muted-foreground opacity-30",
              day.isToday && "border border-primary",
              day.isSelected && "bg-primary text-primary-foreground font-medium",
              !day.isSelectable && "pointer-events-none opacity-50",
            )}
            onClick={() => {
              if (day.isCurrentMonth && day.isSelectable && props.onSelect) {
                props.onSelect(day.date);
              }
            }}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to generate calendar days
function generateCalendarDays(currentMonth: Date, selectedDate?: Date | Date[]) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0-indexed (0 = Sunday)
  
  // Create array for all days in the month view (previous month, current month, next month)
  const days = [];
  
  // Add days from previous month to fill first week
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: isSelectedDay(date, selectedDate),
      isSelectable: true
    });
  }
  
  // Add days from current month
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: isSelectedDay(date, selectedDate),
      isSelectable: true
    });
  }
  
  // Add days from next month to fill last week
  const daysNeeded = 42 - days.length; // 6 rows of 7 days
  for (let i = 1; i <= daysNeeded; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isSelectedDay(date, selectedDate),
      isSelectable: true
    });
  }
  
  return days;
}

// Helper to check if a date is the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Helper to check if a date is selected
function isSelectedDay(date: Date, selectedDate?: Date | Date[]): boolean {
  if (!selectedDate) return false;
  
  if (Array.isArray(selectedDate)) {
    return selectedDate.some(selected => isSameDay(date, selected));
  }
  
  return isSameDay(date, selectedDate);
}