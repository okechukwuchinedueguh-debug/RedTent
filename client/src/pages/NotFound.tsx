import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return <div className="grid min-h-screen place-items-center bg-[#FCF7F4] px-5"><section className="rose-card w-full max-w-lg p-8 text-center sm:p-10"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F9E5E5] text-[#B45263]"><AlertCircle className="h-8 w-8" /></div><p className="eyebrow mt-6">A small detour</p><h1 className="mt-2 font-display text-4xl">This page is not part of your Redtent path.</h1><p className="mt-4 text-sm leading-6 text-[#806A63]">The link may have changed, but your private wellness space is still right where you left it.</p><button onClick={() => setLocation("/")} className="mt-7 inline-flex items-center rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white"><Home className="mr-2 h-4 w-4" /> Return to my daily check in</button></section></div>;
}
