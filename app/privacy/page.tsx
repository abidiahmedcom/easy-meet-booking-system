import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F4F4F0] text-black font-sans p-4 relative">
      <div className="w-full max-w-4xl bg-white border-[4px] border-black p-8 md:p-12 shadow-[8px_8px_0_0_#000] my-12">
        <h1 className="text-4xl font-black uppercase mb-8 tracking-tighter">Privacy Policy</h1>
        
        <div className="space-y-6 text-lg font-medium leading-relaxed">
          <p>Effective Date: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, schedule a meeting, or communicate with us. This includes your name, email address, and calendar details necessary for scheduling.</p>

          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, including to facilitate meetings, send notifications, and ensure the security of our platform.</p>

          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">3. Data Sharing and Security</h2>
          <p>We do not sell your personal information. We may share necessary data with third-party service providers (such as calendar integrations) solely for the purpose of operating our service. We take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access.</p>

          <h2 className="text-2xl font-bold uppercase mt-8 mb-4">4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@example.com.</p>
        </div>

        <div className="mt-12 pt-8 border-t-4 border-black">
          <Link href="/" className="inline-block bg-white text-black font-bold text-lg py-3 px-6 border-[3px] border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
            &larr; Back to Home
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-4 flex justify-center w-full gap-6 text-sm font-bold text-gray-500">
        <Link href="/terms" className="hover:text-black hover:underline transition-colors">Terms of Service</Link>
      </footer>
    </div>
  );
}
