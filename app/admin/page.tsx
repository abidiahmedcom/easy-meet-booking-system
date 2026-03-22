import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { Trash2, Calendar, Clock, ChevronRight, Settings, LayoutDashboard } from 'lucide-react';
import { deleteBooking } from '../actions';
import AvailabilityEditor from '@/components/AvailabilityEditor';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab || 'bookings';

  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: 'asc' },
  });

  const availabilities = await prisma.availability.findMany({
    orderBy: { dayOfWeek: 'asc' },
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tight underline">Admin Dashboard</h1>
            <p className="text-zinc-500 font-medium mt-1">Manage your bookings and availability.</p>
          </div>
          <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <a 
              href="/admin?tab=bookings"
              className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                tab === 'bookings' 
                  ? 'bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white' 
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Bookings</span>
            </a>
            <a 
              href="/admin?tab=availability"
              className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                tab === 'availability' 
                  ? 'bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white' 
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </a>
          </div>
        </header>

        {tab === 'bookings' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Booking List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <h2 className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em] text-xs">Upcoming Bookings</h2>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {bookings.length} Total
                  </span>
                </div>
                
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {bookings.length === 0 ? (
                    <div className="p-12 text-center text-zinc-400 font-medium">
                      No bookings found yet.
                    </div>
                  ) : (
                    bookings.map((booking: any) => (
                      <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-black text-zinc-900 dark:text-zinc-100 text-lg">{format(booking.startTime, 'MMM d, yyyy')}</p>
                              <div className="flex items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3 mr-1" />
                                {format(booking.startTime, 'hh:mm aa')} - {format(booking.endTime, 'hh:mm aa')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="h-10 w-px bg-zinc-100 dark:bg-zinc-800 hidden md:block" />
                          
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">{booking.name}</p>
                            <p className="text-sm text-zinc-500 font-medium">{booking.email}</p>
                          </div>
                        </div>

                        <form action={async () => {
                          'use server';
                          await deleteBooking(booking.id);
                        }}>
                          <button className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Availability Overview */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em] text-xs">Weekly Schedule</h2>
                </div>
                <div className="p-6 space-y-4">
                  {days.map((dayName, index) => {
                    const dayAvail = availabilities.find((a: any) => a.dayOfWeek === index);
                    return (
                      <div key={dayName} className="flex items-center justify-between py-2">
                         <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{dayName}</span>
                         {dayAvail ? (
                           <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                             {dayAvail.startTime} - {dayAvail.endTime}
                           </span>
                         ) : (
                           <span className="text-xs font-bold text-zinc-400">Unavailable</span>
                         )}
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                  <a 
                    href="/admin?tab=availability"
                    className="w-full py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center"
                  >
                    <span>Edit Schedule</span>
                    <ChevronRight className="w-3 h-3 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <AvailabilityEditor initialAvailabilities={availabilities} />
          </div>
        )}
      </div>
    </div>
  );
}
