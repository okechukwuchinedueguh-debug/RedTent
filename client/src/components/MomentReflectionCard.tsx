import { trpc } from "@/lib/trpc";
import { HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function MomentReflectionCard() {
  const utils = trpc.useUtils();
  const current = trpc.reflections.current.useQuery();
  const [whatHelped, setWhatHelped] = useState("");
  useEffect(() => setWhatHelped(current.data?.reflection?.whatHelped || ""), [current.data?.reflection?.whatHelped]);
  const save = trpc.reflections.save.useMutation({ onSuccess: async () => { await Promise.all([utils.reflections.current.invalidate(), utils.reflections.list.invalidate(), utils.trends.dashboard.invalidate()]); toast.success("Your reflection is saved privately."); }, onError: error => toast.error(error.message) });
  if (current.isLoading) return <section className="rose-card grid min-h-40 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-[#B45263]" /></section>;
  if (!current.data) return null;
  return <section className="rose-card p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F8E5DE] text-[#B45263]"><HeartHandshake className="h-5 w-5" /></div><div><p className="eyebrow">What helped this time?</p><h2 className="mt-1 font-display text-2xl">Leave a note for future you.</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">In your {current.data.experience.label.toLowerCase()}, what felt useful, comforting, or easier than usual? This is a private reflection, not a record anyone else can see.</p></div></div><textarea value={whatHelped} onChange={event => setWhatHelped(event.target.value)} maxLength={2000} className="field-input mt-5 min-h-28 resize-y" placeholder="For example: I prepared beans and plantain, took a slower evening, and asked for practical help." /><button onClick={() => save.mutate({ moment: current.data!.experience.id, whatHelped: whatHelped.trim() })} disabled={!whatHelped.trim() || save.isPending} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{save.isPending ? "Saving" : current.data.reflection ? "Update my reflection" : "Save what helped"}</button></section>;
}
