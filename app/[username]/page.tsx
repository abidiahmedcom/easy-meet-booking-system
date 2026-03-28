"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getUserProfile, getBookedSlots } from "../actions";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isBefore, 
  startOfDay, 
  getDay,
  parse,
  addMinutes,
  isSameDay,
  isAfter
} from "date-fns";
import Navbar from "../components/Navbar";
import { User } from "../../lib/types";

export default function BookingPage({ params }: { params: Promise<{ username: string }> }) {
  const [user, setUser] = useState<User & { isOwner: boolean } | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date())); // Use current date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("Google Meet");
  const [otherDetails, setOtherDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    params.then((p) => {
        const actionsPromise = import("../actions");
        
        Promise.all([
           getUserProfile(p.username),
           actionsPromise.then(a => a.getCurrentUser())
         ]).then(([profile, current]) => {
           if (profile) {
               const isOwner = !!(current && current.id === profile.id);
               setUser({ ...profile, isOwner });
           }
           setLoading(false);
         });
    });
  }, [params]);

  useEffect(() => {
    if (user?.id && selectedDate) {
      getBookedSlots(user.id, selectedDate).then(slots => {
        setBookedSlots(slots);
      });
    }
  }, [user?.id, selectedDate]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F4F4F0] font-black text-4xl">LOADING...</div>;
  if (!user) return notFound();

  const u = user;
  const availableDaysArray = u.availableDays ? u.availableDays.split(",").map(Number) : [1,2,3,4,5];
  const getSafeOverrides = (overrides: unknown) => {
    if (!overrides) return {};
    if (typeof overrides === 'string') {
        try { return JSON.parse(overrides); } catch { return {}; }
    }
    return overrides as Record<string, import("../../lib/types").DateOverride>;
  };
  const dateOverrides = getSafeOverrides(u.dateOverrides);
  const monthsUpfront = u.monthsUpfront ?? 3;
  
  const today = startOfDay(new Date());
  const maxDate = endOfMonth(addMonths(today, monthsUpfront - 1));

  // Helper to check availability
  const getDayDetails = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    
    const override = dateOverrides[dateStr];
    const isAvailable = override ? override.available : availableDaysArray.includes(dayOfWeek);
    
    // Default slot if no override or no slots in override
    const defaultSlots = [{ start: u.availableStart || "09:00", end: u.availableEnd || "17:30" }];
    const slots = (override && override.slots && override.slots.length > 0) ? override.slots : defaultSlots;

    return { isAvailable, slots };
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  
  const days: ({ type: 'empty' } | { type: 'day', date: Date, available: boolean })[] = [
    ...Array.from({ length: firstDayOfMonth }, () => ({ type: 'empty' as const })),
    ...daysInMonth.map(date => {
      const { isAvailable } = getDayDetails(date);
      const isPast = isBefore(date, today);
      return {
        type: 'day' as const,
        date: date,
        available: isAvailable && !isPast,
      };
    })
  ];

  // Fill up to 35 or 42 to keep grid consistent if needed, but 7-column grid handles it
  
  // Generate time slots
  const generateTimeSlots = (intervals: {start: string, end: string}[], dur: number, date: Date) => {
    const allSlots: string[] = [];
    const now = new Date(); // In production this would be real time
    // For our simulation we'll use the current metadata time if we want to be precise, 
    // but new Date() is the standard way.

    intervals.forEach(interval => {
        let current = parse(interval.start, 'HH:mm', date);
        const end = parse(interval.end, 'HH:mm', date);
        
        while (current < end) {
            // Only add if it's in the future (or if it's a future day)
            if (isAfter(current, now) || !isSameDay(date, now)) {
              allSlots.push(format(current, 'h:mm a'));
            }
            current = addMinutes(current, dur);
        }
    });

    return Array.from(new Set(allSlots));
  };

  const selectedDetails = getDayDetails(selectedDate);
  const isSelectedDatePast = isBefore(selectedDate, today);
  const allTimes = (selectedDetails.isAvailable && !isSelectedDatePast)
    ? generateTimeSlots(selectedDetails.slots, u.duration || 30, selectedDate)
    : [];
  
  // Filter out already booked slots
  const times = allTimes.filter(t => !bookedSlots.includes(t));


  const handlePrevMonth = () => {
    if (!isSameMonth(currentMonth, today)) {
        setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

   const handleNextMonth = () => {
     if (isBefore(currentMonth, startOfMonth(maxDate))) {
         setCurrentMonth(addMonths(currentMonth, 1));
     }
   };

   const handleBooking = async () => {
     if (!selectedTime || !guestEmail || !guestName) {
         alert("Please fill in all required fields.");
         return;
     }

     setIsSubmitting(true);
     try {
         const { createBooking } = await import("../actions");
         await createBooking({
             userId: user.id,
             guestName,
             guestEmail,
             date: selectedDate,
             time: selectedTime,
             location: meetingLocation,
             locationDetails: meetingLocation === "Other" ? otherDetails : undefined,
         });
         setBookingSuccess(true);
     } catch (error) {
         console.error("Booking failed:", error);
         alert("Booking failed. Please try again.");
     } finally {
         setIsSubmitting(false);
     }
   };



  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col items-center bg-[#F4F4F0] text-black font-sans relative lg:overflow-hidden">
      <Navbar user={u} />

      <div className="w-full flex-1 max-w-[1400px] flex flex-col lg:min-h-0 relative z-10 px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8 pt-0">
        
        {/* Main Card */}
        <main className="w-full flex-1 flex flex-col lg:min-h-0 border-x-[3px] border-b-[3px] md:border-x-[4px] md:border-b-[4px] border-black bg-[#f4f4f0] shadow-none lg:overflow-hidden relative z-10">
          <div className="shrink-0 p-4 md:p-6 lg:px-10 lg:py-6 border-b-[3px] md:border-b-[4px] border-black bg-white">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-black">
              Book an Introductory Consultation
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 lg:min-h-0">
            {/* Left Column */}
            <div className="w-full shrink-0 lg:shrink lg:w-[32%] p-6 md:p-8 lg:p-10 border-b-[3px] md:border-b-[4px] lg:border-b-0 lg:border-r-[4px] border-black flex flex-col bg-white">
              <h2 className="text-3xl md:text-[42px] font-black leading-[1.1] mb-4 md:mb-6 tracking-tight">
                {u.duration}-Minute<br />Introduction
              </h2>
              <p className="text-lg md:text-[22px] font-medium leading-[1.4] mb-10 text-black/90 tracking-tight">
                A quick introductory call to discuss your project, goals, and how we can collaborate effectively with {user.name}.
              </p>
              <div className="mt-auto flex flex-col gap-2 text-lg md:text-[22px]">
                <p><span className="font-extrabold">Duration:</span> {u.duration} Min</p>
                <p><span className="font-extrabold">Location:</span> {u.location}</p>
              </div>
            </div>

            {/* Middle Column */}
            <div className="w-full lg:w-[42%] flex flex-col lg:min-h-0 border-b-[3px] md:border-b-[4px] lg:border-b-0 lg:border-r-[4px] border-black bg-[#f4f4f0]">
              <div className="flex shrink-0 justify-between items-center px-6 py-4 md:px-6 md:py-5 border-b-[3px] md:border-b-[4px] border-black bg-[#f4f4f0]">
                <h3 className="text-2xl md:text-[36px] font-black tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h3>
                <div className="flex items-center gap-4 text-xl md:text-[26px] font-bold">
                  <button 
                    onClick={handlePrevMonth} 
                    disabled={isSameMonth(currentMonth, today)}
                    className="hover:scale-110 active:scale-95 transition-transform disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    &larr;
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    disabled={!isBefore(currentMonth, startOfMonth(maxDate))}
                    className="hover:scale-110 active:scale-95 transition-transform disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    &rarr;
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white lg:min-h-0">
                <div className="shrink-0 grid grid-cols-7 border-b-[3px] md:border-b-[4px] border-black text-center bg-white">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                    <div key={d} className={`py-2 md:py-3 text-center font-extrabold text-lg md:text-[20px] tracking-tight ${i !== 6 ? 'border-r-[3px] md:border-r-[4px] border-black' : ''}`}>
                      {d}
                    </div>
                  ))}
                </div>
                
                <div className="lg:flex-1 grid grid-cols-7 grid-rows-5 lg:h-full bg-[#f4f4f0]">
                  {days.map((day, i) => {
                    const isRightEdge = (i + 1) % 7 === 0;
                    const isBottomRow = i >= days.length - 7;
                    const isActive = day.type === 'day' && isSameDay(selectedDate, day.date);
                    const isAvailable = day.type === 'day' && day.available;
                    
                    return (
                      <button 
                        key={i} 
                        onClick={() => isAvailable && setSelectedDate(day.date)}
                        className={`flex flex-col items-center justify-center p-[6px] relative transition-all active:scale-95
                          ${!isRightEdge ? 'border-r-[3px] md:border-r-[4px] border-black' : ''}
                          ${!isBottomRow ? 'border-b-[3px] md:border-b-[4px] border-black' : ''}
                          ${isActive ? 'bg-[#0A5CFF]' : 'bg-transparent hover:bg-gray-100'}
                          ${!isAvailable ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {day.type === 'day' && day.date && (
                          <div className={`w-full h-full flex items-center justify-center text-xl md:text-[32px] font-black tracking-tight
                            ${isActive ? 'text-white' : 'text-black'}
                            ${isAvailable && !isActive ? 'border-[3px] border-[#0A5CFF]' : ''}
                          `}>
                            {format(day.date, 'd')}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Time Slots */}
             <div className="w-full lg:w-[26%] flex flex-col bg-[#f4f4f0] lg:min-h-0 lg:overflow-hidden text-black p-4 md:p-6 lg:p-8">
              {bookingSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300 text-center p-4">
                  <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center text-3xl font-black border-[3px] border-black">
                    ✓
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Booking Confirmed!</h3>
                  <div className="flex flex-col gap-1 text-lg">
                    <p className="font-black">{format(selectedDate, 'MMMM d, yyyy')}</p>
                    <p className="font-bold">at {selectedTime}</p>
                  </div>
                  <p className="text-sm font-bold opacity-60 leading-relaxed">
                    A confirmation email has been sent to <strong>{guestEmail}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      setSelectedTime(null);
                      setGuestName("");
                      setGuestEmail("");
                      setOtherDetails("");
                    }}
                    className="mt-4 px-6 py-3 bg-black text-white font-black uppercase border-[3px] border-black hover:bg-[#0A5CFF] transition-all active:scale-95 cursor-pointer"
                  >
                    Book Another
                  </button>
                </div>
              ) : !selectedTime ? (
                <>
                  <div className="flex-1 flex flex-col pb-6 gap-3 pr-2 custom-scrollbar lg:overflow-y-auto lg:min-h-0">
                    {times.length > 0 ? times.map((time, index) => {
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedTime(time)}
                          className="w-full min-h-[60px] text-center text-xl md:text-[28px] font-black tracking-tight border-[3px] md:border-[4px] border-black flex items-center justify-center bg-white text-black hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                          {time}
                        </button>
                      );
                    }) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <p className="font-black text-2xl opacity-40 uppercase">No slots available for this date.</p>
                        </div>
                    )}
                  </div>

                  {times.length > 0 && (
                    <div className="shrink-0 w-full mt-auto bg-black text-white h-[90px] md:h-[90px] flex flex-col items-center justify-center border-[3px] md:border-[4px] border-black relative overflow-hidden">
                      <span className="font-bold text-xl md:text-[26px] tracking-tight text-white/60 text-center px-4">SELECT A TIME ABOVE</span>
                      <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300 pr-2 custom-scrollbar lg:overflow-y-auto lg:min-h-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Your Details</h3>
                    <button onClick={() => setSelectedTime(null)} className="text-sm font-bold uppercase underline hover:opacity-70 active:scale-95 transition-all cursor-pointer">Change Time</button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase opacity-40">Selected Slot</label>
                      <p className="text-xl font-black">{format(selectedDate, 'MMM d')} at {selectedTime}</p>
                    </div>



                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase opacity-40">Name</label>
                      <input 
                        type="text" 
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="p-3 border-[3px] border-black outline-none font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase opacity-40">Email</label>
                      <input 
                        type="email" 
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="p-3 border-[3px] border-black outline-none font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase opacity-40">Meeting Platform</label>
                      <div className="flex flex-col gap-2">
                         <label className="flex items-center gap-2 cursor-pointer font-bold">
                            <input 
                              type="radio" 
                              name="location" 
                              value="Google Meet" 
                              checked={meetingLocation === "Google Meet"}
                              onChange={(e) => setMeetingLocation(e.target.value)}
                              className="w-5 h-5 accent-black"
                            />
                            Google Meet (Default)
                         </label>
                         {u.allowOtherLocation && (
                           <label className="flex items-center gap-2 cursor-pointer font-bold">
                              <input 
                                type="radio" 
                                name="location" 
                                value="Other" 
                                checked={meetingLocation === "Other"}
                                onChange={(e) => setMeetingLocation(e.target.value)}
                                className="w-5 h-5 accent-black"
                              />
                              Other...
                           </label>
                         )}
                      </div>
                    </div>

                    {meetingLocation === "Other" && (
                      <div className="flex flex-col gap-1 animate-in fade-in duration-200">
                        <label className="text-xs font-black uppercase opacity-40">Other Meeting Place / Request</label>
                        <textarea 
                          value={otherDetails}
                          onChange={(e) => setOtherDetails(e.target.value)}
                          placeholder="e.g. Can we meet on Discord? My handle is..."
                          className="p-3 border-[3px] border-black outline-none font-bold h-24 resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleBooking}
                    disabled={isSubmitting}
                    className="w-full mt-auto bg-black text-white h-[80px] flex items-center justify-center border-[3px] border-black cursor-pointer hover:bg-[#0A5CFF] transition-all active:scale-[0.98] disabled:active:scale-100 disabled:opacity-50"
                  >
                    <span className="font-black text-2xl tracking-tight uppercase">
                      {isSubmitting ? "BOOKING..." : "CONFIRM BOOKING"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

