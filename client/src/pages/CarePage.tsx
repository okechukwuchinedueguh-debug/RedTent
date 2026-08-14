import React from "react";
import { Building2, HeartPulse, Hospital, MapPinned, MessageCircleMore, Pill, ShieldCheck, Stethoscope, Video } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const categories = [
  { icon: Stethoscope, title: "Doctors", detail: "Women’s-health care when a professional conversation feels useful." },
  { icon: Hospital, title: "Clinics", detail: "Explore locally verified clinic connections as Redtent expands." },
  { icon: Video, title: "Telehealth", detail: "Prepare for a virtual care conversation without repeating your story." },
  { icon: Pill, title: "Pharmacy & labs", detail: "Find practical next steps when verified local partners are available." },
];

const journey = [
  { number: "01", title: "Menstruation", detail: "Track the patterns and support that matter to you." },
  { number: "02", title: "Fertility", detail: "Understand cycle timing with visible uncertainty." },
  { number: "03", title: "Pregnancy", detail: "A future care pathway for trusted guidance and connections." },
  { number: "04", title: "Postpartum", detail: "A future space for recovery, support, and follow-up." },
  { number: "05", title: "Perimenopause", detail: "A future path for noticing changing health experiences." },
  { number: "06", title: "Menopause", detail: "A future path for informed, respectful next steps." },
];

export default function CarePage() {
  const [, setLocation] = useLocation();
  const showCarePreparation = () => toast.message("Care connections are being prepared with verified local partners.");

  return <div className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-7 lg:px-10 lg:pt-9">
    <header className="max-w-3xl"><p className="eyebrow">Redtent Care</p><h1 className="mt-1 font-display text-3xl leading-[1.02] sm:text-5xl">Find care, when a next step feels useful.</h1><p className="mt-3 text-sm leading-6 text-[#75565B] sm:text-base">Redtent connects understanding to action. Begin with your private health story, then choose a care path that fits your location, needs, and comfort.</p></header>

    <section className="redtent-care-hero mt-7 p-5 sm:p-8"><div className="max-w-2xl"><p className="redtent-care-hero__eyebrow text-xs font-bold uppercase tracking-[0.18em]">Built for Africa. Powered by care.</p><h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Understand your body. Connect with care.</h2><p className="mt-4 text-sm leading-6 text-[#F5E6DF] sm:text-base">Redtent Care is being built with locally verified partners. Until those connections are live, we do not display unverified provider profiles, availability, prices, or booking options.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={showCarePreparation} className="redtent-care-hero__button px-4 py-3">Explore care paths</button><button type="button" onClick={() => setLocation("/patterns")} className="rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">Review your patterns</button></div></div></section>

    <section className="mt-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Find the right kind of support</p><h2 className="mt-1 font-display text-2xl sm:text-3xl">Care paths, not assumptions.</h2></div><span className="care-verification-badge inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold"><ShieldCheck className="h-4 w-4" /> Verification before visibility</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{categories.map(({ icon: Icon, title, detail }) => <button key={title} type="button" onClick={showCarePreparation} className="care-category"><span className="care-category__icon"><Icon className="h-5 w-5" /></span><span className="font-semibold text-[#5A0018]">{title}</span><span className="text-xs leading-5 text-[#7C6263]">{detail}</span></button>)}</div></section>

    <section className="rose-card mt-8 p-5 sm:p-7"><div className="flex items-start gap-3"><span className="care-category__icon"><HeartPulse className="h-5 w-5" /></span><div><p className="eyebrow">How Redtent Care will work</p><h2 className="mt-1 font-display text-2xl">A thoughtful path from insight to support.</h2></div></div><div className="mt-6 grid gap-5 sm:grid-cols-3"><Step number="01" icon={MessageCircleMore} title="Understand your context" detail="Bring the private cycle patterns and questions you choose to share." /><Step number="02" icon={MapPinned} title="Choose your care path" detail="Compare verified options by care type and availability when local connections launch." /><Step number="03" icon={Building2} title="Continue your journey" detail="Keep your notes and next steps in one private place, with your permission." /></div></section>

    <section className="mt-8 overflow-hidden rounded-[1.55rem] border border-[#E8D7DB] bg-white p-5 sm:p-7"><div className="max-w-2xl"><p className="eyebrow">The Redtent health journey</p><h2 className="mt-1 font-display text-2xl sm:text-3xl">For every chapter of womanhood.</h2><p className="mt-3 text-sm leading-6 text-[#755F61]">Redtent starts with cycle understanding and is designed to grow into a private care-connection platform across the changing stages of womanhood. Each future pathway will be introduced with clear boundaries and locally relevant care information.</p></div><div className="mt-6 flex gap-3 overflow-x-auto pb-2">{journey.map(step => <article key={step.title} className="health-journey-step"><span className="health-journey-step__dot">{step.number}</span><h3 className="font-semibold text-[#5A0018]">{step.title}</h3><p className="text-xs leading-5 text-[#7C6263]">{step.detail}</p></article>)}</div></section>

    <aside className="care-safety mt-7 rounded-2xl border border-[#E9D6DB] bg-[#FFF8F5] p-5 text-sm leading-6 text-[#704F55]"><strong className="text-[#5A0018]">Care navigation is not medical advice.</strong> If you are concerned about a symptom or feel unsafe, seek urgent local medical support. Redtent does not diagnose, book care, or process payments in this release.</aside>
  </div>;
}

function Step({ number, icon: Icon, title, detail }: { number: string; icon: typeof HeartPulse; title: string; detail: string }) {
  return <div><div className="flex items-center gap-2 text-[#800020]"><span className="health-journey-step__dot">{number}</span><Icon className="h-4 w-4" /></div><h3 className="mt-3 font-semibold text-[#5A0018]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#755F61]">{detail}</p></div>;
}
