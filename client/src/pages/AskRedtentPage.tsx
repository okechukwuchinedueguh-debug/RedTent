import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const prompts = ["Why am I feeling tired today?", "What could I eat tonight?", "My period may be coming soon. What meals could I prepare?", "What patterns have you noticed this month?"];

export default function AskRedtentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [includeWellness, setIncludeWellness] = useState(true);
  const [includeFood, setIncludeFood] = useState(true);
  const [includeJournal, setIncludeJournal] = useState(false);
  const ask = trpc.ask.redtent.useMutation({
    onSuccess: result => setMessages(current => [...current, { role: "assistant", content: result.answer }]),
    onError: (error: { message?: string }) => { toast.error(error.message || "Ask Redtent could not respond right now."); setMessages(current => current.slice(0, -1)); },
  });
  const send = (question: string) => {
    setMessages(current => [...current, { role: "user", content: question }]);
    ask.mutate({ question, includeWellness, includeFood, includeJournal });
  };
  return <div className="ask-redtent-page mx-auto max-w-5xl px-4 pb-48 pt-5 sm:px-7 sm:pb-12 lg:px-10 lg:pt-9"><header className="max-w-3xl"><p className="eyebrow">Ask Redtent</p><h1 className="mt-1 font-display text-3xl sm:text-4xl">Ask about the moments that matter to you.</h1><p className="mt-3 text-sm leading-6 text-[#806A63]">Ask Redtent is a thoughtful layer across your cycle, Food Lens, wellness check-ins, and Your Space. It shares general information and practical options, not medical diagnosis or treatment.</p></header><section className="ask-redtent-layout mt-7 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><aside className="ask-redtent-context rose-card order-2 h-fit p-5 lg:order-1"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7E7E3] text-[#B45263]"><ShieldCheck className="h-5 w-5" /></div><div><p className="eyebrow">You choose the context</p><h2 className="font-display text-xl">Keep it as private as you need.</h2></div></div><div className="mt-5 space-y-3"><ContextToggle label="Recent wellness check-ins" detail="Mood, energy, sleep, and symptoms" checked={includeWellness} onChange={setIncludeWellness} /><ContextToggle label="Food Lens snapshots" detail="Visible foods from recent saved snapshots" checked={includeFood} onChange={setIncludeFood} /><ContextToggle label="Your Space" detail="Up to three recent journal entries" checked={includeJournal} onChange={setIncludeJournal} /></div><p className="mt-5 text-xs leading-5 text-[#927B74]">Your choices apply to the next question. Redtent does not claim information you have not chosen to share.</p></aside><section className="ask-redtent-chat order-1 overflow-hidden rounded-[1.7rem] border border-[#E7D8D3] bg-[#FFFDFB] shadow-[0_14px_36px_rgba(103,65,60,0.08)] lg:order-2"><div className="ask-redtent-chat-header border-b border-[#F0E4DF] bg-[#FCF4F0] p-5"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-[#B45263]" /><div><p className="eyebrow">Redtent AI</p><p className="font-display text-xl">Clear context for everyday choices.</p></div></div></div><AIChatBox messages={messages} onSendMessage={send} isLoading={ask.isPending} height="clamp(17rem, calc(100dvh - 31rem), 31rem)" placeholder="Ask Redtent anything about your recent context..." emptyStateMessage="What would you like to understand today?" suggestedPrompts={prompts} className="rounded-none border-0 shadow-none" /></section></section></div>;
}

function ContextToggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#EADCD6] p-3 transition hover:bg-[#FFF9F7]"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[#A84D5F]" /><span><span className="block text-sm font-semibold text-[#65423C]">{label}</span><span className="mt-0.5 block text-xs leading-5 text-[#8D756C]">{detail}</span></span></label>; }
