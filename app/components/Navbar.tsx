"use client";

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
  };

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "??";

  return (
    <div className="w-full border-b-[3px] md:border-b-[4px] border-black flex justify-center shrink-0 z-20 bg-[#F4F4F0] text-black font-sans">
      <header className="w-full max-w-[1400px] flex justify-between items-center px-4 md:px-6 lg:px-8 py-4 lg:py-6">
        <div 
          className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tighter uppercase leading-none cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          onClick={() => router.push("/")}
        >
          MEETFLOW
        </div>
        <nav className="hidden md:flex items-center gap-6 text-xl md:text-[22px] font-medium">
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
      </header>
    </div>
  );
}
