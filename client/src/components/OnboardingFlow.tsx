import { CalendarHeart, Camera, Check, ChevronLeft, ChevronRight, Loader2, Sparkles, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const cycleLengths = [24, 26, 28, 30, 32];
const periodLengths = [3, 4, 5, 6, 7];

function localDateValue() {
  return new Date().toLocaleDateString("en-CA");
}

export default function OnboardingFlow() {
  const utils = trpc.useUtils();
  const photoInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [periodStart, setPeriodStart] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateIdentity = trpc.profile.updateIdentity.useMutation();
  const saveProfile = trpc.profile.save.useMutation();
  const createCycle = trpc.cycles.create.useMutation();
  const completeOnboarding = trpc.profile.completeOnboarding.useMutation();

  const usernameValid = !username || /^[a-z0-9_]{3,24}$/.test(username);
  const canContinue = step !== 0 || usernameValid;

  const selectPhoto = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Choose a JPEG, PNG, or WebP profile photo."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Choose a profile photo smaller than 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result));
    reader.onerror = () => toast.error("That profile photo could not be read. Please choose another.");
    reader.readAsDataURL(file);
  };

  const finish = async (skip = false) => {
    setIsSubmitting(true);
    try {
      if (!skip) {
        if ((username || photoDataUrl) && !usernameValid) throw new Error("Use 3 to 24 lowercase letters, numbers, or underscores.");
        if (username || photoDataUrl) await updateIdentity.mutateAsync({ username: username || undefined, photoDataUrl: photoDataUrl || undefined });
        await saveProfile.mutateAsync({ preferredCycleLength: cycleLength, preferredPeriodLength: periodLength });
        if (periodStart) await createCycle.mutateAsync({ startAt: new Date(`${periodStart}T12:00:00`) });
      }
      await completeOnboarding.mutateAsync();
      await Promise.all([utils.profile.get.invalidate(), utils.dashboard.overview.invalidate(), utils.cycles.summary.invalidate()]);
      toast.success(skip ? "You can complete your setup anytime in Profile." : "Your Redtent space is ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your setup could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: "Your identity", title: "Begin with the details that feel like you.", description: "A username and profile photo are optional. You can change or remove them whenever you choose.", icon: UserRound },
    { label: "Your cycle", title: "Give your forecast a starting point.", description: "These settings are optional estimates, not medical advice. You can adjust them at any time.", icon: CalendarHeart },
    { label: "Your space", title: "A private place to notice what matters to you.", description: "Redtent keeps your entries user-scoped and only uses the context you choose to save.", icon: Sparkles },
  ];
  const current = steps[step];
  const StepIcon = current.icon;

  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#4B3033]/35 px-4 py-5 backdrop-blur-sm sm:grid sm:place-items-center sm:p-8" role="dialog" aria-modal="true" aria-labelledby="redtent-onboarding-title">
    <section className="onboarding-surface mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#FFFDFB] shadow-[0_28px_90px_rgba(62,37,39,0.30)]">
      <div className="h-1.5 bg-[#F4E6E1]"><div className="h-full bg-[#B65D6D] transition-[width] duration-200" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <div className="p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Welcome to Redtent</p><p className="mt-1 text-xs font-semibold text-[#8B7069]">Step {step + 1} of {steps.length}: {current.label}</p></div><button type="button" onClick={() => finish(true)} disabled={isSubmitting} className="text-sm font-semibold text-[#8F5962] underline-offset-4 hover:underline disabled:opacity-60">Set up later</button></div>
        <div className="mt-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7E8E4] text-[#A84D5F]"><StepIcon className="h-5 w-5" /></div>
        <h1 id="redtent-onboarding-title" className="mt-4 max-w-xl font-display text-3xl leading-tight text-[#402B26] sm:text-4xl">{current.title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#806A63]">{current.description}</p>

        {step === 0 ? <div className="mt-7 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center"><div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-[1.6rem] bg-[#C76E79] text-white shadow-[0_10px_25px_rgba(172,79,96,0.22)]">{photoDataUrl ? <img src={photoDataUrl} alt="Selected Redtent profile" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}<button type="button" onClick={() => photoInput.current?.click()} className="absolute inset-x-2 bottom-2 rounded-lg bg-[#3E2527]/80 px-2 py-1.5 text-[10px] font-bold backdrop-blur">{photoDataUrl ? "Change" : "Add photo"}</button></div><div><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Username</span><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9B827A]">@</span><input value={username} onChange={event => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} maxLength={24} placeholder="your_redtent_name" className="field-input pl-7" /></div></label><p className={`mt-2 text-xs ${username && !usernameValid ? "text-[#B04D5C]" : "text-[#8D756C]"}`}>{username && !usernameValid ? "Use 3 to 24 lowercase letters, numbers, or underscores." : "This is optional and private to your Redtent account."}</p></div><input ref={photoInput} onChange={event => selectPhoto(event.target.files?.[0])} accept="image/jpeg,image/png,image/webp" type="file" className="hidden" /></div> : null}

        {step === 1 ? <div className="mt-7 grid gap-5"><fieldset><legend className="text-sm font-semibold text-[#573C36]">Typical cycle length</legend><div className="mt-3 flex flex-wrap gap-2">{cycleLengths.map(days => <button type="button" key={days} onClick={() => setCycleLength(days)} className={`onboarding-choice rounded-xl px-4 py-2.5 text-sm font-semibold transition ${cycleLength === days ? "onboarding-choice--selected bg-[#A84D5F] text-white" : "bg-[#F7EAE6] text-[#765852] hover:bg-[#F0DAD4]"}`}>{days} days</button>)}</div></fieldset><fieldset><legend className="text-sm font-semibold text-[#573C36]">Typical period length</legend><div className="mt-3 flex flex-wrap gap-2">{periodLengths.map(days => <button type="button" key={days} onClick={() => setPeriodLength(days)} className={`onboarding-choice rounded-xl px-4 py-2.5 text-sm font-semibold transition ${periodLength === days ? "onboarding-choice--selected bg-[#A84D5F] text-white" : "bg-[#F7EAE6] text-[#765852] hover:bg-[#F0DAD4]"}`}>{days} days</button>)}</div></fieldset><label><span className="mb-1.5 block text-sm font-semibold text-[#573C36]">First day of your most recent period</span><input type="date" value={periodStart} max={localDateValue()} onChange={event => setPeriodStart(event.target.value)} className="field-input max-w-xs" /><span className="mt-1.5 block text-xs text-[#8D756C]">Optional. Leave this empty if you prefer to start later.</span></label></div> : null}

        {step === 2 ? <div className="mt-7 rounded-2xl bg-[#F8EEE9] p-5"><div className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#8C9D78]" /><div><p className="font-semibold text-[#543B35]">You stay in control.</p><p className="mt-1 text-sm leading-6 text-[#806A63]">Edit your profile, change your cycle settings, or add more context only when it feels useful. Redtent offers supportive general wellness information, not medical advice.</p></div></div></div> : null}

        <div className="mt-8 flex items-center justify-between gap-3"><button type="button" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0 || isSubmitting} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#82645D] disabled:invisible"><ChevronLeft className="h-4 w-4" /> Back</button>{step < steps.length - 1 ? <button type="button" onClick={() => setStep(value => value + 1)} disabled={!canContinue || isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8F3F50] disabled:opacity-60">Continue <ChevronRight className="h-4 w-4" /></button> : <button type="button" onClick={() => finish()} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8F3F50] disabled:opacity-60">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{isSubmitting ? "Saving your setup..." : "Enter my Redtent space"}</button>}</div>
      </div>
    </section>
  </div>;
}
