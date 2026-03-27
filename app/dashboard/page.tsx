"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserAvailability, getOwnerBookings, cancelBooking, confirmBooking, recoverBooking } from "../actions";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  getDay,
  startOfDay,
  isSameMonth,
  isBefore,
  isSameDay
} from "date-fns";
import Navbar from "../components/Navbar";
import { User, Booking } from "../../lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "availability" | "settings" | "bookings">("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">("ALL");

  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [availableDays, setAvailableDays] = useState<string[]>(["1", "2", "3", "4", "5"]);
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState("Google Meet");
  const [allowOtherLocation, setAllowOtherLocation] = useState(false);
  const [monthsUpfront, setMonthsUpfront] = useState(3);
  const [emailConfirmationMsg, setEmailConfirmationMsg] = useState("");
  const [emailCancellationMsg, setEmailCancellationMsg] = useState("");
  const [dateOverrides, setDateOverrides] = useState<Record<string, {available: boolean, slots?: {start: string, end: string}[]}>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(startOfMonth(new Date()));
  const [setupUsername, setSetupUsername] = useState("");

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const data = await getOwnerBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    import("../actions").then(actions => {
      actions.getCurrentUser().then(curr => {
        if (!curr) {
          router.push("/");
        } else {
          const userTyped = curr as User;
          setUser(userTyped);
          if (userTyped.availableStart) setStart(userTyped.availableStart);
          if (userTyped.availableEnd) setEnd(userTyped.availableEnd);
          if (userTyped.availableDays) setAvailableDays(userTyped.availableDays.split(","));
          if (userTyped.duration) setDuration(userTyped.duration);
          if (userTyped.location) setLocation(userTyped.location);
          if (userTyped.allowOtherLocation !== undefined) setAllowOtherLocation(userTyped.allowOtherLocation);
          if (userTyped.monthsUpfront !== undefined) setMonthsUpfront(userTyped.monthsUpfront);
          if (userTyped.emailConfirmationMsg) setEmailConfirmationMsg(userTyped.emailConfirmationMsg);
          if (userTyped.emailCancellationMsg) setEmailCancellationMsg(userTyped.emailCancellationMsg);
          // @ts-expect-error - Prisma Json type mismatch
          if (userTyped.dateOverrides) setDateOverrides(userTyped.dateOverrides);
          fetchBookings();
        }
      });
    });
  }, [router]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? The visitor will be notified.")) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    setConfirmingId(bookingId);
    try {
      await confirmBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      console.error("Failed to confirm booking:", err);
      alert("Failed to confirm booking.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleRecoverBooking = async (bookingId: string) => {
    setRecoveringId(bookingId);
    try {
      await recoverBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      console.error("Failed to recover booking:", err);
      alert("Failed to recover booking.");
    } finally {
      setRecoveringId(null);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newUsername = formData.get("username") as string;
    if (!newUsername) return;
    
    const actions = await import("../actions");
    if (user?.id) {
      const updated = await actions.updateUsername(user.id, newUsername);
      setUser(updated);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
      </div>
    );
  }

  if (!user.username) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border-[4px] border-black p-8 md:p-12 shadow-[12px_12px_0_0_#000]">
          <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter">Choose your path</h2>
          
          <div className="mb-10 p-6 bg-[#0A5CFF]/5 border-l-[6px] border-[#0A5CFF]">
            <p className="text-xl font-bold text-[#0A5CFF] mb-2 uppercase tracking-wide text-sm opacity-80">Personal Booking Link</p>
            <p className="text-2xl font-black break-all">
                {typeof window !== "undefined" ? window.location.host : "meetflow.com"}/<span className="text-[#0A5CFF] underline decoration-4 underline-offset-4">{setupUsername || "username"}</span>
            </p>
          </div>

          <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-8 text-left">
            <div className="flex flex-col gap-3">
              <label className="font-black uppercase text-base tracking-widest opacity-60">Your unique handle</label>
              <input 
                name="username"
                required
                type="text" 
                value={setupUsername}
                onChange={(e) => setSetupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="p-5 border-[4px] border-black text-3xl font-black outline-none focus:ring-8 focus:ring-[#0A5CFF]/10 transition-all placeholder:opacity-20 uppercase"
                placeholder="e.g. MARK-Z"
              />
              <p className="text-sm font-bold opacity-40 uppercase tracking-tighter mt-1 italic">Only lowercase letters, numbers, and dashes allowed.</p>
            </div>
            
            <button 
              type="submit"
              className="bg-black text-white font-black text-2xl py-6 border-[4px] border-black shadow-[6px_6px_0_0_#0A5CFF] hover:shadow-[10px_10px_0_0_#0A5CFF] hover:-translate-y-1 active:shadow-[2px_2px_0_0_#0A5CFF] active:translate-y-[4px] active:translate-x-[4px] transition-all uppercase tracking-widest cursor-pointer"
            >
              FINISH SETUP & GO TO DASHBOARD
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user || !user.username) return;
    const updated = await updateUserAvailability(
      user.username, 
      start, 
      end, 
      availableDays.join(","), 
      duration, 
      location,
      allowOtherLocation,
      dateOverrides,
      monthsUpfront,
      emailConfirmationMsg,
      emailCancellationMsg
    );
    setUser(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
    alert("Preferences saved!");
  };

  if (!user) return null;

  const publicLink = `${window.location.origin}/${user.username}`;

  const daysOfWeek = [
    { label: "Mon", value: "1" },
    { label: "Tue", value: "2" },
    { label: "Wed", value: "3" },
    { label: "Thu", value: "4" },
    { label: "Fri", value: "5" },
    { label: "Sat", value: "6" },
    { label: "Sun", value: "0" },
  ];

  const toggleDay = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const updateDateOverride = (dateStr: string, updates: Partial<{available: boolean, slots: {start: string, end: string}[]}>) => {
    setDateOverrides(prev => {
        const current = prev[dateStr] || { 
            available: availableDays.includes(new Date(dateStr).getDay().toString()),
            slots: [{ start: start, end: end }]
        };
        return {
            ...prev,
            [dateStr]: { ...current, ...updates }
        };
    });
  };

  const addSlot = (dateStr: string) => {
    setDateOverrides(prev => {
        const current = prev[dateStr] || { 
            available: true,
            slots: [{ start: start, end: end }]
        };
        return {
            ...prev,
            [dateStr]: { 
                ...current, 
                slots: [...(current.slots || []), { start: "13:00", end: "15:00" }] 
            }
        };
    });
  };

  const removeSlot = (dateStr: string, index: number) => {
    setDateOverrides(prev => {
        const current = prev[dateStr];
        if (!current || !current.slots) return prev;
        const newSlots = current.slots.filter((_, i) => i !== index);
        return {
            ...prev,
            [dateStr]: { ...current, slots: newSlots }
        };
    });
  };

  const updateSlot = (dateStr: string, index: number, field: 'start' | 'end', value: string) => {
    setDateOverrides(prev => {
        const current = prev[dateStr];
        if (!current || !current.slots) return prev;
        const newSlots = [...current.slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        return {
            ...prev,
            [dateStr]: { ...current, slots: newSlots }
        };
    });
  };

  const removeDateOverride = (dateStr: string) => {
    setDateOverrides(prev => {
        const next = { ...prev };
        delete next[dateStr];
        return next;
    });
  };

  // Logic to generate the calendar days for the current month
  const today = startOfDay(new Date());
  const currentYear = viewDate.getFullYear();
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate)
  });

  const firstDayOfMonth = getDay(startOfMonth(viewDate));
  
  const monthName = format(viewDate, 'MMMM');

  // Helper to format date for display
  const formatDateLabel = (dateStr: string) => {
    // Add time to avoid timezone issues when parsing YYYY-MM-DD
    return format(new Date(dateStr + 'T12:00:00'), 'MMM d, yyyy');
  };

  return (
    <div className="h-screen bg-[#F4F4F0] text-black font-sans overflow-hidden flex flex-col">
      <Navbar user={user} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      
      <div className="max-w-4xl w-full mx-auto flex flex-col min-h-0 px-4 pb-4 md:px-8 md:pb-8 pt-0 h-full">

        <div className="flex-1 min-h-0 bg-white border-x-[4px] border-b-[4px] border-black shadow-[8px_8px_0_0_#000] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-8">
            
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-3xl font-black uppercase">Booking Overview</h2>
                <div className="p-6 bg-[#F4F4F0] border-[3px] border-black">
                   <p className="text-xl font-medium mb-4">Your public link is ready for clients:</p>
                   <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    <input 
                      readOnly 
                      value={publicLink} 
                      className="flex-1 p-4 border-[3px] border-black text-xl font-bold bg-white outline-none"
                    />
                    <button 
                      onClick={() => window.open(publicLink, "_blank")}
                      className="bg-[#0A5CFF] text-white font-black px-8 py-4 border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_0_#000] transition-all cursor-pointer"
                    >
                      VISIT PAGE
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="p-6 border-[3px] border-black bg-white">
                      <p className="text-sm uppercase font-black opacity-50">Duration</p>
                      <p className="text-3xl font-black">{duration} MIN</p>
                   </div>
                   <div className="p-6 border-[3px] border-black bg-white">
                      <p className="text-sm uppercase font-black opacity-50">Location</p>
                      <p className="text-3xl font-black truncate">{location}</p>
                   </div>
                   <div className="p-6 border-[3px] border-black bg-white">
                      <p className="text-sm uppercase font-black opacity-50">Pending</p>
                      <p className="text-3xl font-black">{bookings.filter(b => b.status === 'PENDING').length}</p>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black uppercase">Bookings</h2>
                  <button 
                    onClick={fetchBookings}
                    className="text-sm font-black uppercase border-[2px] border-black px-3 py-1 hover:bg-black hover:text-white active:scale-95 transition-all cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 border-[3px] border-black font-black text-sm uppercase transition-all active:scale-95 cursor-pointer ${
                        filterStatus === status 
                          ? 'bg-black text-white' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {status}
                      <span className="ml-1 opacity-60">
                        ({status === "ALL" 
                          ? bookings.filter(b => b.status !== "CANCELLED").length 
                          : bookings.filter(b => b.status === status).length
                        })
                      </span>
                    </button>
                  ))}
                </div>

                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-black"></div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookings
                      .filter(b => (filterStatus === "ALL" ? b.status !== "CANCELLED" : b.status === filterStatus))
                      .map(booking => (
                        <div 
                          key={booking.id} 
                          className={`p-5 border-[3px] border-black bg-white flex flex-col md:flex-row md:items-center gap-4 transition-all ${
                            booking.status === 'CANCELLED' ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-black">{booking.guestName}</span>
                              <span className={`px-2 py-0.5 text-xs font-black uppercase border-[2px] ${
                                booking.status === 'PENDING' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                                booking.status === 'CONFIRMED' ? 'border-green-500 bg-green-50 text-green-700' :
                                'border-red-500 bg-red-50 text-red-700'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-sm font-bold opacity-60">{booking.guestEmail}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm font-black">
                                📅 {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="text-sm font-black">🕐 {booking.time}</span>
                              <span className="text-sm font-bold opacity-60">📍 {booking.location}</span>
                            </div>
                            {booking.locationDetails && (
                              <p className="text-xs font-bold opacity-50 mt-1">Details: {booking.locationDetails}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  disabled={confirmingId === booking.id}
                                  className="px-4 py-2 border-[3px] border-green-500 text-green-600 font-black text-sm uppercase hover:bg-green-500 hover:text-white transition-all active:scale-95 cursor-pointer disabled:active:scale-100 disabled:opacity-50"
                                >
                                  {confirmingId === booking.id ? 'CONFIRMING...' : 'CONFIRM'}
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={cancellingId === booking.id}
                                  className="px-4 py-2 border-[3px] border-red-500 text-red-600 font-black text-sm uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95 cursor-pointer disabled:active:scale-100 disabled:opacity-50"
                                >
                                  {cancellingId === booking.id ? 'CANCELLING...' : 'CANCEL'}
                                </button>
                              </>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                                className="px-4 py-2 border-[3px] border-red-500 text-red-600 font-black text-sm uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95 cursor-pointer disabled:active:scale-100 disabled:opacity-50"
                              >
                                {cancellingId === booking.id ? 'CANCELLING...' : 'CANCEL'}
                              </button>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <button
                                onClick={() => handleRecoverBooking(booking.id)}
                                disabled={recoveringId === booking.id}
                                className="px-4 py-2 border-[3px] border-[#0A5CFF] text-[#0A5CFF] font-black text-sm uppercase hover:bg-[#0A5CFF] hover:text-white transition-all active:scale-95 cursor-pointer disabled:active:scale-100 disabled:opacity-50"
                              >
                                {recoveringId === booking.id ? 'RECOVERING...' : 'RECOVER'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    {bookings.filter(b => (filterStatus === "ALL" ? b.status !== "CANCELLED" : b.status === filterStatus)).length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-2xl font-black uppercase opacity-30">No {filterStatus === 'ALL' ? '' : filterStatus.toLowerCase()} bookings yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "availability" && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black uppercase">Availability</h2>
                  <button 
                    onClick={handleSave}
                    className="bg-black text-white font-black text-lg px-6 py-2 border-[3px] border-black shadow-[3px_3px_0_0_#0A5CFF] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#0A5CFF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#0A5CFF] transition-all cursor-pointer"
                  >
                    SAVE CHANGES
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Calendar Column */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b-[3px] border-black pb-2">
                       <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black uppercase">{monthName} {currentYear}</h3>
                         <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                    if (!isSameMonth(viewDate, today)) {
                                        setViewDate(subMonths(viewDate, 1));
                                    }
                                }} 
                                disabled={isSameMonth(viewDate, today)}
                                className={`transition-all ${isSameMonth(viewDate, today) ? "opacity-20 cursor-not-allowed" : "hover:scale-120 active:scale-90 cursor-pointer"}`}
                             >
                                &larr;
                             </button>
                             <button 
                                onClick={() => setViewDate(addMonths(viewDate, 1))} 
                                className="hover:scale-120 active:scale-90 transition-transform cursor-pointer"
                             >
                                &rarr;
                             </button>
                         </div>
                       </div>
                      <div className="flex gap-2 text-xs font-black">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#0A5CFF]"></div> Available</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-black"></div> Unavailable</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 bg-black border-[3px] border-black">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="bg-[#F4F4F0] text-center p-2 font-black text-xs border-b-[3px] border-black">{d}</div>
                      ))}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-white/30 h-12 md:h-16"></div>
                      ))}
                      {daysInMonth.map((dateObj) => {
                        const dateNum = dateObj.getDate();
                        const dayOfWeek = dateObj.getDay().toString();
                        const dateStr = format(dateObj, 'yyyy-MM-dd');
                        
                        const isToday = isSameDay(dateObj, today);
                        const isPast = isBefore(dateObj, today) && !isToday;
                        
                        const override = dateOverrides[dateStr];
                        const isAvailable = override ? override.available : availableDays.includes(dayOfWeek);
                        const hasSplits = override && override.slots && override.slots.length > 1;
                        const hasOverride = !!override;

                        return (
                          <button
                            key={dateNum}
                            onClick={() => !isPast && setSelectedDate(dateStr)}
                            disabled={isPast}
                            className={`h-12 md:h-16 flex flex-col items-center justify-center relative transition-all border border-gray-100
                              ${isPast ? 'bg-[#F4F4F0] text-[#D1D1D1] cursor-not-allowed' : 
                                (isAvailable ? 'bg-[#0A5CFF] text-white cursor-pointer hover:bg-[#0047D1]' : 'bg-white text-black cursor-pointer hover:bg-gray-50')}
                              ${selectedDate === dateStr ? 'ring-[4px] ring-black z-20' : ''}
                              ${isToday ? 'ring-[4px] ring-black ring-inset z-10' : ''}
                              ${hasOverride ? 'shadow-inner' : ''}
                            `}
                          >
                            <span className={`text-xl font-black ${isPast ? 'opacity-40' : ''}`}>{dateNum}</span>
                            {hasOverride && !isPast && (
                                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${hasSplits ? 'bg-orange-400' : 'bg-yellow-400'} border border-black/20`}></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings Column */}
                  <div className="flex flex-col gap-6">
                    {selectedDate ? (
                        <div className="p-6 border-[4px] border-black bg-white shadow-[6px_6px_0_0_#000] animate-in slide-in-from-right-4 duration-300">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black uppercase text-[#0A5CFF]">{formatDateLabel(selectedDate)}</h3>
                                <button onClick={() => setSelectedDate(null)} className="font-black text-xs uppercase border-b-2 border-black">Close</button>
                             </div>

                             {(() => {
                                const override = dateOverrides[selectedDate];
                                const currentAvailable = override ? override.available : availableDays.includes(new Date(selectedDate).getDay().toString());
                                const currentSlots = (override && override.slots) || [{ start: start, end: end }];

                                return (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center justify-between p-4 bg-[#F4F4F0] border-[3px] border-black">
                                            <span className="font-black uppercase">Availability</span>
                                            <button 
                                                onClick={() => updateDateOverride(selectedDate, { available: !currentAvailable })}
                                                className={`px-4 py-2 border-[3px] border-black font-extrabold uppercase text-sm ${currentAvailable ? 'bg-[#0A5CFF] text-white' : 'bg-white'}`}
                                            >
                                                {currentAvailable ? 'AVAILABLE' : 'OFF'}
                                            </button>
                                        </div>

                                        {currentAvailable && (
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-black uppercase text-sm opacity-60">Time Intervals</h4>
                                                    <button 
                                                        onClick={() => addSlot(selectedDate)}
                                                        className="text-xs font-black uppercase bg-black text-white px-2 py-1"
                                                    >
                                                        + Add Slot
                                                    </button>
                                                </div>
                                                
                                                <div className="flex flex-col gap-3">
                                                    {currentSlots.map((slot, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 group">
                                                            <div className="flex items-center gap-2 text-sm font-bold bg-white p-2 border-[2px] border-black flex-1">
                                                                <input 
                                                                    type="time" 
                                                                    value={slot.start}
                                                                    onChange={(e) => updateSlot(selectedDate, idx, 'start', e.target.value)}
                                                                    className="outline-none"
                                                                />
                                                                <span className="opacity-40">-</span>
                                                                <input 
                                                                    type="time" 
                                                                    value={slot.end}
                                                                    onChange={(e) => updateSlot(selectedDate, idx, 'end', e.target.value)}
                                                                    className="outline-none"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => removeSlot(selectedDate, idx)}
                                                                className="text-red-500 font-black hover:scale-110 transition-transform"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t-[3px] border-black flex justify-between items-center">
                                            {override && (
                                                <button 
                                                    onClick={() => removeDateOverride(selectedDate)}
                                                    className="text-xs font-black uppercase underline hover:text-red-500"
                                                >
                                                    Reset to Weekly Default
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                             })()}
                        </div>
                    ) : (
                        <div className="p-6 border-[3px] border-black bg-[#F4F4F0]">
                            <h3 className="text-xl font-black uppercase mb-4">Default Weekly Hours</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xl font-bold mb-6">
                                <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                                <label className="text-xs uppercase opacity-60">Starts</label>
                                <input 
                                    type="time" 
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="p-3 border-[3px] border-black outline-none w-full bg-white text-sm md:text-base"
                                />
                                </div>
                                <span className="mt-4 font-black hidden sm:inline">TO</span>
                                <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                                <label className="text-xs uppercase opacity-60">Ends</label>
                                <input 
                                    type="time" 
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="p-3 border-[3px] border-black outline-none w-full bg-white text-sm md:text-base"
                                />
                                </div>
                            </div>

                            <h3 className="text-xl font-black uppercase mb-3">Default Workdays</h3>
                            <div className="flex flex-wrap gap-2">
                                {daysOfWeek.map((day) => (
                                <button
                                    key={day.value}
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-3 py-1.5 border-[3px] border-black font-black text-sm transition-colors ${
                                    availableDays.includes(day.value) 
                                        ? "bg-black text-white" 
                                        : "bg-white text-black hover:bg-gray-200"
                                    }`}
                                >
                                    {day.label}
                                </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <button 
                      onClick={() => { setDateOverrides({}); setSelectedDate(null); }}
                      className="text-xs font-black uppercase underline hover:text-red-600 self-start"
                    >
                      Clear All Monthly Overrides
                    </button>
                    <p className="text-xs font-bold opacity-60 leading-[1.3]">
                      * Select a date to set custom time intervals. You can add multiple slots per day (e.g. 8-11am AND 1-4pm).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-3xl font-black uppercase">Meeting Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-4">
                    <label className="text-sm uppercase font-black opacity-60">Meeting Duration (Minutes)</label>
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                      className="p-4 border-[3px] border-black outline-none text-2xl font-black"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-sm uppercase font-black opacity-60">Meeting Location</label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="p-4 border-[3px] border-black outline-none text-2xl font-bold"
                      placeholder="e.g. Google Meet, Microsoft Teams"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-sm uppercase font-black opacity-60">Months Upfront</label>
                    <input 
                      type="number" 
                      value={monthsUpfront}
                      onChange={(e) => setMonthsUpfront(parseInt(e.target.value) || 1)}
                      className="p-4 border-[3px] border-black outline-none text-2xl font-black"
                      min="1"
                      max="24"
                    />
                    <p className="text-xs font-bold opacity-60">How many months ahead can users book meetings?</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-[#0A5CFF]/10 border-[3px] border-[#0A5CFF] border-dashed">
                  <input 
                    type="checkbox" 
                    id="allowOtherLocation"
                    checked={allowOtherLocation}
                    onChange={(e) => setAllowOtherLocation(e.target.checked)}
                    className="w-8 h-8 cursor-pointer accent-[#0A5CFF]"
                  />
                  <label htmlFor="allowOtherLocation" className="text-xl font-black uppercase cursor-pointer">
                    Allow visitors to propose other meeting locations
                  </label>
                </div>

                <div className="flex flex-col gap-8 mt-2 border-t-[3px] border-black pt-8">
                  <h3 className="text-2xl font-black uppercase">Custom Emails</h3>
                  <div className="flex flex-col gap-4">
                    <label className="text-sm uppercase font-black opacity-60">Confirmation Email Additional Message</label>
                    <textarea 
                      value={emailConfirmationMsg}
                      onChange={(e) => setEmailConfirmationMsg(e.target.value)}
                      className="p-4 border-[3px] border-black outline-none text-lg font-bold min-h-[120px]"
                      placeholder="e.g. Thanks for booking! Please prepare your documents..."
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-sm uppercase font-black opacity-60">Cancellation Email Additional Message</label>
                    <textarea 
                      value={emailCancellationMsg}
                      onChange={(e) => setEmailCancellationMsg(e.target.value)}
                      className="p-4 border-[3px] border-black outline-none text-lg font-bold min-h-[120px]"
                      placeholder="e.g. I had to cancel this meeting due to unforeseen circumstances."
                    />
                  </div>
                </div>

                <div className="mt-4 pt-6 border-t-[3px] border-black">
                  <button 
                    onClick={handleSave}
                    className="bg-black text-white font-black text-xl px-12 py-4 border-[4px] border-black shadow-[4px_4px_0_0_#0A5CFF] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0A5CFF] transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_0_#0A5CFF] w-full md:w-auto cursor-pointer"
                  >
                    SAVE SETTINGS
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>

  );
}
