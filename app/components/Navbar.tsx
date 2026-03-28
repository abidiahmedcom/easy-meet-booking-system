"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { User } from "../../lib/types";

export default function Navbar({ 
  user, 
  activeTab, 
  onTabChange 
}: { 
  user: User | null, 
  activeTab?: string, 
  onTabChange?: (tab: string) => void 
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);
  const isDashboard = activeTab !== undefined;
  const showLinks = isDashboard || (user && user.isOwner);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleLinkClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      router.push("/dashboard");
    }
    setIsMenuOpen(false);
  };

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "??";

  return (
    <div className="w-full border-b-[3px] md:border-b-[4px] border-black flex justify-center shrink-0 z-20 bg-[#F4F4F0] text-black font-sans">
      <header className="w-full max-w-[1400px] flex justify-between items-center px-4 md:px-6 lg:px-8 py-4 lg:py-6">
        <div 
          className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tighter uppercase leading-none cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          onClick={() => router.push("/")}
        >
          EASYMEET
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-xl md:text-[22px] font-medium">
          {showLinks && (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleLinkClick("overview")}
                className={`cursor-pointer transition-all ${activeTab === "overview" ? "font-extrabold border-b-[4px] border-black" : "hover:underline"}`}
              >
                Overview
              </button>
              <button 
                onClick={() => handleLinkClick("bookings")}
                className={`cursor-pointer transition-all ${activeTab === "bookings" ? "font-extrabold border-b-[4px] border-black" : "hover:underline"}`}
              >
                Bookings
              </button>
              <button 
                onClick={() => handleLinkClick("availability")}
                className={`cursor-pointer transition-all ${activeTab === "availability" ? "font-extrabold border-b-[4px] border-black" : "hover:underline"}`}
              >
                Availability
              </button>
              <button 
                onClick={() => handleLinkClick("settings")}
                className={`cursor-pointer transition-all ${activeTab === "settings" ? "font-extrabold border-b-[4px] border-black" : "hover:underline"}`}
              >
                Settings
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
             {isDashboard && (
                <button 
                    onClick={handleLogout}
                    className="cursor-pointer font-bold border-[2px] md:border-[3px] border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-colors text-base md:text-lg uppercase"
                >
                    Logout
                </button>
             )}
             <a 
                href={`/${user?.username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black text-white flex items-center justify-center font-bold overflow-hidden cursor-pointer hover:ring-4 hover:ring-[#0A5CFF]/20 transition-all border-2 border-black"
                title="View public booking page"
              >
                {user?.image ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={user.image} 
                      alt={user.name || "User"} 
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  initials
                )}
              </a>
          </div>
        </nav>

        {/* Mobile Toggle Button */}
        <div className="flex lg:hidden items-center gap-4">
           {user && (
              <a 
                href={`/${user?.username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold overflow-hidden cursor-pointer border-2 border-black"
              >
                {user?.image ? (
                  <Image src={user.image} alt="User" width={40} height={40} className="object-cover" />
                ) : initials}
              </a>
           )}
           <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 border-[3px] border-black bg-white shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
           >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
           </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#F4F4F0] z-50 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
           <div className="flex justify-between items-center mb-12">
              <div 
                className="text-4xl font-black tracking-tighter uppercase leading-none"
                onClick={() => { router.push("/"); setIsMenuOpen(false); }}
              >
                EASYMEET
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 border-[3px] border-black bg-white shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
           </div>

           <div className="flex-1 flex flex-col justify-center items-center gap-8">
              {showLinks && (
                  <div className="flex flex-col gap-8 items-center">
                    <button onClick={() => handleLinkClick("overview")} className={`text-4xl font-black uppercase tracking-tight ${activeTab === "overview" ? "text-[#0A5CFF] border-b-8 border-[#0A5CFF]" : ""}`}>Overview</button>
                    <button onClick={() => handleLinkClick("bookings")} className={`text-4xl font-black uppercase tracking-tight ${activeTab === "bookings" ? "text-[#0A5CFF] border-b-8 border-[#0A5CFF]" : ""}`}>Bookings</button>
                    <button onClick={() => handleLinkClick("availability")} className={`text-4xl font-black uppercase tracking-tight ${activeTab === "availability" ? "text-[#0A5CFF] border-b-8 border-[#0A5CFF]" : ""}`}>Availability</button>
                    <button onClick={() => handleLinkClick("settings")} className={`text-4xl font-black uppercase tracking-tight ${activeTab === "settings" ? "text-[#0A5CFF] border-b-8 border-[#0A5CFF]" : ""}`}>Settings</button>
                  </div>
              )}
              
              {isDashboard && (
                  <button 
                    onClick={handleLogout}
                    className="w-full max-w-sm mt-8 bg-black text-white font-black py-6 border-[4px] border-black shadow-[8px_8px_0_0_#EA4335] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase text-2xl tracking-widest"
                  >
                    Logout
                  </button>
              )}
           </div>
           
           <div className="mt-auto text-center font-bold opacity-20 uppercase tracking-widest text-sm">
             EasyMeet Booking System
           </div>
        </div>
      )}
    </div>
  );
}
