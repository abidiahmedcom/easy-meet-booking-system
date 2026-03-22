'use client';

import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TimeSlot } from '@/lib/booking';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export default function TimeSlots({ slots, selectedSlot, onSlotSelect, isLoading }: TimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
        <p className="font-medium">No available slots</p>
        <p className="text-sm">Please select a different date.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
      {slots.map((slot, index) => {
        const isSelected = selectedSlot?.startTime.getTime() === slot.startTime.getTime();
        const isDisabled = !slot.isAvailable;

        return (
          <button
            key={index}
            disabled={isDisabled}
            onClick={() => onSlotSelect(slot)}
            className={cn(
              "flex items-center justify-between px-6 py-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
              isDisabled
                ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                : isSelected
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            )}
          >
            <span>{format(slot.startTime, 'hh:mm aa')}</span>
            {!isDisabled && !isSelected && <span className="text-xs text-blue-500 font-bold opacity-0 group-hover:opacity-100">Select</span>}
            {isSelected && <span className="text-xs font-bold">Selected</span>}
          </button>
        );
      })}
    </div>
  );
}
