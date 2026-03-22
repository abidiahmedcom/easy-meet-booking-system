'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { TimeSlot } from '@/lib/booking';
import { createBooking } from '@/app/actions';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

interface BookingFormProps {
  selectedSlot: TimeSlot;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookingForm({ selectedSlot, onSuccess, onCancel }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('startTime', selectedSlot.startTime.toISOString());
      formData.append('endTime', selectedSlot.endTime.toISOString());

      await createBooking(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tight underline">Confirm Booking</h2>
          <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-wider">
            {format(selectedSlot.startTime, 'EEEE, MMMM do')}
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold uppercase transition-colors"
        >
          Change time
        </button>
      </div>

      <div className="mb-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center space-x-3 text-blue-700 dark:text-blue-400">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center font-bold text-lg">
            30
          </div>
          <div>
            <p className="font-bold text-lg">{format(selectedSlot.startTime, 'hh:mm aa')} - {format(selectedSlot.endTime, 'hh:mm aa')}</p>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">30 minutes meeting</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Full Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="John Doe"
            className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-100"
          />
          {errors.name && <p className="mt-2 text-red-500 text-xs font-bold">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="john@example.com"
            className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-100"
          />
          {errors.email && <p className="mt-2 text-red-500 text-xs font-bold">{errors.email.message}</p>}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-70 disabled:grayscale flex items-center justify-center space-x-3"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              <span>Confirm Meeting</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
