'use client';

import { useState } from 'react';
import { updateAvailability } from '@/app/actions';
import { Loader2, Check, X, Clock } from 'lucide-react';

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilityEditorProps {
  initialAvailabilities: Availability[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityEditor({ initialAvailabilities }: AvailabilityEditorProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>(
    DAYS.map((_, i) => {
      const existing = initialAvailabilities.find(a => a.dayOfWeek === i);
      return existing || { dayOfWeek: i, startTime: '09:00', endTime: '17:00' };
    })
  );
  
  const [activeTab, setActiveTab] = useState(1); // Default to Monday
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (day: number) => {
    setIsSaving(true);
    setMessage(null);
    const avail = availabilities.find(a => a.dayOfWeek === day)!;
    
    try {
      await updateAvailability(day, avail.startTime, avail.endTime);
      setMessage({ type: 'success', text: `Saved configuration for ${DAYS[day]}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalAvail = (day: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailabilities(prev => prev.map(a => 
      a.dayOfWeek === day ? { ...a, [field]: value } : a
    ));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em] text-xs">Work Hours Config</h2>
        {isSaving && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
      </div>

      <div className="flex border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto custom-scrollbar">
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
              activeTab === i 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30 dark:bg-blue-900/10' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Clock className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{DAYS[activeTab]} Availability</h3>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Define your time range</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Start Time</label>
                <input 
                  type="time" 
                  value={availabilities[activeTab].startTime}
                  onChange={(e) => updateLocalAvail(activeTab, 'startTime', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl focus:border-blue-500 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">End Time</label>
                <input 
                  type="time" 
                  value={availabilities[activeTab].endTime}
                  onChange={(e) => updateLocalAvail(activeTab, 'endTime', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl focus:border-blue-500 outline-none font-bold"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleUpdate(activeTab)}
            disabled={isSaving}
            className="md:self-end h-14 md:px-10 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            <span className="uppercase tracking-widest text-xs">Save Changes</span>
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl flex items-center space-x-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
