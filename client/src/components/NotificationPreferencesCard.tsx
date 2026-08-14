import { trpc } from "@/lib/trpc";
import { BellRing, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function NotificationPreferencesCard() {
  const preferences = trpc.notifications.get.useQuery();
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  useEffect(() => { if (preferences.data) { setEnabled(Boolean(preferences.data.ownerBrowserAlertsEnabled)); setReminderTime(preferences.data.reminderTime); } }, [preferences.data]);
  const save = trpc.notifications.save.useMutation({ onSuccess: () => toast.success("Your notification preferences are saved."), onError: error => toast.error(error.message) });
  return <article className="rose-card p-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F8E5DE] text-[#B45263]"><BellRing className="h-5 w-5" /></div><div><p className="eyebrow">Private reminders</p><h2 className="mt-1 font-display text-2xl">Choose caring prompts.</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">Save the reminders you may want later. When delivery is configured, Redtent will use only your own estimates and past logs and never claim a symptom will happen.</p></div></div><label className="mt-5 flex items-start gap-3 rounded-xl border border-[#EADBD6] p-3"><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-[#A84D5F]" /><span><span className="block text-sm font-semibold text-[#65423C]">Save browser reminder preference</span><span className="mt-0.5 block text-xs leading-5 text-[#8D756C]">No browser alert is sent in this release. You can switch this preference off anytime.</span></span></label><label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Preferred reminder time</span><input type="time" value={reminderTime} onChange={event => setReminderTime(event.target.value)} className="field-input" /></label><button onClick={() => save.mutate({ ownerBrowserAlertsEnabled: enabled, reminderTime })} disabled={save.isPending || preferences.isLoading} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#F4E5E0] px-4 py-3 text-sm font-semibold text-[#8E4B57] disabled:opacity-60">{save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{save.isPending ? "Saving" : "Save notification choices"}</button></article>;
}
