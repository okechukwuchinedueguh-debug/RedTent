import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  BookHeart,
  CalendarDays,
  CircleUserRound,
  Compass,
  House,
  Leaf,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const mobileItems = [
  { path: "/", label: "Home", icon: House },
  { path: "/cycle", label: "Cycle", icon: CalendarDays },
  { path: "/food", label: "Food", icon: Sparkles },
  { path: "/journal", label: "Journal", icon: BookHeart },
  { path: "/profile", label: "Profile", icon: CircleUserRound },
];

const desktopItems = [
  ...mobileItems.slice(0, 4),
  { path: "/guidance", label: "Guidance", icon: Leaf },
  mobileItems[4],
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#FCF8F4] grid place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#B85C6B]" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen warm-canvas px-5 py-8 grid place-items-center">
        <section className="w-full max-w-md rounded-[2rem] bg-white/80 p-8 shadow-[0_24px_65px_rgba(89,55,46,0.14)] ring-1 ring-[#EBDCD4] backdrop-blur">
          <div className="mb-8 flex items-center gap-3"><div className="brand-mark">R</div><span className="font-display text-3xl text-[#3F2A25]">Redtent</span></div>
          <p className="eyebrow">Your private cycle companion</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] text-[#3F2A25]">Your cycle tells a story. Start seeing the whole picture.</h1>
          <p className="mt-5 text-sm leading-6 text-[#745E58]">Track periods, notice patterns, reflect on your wellbeing, and explore cycle-aware food insights in one calm, private space.</p>
          <Button onClick={() => startLogin()} className="mt-8 w-full rounded-xl bg-[#A84D5F] py-6 text-base hover:bg-[#8F3F50]">Open your Redtent space</Button>
          <p className="mt-5 text-center text-xs leading-5 text-[#917B74]">Redtent shares general wellness information, not medical advice. Cycle timing and food insights are estimates.</p>
        </section>
      </div>
    );
  }

  const nav = (items: typeof desktopItems, compact = false) => items.map(({ path, label, icon: Icon }) => {
    const active = location === path;
    return (
      <button key={path} onClick={() => setLocation(path)} className={compact ? `nav-mobile-item ${active ? "active" : ""}` : `nav-side-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
        <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} /><span>{label}</span>
      </button>
    );
  });

  return (
    <div className="min-h-screen warm-canvas text-[#3F2A25]">
      {isOffline && <div role="status" className="fixed inset-x-3 top-3 z-50 mx-auto max-w-md rounded-xl bg-[#513039] px-4 py-3 text-center text-xs font-semibold text-white shadow-lg">You’re offline. Your latest saved information may not be available until you reconnect.</div>}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-[#E9D9D2] bg-[#FFFDFB]/90 px-4 py-5 backdrop-blur lg:flex">
        <button className="flex items-center gap-3 px-3 text-left" onClick={() => setLocation("/")}><div className="brand-mark">R</div><span className="font-display text-[27px]">Redtent</span></button>
        <nav className="mt-10 space-y-1">{nav(desktopItems)}</nav>
        <div className="mt-auto rounded-2xl bg-[#F8EEE8] p-3">
          <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#D98890] font-semibold text-white">{user.name?.slice(0, 1).toUpperCase() || "R"}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name || "Redtent member"}</p><p className="truncate text-xs text-[#8B756D]">Private wellness space</p></div></div>
          <button onClick={logout} className="mt-3 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold text-[#8B4E52] transition hover:bg-white"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
        </div>
      </aside>
      <main className="min-h-screen pb-24 lg:ml-[250px] lg:pb-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#EBDDD7] bg-[#FFFDFB]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">{nav(mobileItems, true)}</nav>
    </div>
  );
}
