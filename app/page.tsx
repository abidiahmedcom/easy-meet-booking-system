import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PixelBackground from "@/app/components/PixelBackground";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-black font-sans p-4 relative">
      <PixelBackground 
        desktopSrc="/bg-image.png"
        mobileSrc="/bg-image-mobile.png"
      />
      <div className="w-full max-w-md bg-white border-[4px] border-black p-8 shadow-[8px_8px_0_0_#000]">
        <h1 className="text-4xl font-black uppercase mb-6 tracking-tighter text-center">EASYMEET</h1>
        <p className="text-xl font-bold mb-8 text-center text-gray-700">Schedule meetings effortlessly.</p>
        
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
          className="flex flex-col gap-6"
        >
          <button 
            type="submit" 
            className="w-full bg-white text-[#3c4043] font-medium text-lg py-3 px-4 border border-[#dadce0] rounded hover:bg-gray-50 hover:shadow-sm transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
      
      <footer className="absolute bottom-6 flex justify-center gap-4 w-full">
        <Link href="/privacy" className="bg-white text-black text-xs md:text-sm font-bold uppercase px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">Privacy Policy</Link>
        <Link href="/terms" className="bg-white text-black text-xs md:text-sm font-bold uppercase px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">Terms of Service</Link>
      </footer>
    </div>
  );
}
