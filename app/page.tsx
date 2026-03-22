'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import TimeSlots from '@/components/TimeSlots';
import BookingForm from '@/components/BookingForm';
import { TimeSlot } from '@/lib/booking';
import { getAvailableSlots } from './actions';
import { CheckCircle2, Calendar as CalendarIcon, Clock, User, ArrowLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      getAvailableSlots(selectedDate)
        .then(setSlots)
        .finally(() => setIsLoadingSlots(false));
    }
  }, [selectedDate]);

  if (isBooked && selectedSlot) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-10 text-center border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic mb-2 tracking-tight underline cursor-default">You're Booked!</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">A confirmation email has been sent to you.</p>
          
          <div className="space-y-4 text-left bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center space-x-3 text-zinc-700 dark:text-zinc-300">
              <CalendarIcon className="w-5 h-5 opacity-50" />
              <span className="font-bold">{format(selectedSlot.startTime, 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-3 text-zinc-700 dark:text-zinc-300">
              <Clock className="w-5 h-5 opacity-50" />
              <span className="font-bold">{format(selectedSlot.startTime, 'hh:mm aa')} - {format(selectedSlot.endTime, 'hh:mm aa')}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsBooked(false);
              setSelectedDate(null);
              setSelectedSlot(null);
            }}
            className="mt-10 w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl hover:opacity-90 transition-all uppercase tracking-widest text-sm"
          >
            Schedule another meeting
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span>Direct Scheduling</span>
            </div>
            <h1 className="text-5xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tighter cursor-default">Book a <span className="text-blue-600">Meeting</span></h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">Select a time that works for you. 30 minutes duration.</p>
          </div>
          
          {selectedDate && (
             <button 
              onClick={() => {
                setSelectedDate(null);
                setSelectedSlot(null);
              }}
              className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold uppercase tracking-widest text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Choose different date</span>
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Progress Indicator (Mobile) */}
          <div className="lg:hidden flex space-x-4 mb-4">
            <div className={`h-1 flex-1 rounded-full ${!selectedDate ? 'bg-blue-600' : 'bg-zinc-200'}`} />
            <div className={`h-1 flex-1 rounded-full ${selectedDate && !selectedSlot ? 'bg-blue-600' : 'bg-zinc-200'}`} />
            <div className={`h-1 flex-1 rounded-full ${selectedSlot ? 'bg-blue-600' : 'bg-zinc-200'}`} />
          </div>

          {!selectedSlot ? (
            <>
              <div className="lg:col-span-7 xl:col-span-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={(date) => setSelectedDate(date)} 
                  />
                </div>
              </div>

              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-12 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <div className="px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-xs">Available Times</h3>
                    {selectedDate && <span className="text-blue-600 font-bold text-xs">{format(selectedDate, 'MMM d')}</span>}
                  </div>
                  {!selectedDate ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-100 dark:border-zinc-700">
                        <CalendarIcon className="w-8 h-8 text-zinc-300" />
                      </div>
                      <p className="text-zinc-400 font-medium text-sm">Pick a date to see availability</p>
                    </div>
                  ) : (
                    <TimeSlots 
                      slots={slots} 
                      isLoading={isLoadingSlots} 
                      selectedSlot={selectedSlot}
                      onSlotSelect={(slot) => setSelectedSlot(slot)}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-8 lg:col-start-3 max-w-2xl mx-auto w-full">
              <BookingForm 
                selectedSlot={selectedSlot}
                onSuccess={() => setIsBooked(true)}
                onCancel={() => setSelectedSlot(null)}
              />
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-10 text-center flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">Powered by Next.js 14 & Neon</p>
        <a 
          href="/admin" 
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-bold uppercase tracking-widest transition-colors flex items-center"
        >
          <span>Admin Dashboard</span>
          <ChevronRight className="w-3 h-3 ml-1" />
        </a>
      </footer>
    </main>
  );
}
