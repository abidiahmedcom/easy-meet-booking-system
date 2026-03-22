'use client';

import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfDay 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
        {days.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const today = startOfDay(new Date());

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, today);
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-14 border-r border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-center transition-all duration-200",
              isDisabled ? "bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-300 dark:text-zinc-700 cursor-not-allowed" : "hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer",
              isSelected && "bg-blue-600 !text-white hover:bg-blue-700"
            )}
            onClick={() => !isDisabled && onDateSelect(cloneDay)}
          >
            <span className={cn("text-sm font-medium", isSelected && "font-bold")}>
              {formattedDate}
            </span>
            {isSameDay(day, today) && !isSelected && (
              <div className="absolute bottom-2 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-t border-zinc-100 dark:border-zinc-800">{rows}</div>;
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
