import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F4F4F0] text-black font-sans p-4 relative">
      <div className="w-full max-w-4xl bg-white border-[4px] border-black p-8 md:p-12 shadow-[8px_8px_0_0_#000] my-12">
        <h1 className="text-4xl font-black uppercase mb-8 tracking-tighter">Terms of Service</h1>
        
        <div className="space-y-6 text-lg font-medium leading-relaxed">
          <p>Effective Date: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using our scheduling platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our service.</p>

          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">2. Use License</h2>
          <p>We grant you a personal, non-exclusive, non-transferable license to use our platform for scheduling and managing meetings. You may not use the service for any illegal or unauthorized purpose.</p>

          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">3. Account Responsibilities</h2>
          <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">4. Disclaimer and Limitations</h2>
          <p>The materials on our platform are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
        </div>

        <div className="mt-12 pt-8 border-t-4 border-black">
          <Link href="/" className="inline-block bg-white text-black font-bold text-lg py-3 px-6 border-[3px] border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
            &larr; Back to Home
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-4 flex justify-center gap-6 w-full text-sm font-bold text-gray-500">
        <Link href="/privacy" className="hover:text-black hover:underline transition-colors">Privacy Policy</Link>
      </footer>
    </div>
  );
}
