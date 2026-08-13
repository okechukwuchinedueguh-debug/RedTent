import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { BookmarkPlus, Loader2, MessageCircleHeart, ShieldCheck, Sparkles } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const prompts = ["What would make my post-menstrual days feel supported?", "My period may be coming soon. What can I notice without overthinking it?", "What could I eat tonight?", "What patterns have you noticed this month?"];

export default function AskRedtentPage() {
  const [location, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [includeWellness, setIncludeWellness] = useState(true);
  const [includeFood, setIncludeFood] = useState(true);
  const [includeJournal, setIncludeJournal] = useState(false);
  const utils = trpc.useUtils();
  const search = useMemo(() => new URLSearchParams(location.split("?")[1] || ""), [location]);
  const savedConversationId = useMemo(() => {
    const id = Number(search.get("conversation"));
    return Number.isInteger(id) && id > 0 ? id : null;
  }, [search]);
  const isContinuation = savedConversationId !== null && search.get("continue") === "1";
  const savedConversation = trpc.ask.conversations.get.useQuery({ id: savedConversationId ?? 0 }, { enabled: savedConversationId !== null });

  useEffect(() => {
    if (!savedConversation.data) return;
    setMessages(savedConversation.data.messages);
    setIncludeWellness(Boolean(savedConversation.data.includeWellness));
    setIncludeFood(Boolean(savedConversation.data.includeFood));
    setIncludeJournal(Boolean(savedConversation.data.includeJournal));
  }, [savedConversation.data]);

  const ask = trpc.ask.redtent.useMutation({
    onSuccess: result => setMessages(current => [...current, { role: "assistant", content: result.answer }]),
    onError: error => {
      toast.error(error.message || "Ask Redtent could not respond right now.");
      setMessages(current => current.slice(0, -1));
    },
  });
  const continueConversation = trpc.ask.conversations.continue.useMutation({
    onSuccess: async result => {
      setMessages(current => [...current, { role: "assistant", content: result.answer }]);
      if (savedConversationId) await Promise.all([utils.ask.conversations.get.invalidate({ id: savedConversationId }), utils.ask.conversations.list.invalidate()]);
    },
    onError: error => {
      toast.error(error.message || "Ask Redtent could not continue this conversation right now.");
      setMessages(current => current.slice(0, -1));
    },
  });
  const saveConversation = trpc.ask.conversations.create.useMutation({
    onSuccess: async () => {
      await utils.ask.conversations.list.invalidate();
      toast.success("Conversation saved in Your Space");
    },
    onError: error => toast.error(error.message),
  });

  const send = (question: string) => {
    setMessages(current => [...current, { role: "user", content: question }]);
    if (isContinuation && savedConversationId) {
      continueConversation.mutate({ id: savedConversationId, question, includeWellness, includeFood, includeJournal });
      return;
    }
    ask.mutate({ question, includeWellness, includeFood, includeJournal });
  };
  const saveCurrentConversation = () => {
    const firstQuestion = messages.find(message => message.role === "user")?.content;
    if (!firstQuestion || messages.length < 2) return;
    saveConversation.mutate({ title: firstQuestion.slice(0, 180), includeWellness, includeFood, includeJournal, messages: messages.filter((message): message is { role: "user" | "assistant"; content: string } => message.role !== "system").map(message => ({ role: message.role, content: message.content })) });
  };

  const isPending = ask.isPending || continueConversation.isPending;

  return <div className="ask-redtent-page mx-auto max-w-5xl px-4 pb-48 pt-5 sm:px-7 sm:pb-12 lg:px-10 lg:pt-9">
    <header className="max-w-3xl">
      <p className="eyebrow">Ask Redtent</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-3xl sm:text-4xl">{isContinuation ? "Continue your conversation." : "Ask about the moments that matter to you."}</h1><p className="mt-3 text-sm leading-6 text-[#806A63]">{isContinuation ? "Your next question and Redtent’s response will be added to this private saved thread." : "Ask Redtent is a thoughtful layer across your cycle, Food Lens, wellness check-ins, and Your Space. It shares general information and practical options, not medical diagnosis or treatment."}</p></div>
        {isContinuation ? <button onClick={() => setLocation(`/ask?conversation=${savedConversationId}`)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#F4E5E0] px-4 py-3 text-sm font-semibold text-[#8E4B57]"><MessageCircleHeart className="h-4 w-4" /> View saved thread</button> : <button onClick={saveCurrentConversation} disabled={messages.length < 2 || saveConversation.isPending} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#A84D5F] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{saveConversation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}{saveConversation.isPending ? "Saving" : "Save in Your Space"}</button>}
      </div>
    </header>
    {savedConversation.isLoading ? <div className="mt-7 grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#B45263]" /></div> : savedConversation.error ? <section role="alert" className="rose-card mt-7 max-w-xl p-6"><p className="eyebrow">Saved conversation</p><h2 className="mt-1 font-display text-2xl">We could not open it just now.</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">This conversation may no longer be available. You can return to a fresh Ask Redtent conversation whenever you are ready.</p><button onClick={() => setLocation("/ask")} className="mt-5 rounded-xl bg-[#A84D5F] px-4 py-3 text-sm font-semibold text-white">Start a fresh question</button></section> : <section className="ask-redtent-layout mt-7 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      <aside className="ask-redtent-context rose-card order-2 h-fit p-5 lg:order-1"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7E7E3] text-[#B45263]"><ShieldCheck className="h-5 w-5" /></div><div><p className="eyebrow">You choose the context</p><h2 className="font-display text-xl">Keep it as private as you need.</h2></div></div><div className="mt-5 space-y-3"><ContextToggle label="Recent wellness check-ins" detail="Mood, energy, sleep, and symptoms" checked={includeWellness} onChange={setIncludeWellness} /><ContextToggle label="Food Lens snapshots" detail="Visible foods from recent saved snapshots" checked={includeFood} onChange={setIncludeFood} /><ContextToggle label="Your Space" detail="Up to three recent journal entries" checked={includeJournal} onChange={setIncludeJournal} /></div><p className="mt-5 text-xs leading-5 text-[#927B74]">Your choices apply to the next question. Redtent does not claim information you have not chosen to share.</p></aside>
      <section className="ask-redtent-chat order-1 overflow-hidden rounded-[1.7rem] border border-[#E7D8D3] bg-[#FFFDFB] shadow-[0_14px_36px_rgba(103,65,60,0.08)] lg:order-2"><div className="ask-redtent-chat-header border-b border-[#F0E4DF] bg-[#FCF4F0] p-5"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-[#B45263]" /><div><p className="eyebrow">{isContinuation ? "Saved Ask Redtent thread" : "Redtent AI"}</p><p className="font-display text-xl">{isContinuation ? savedConversation.data?.title || "Continue with care." : "Clear context for everyday choices."}</p></div></div></div><AIChatBox messages={messages} onSendMessage={send} isLoading={isPending} height="clamp(17rem, calc(100dvh - 31rem), 31rem)" placeholder={isContinuation ? "Continue this conversation..." : "Ask Redtent anything about your recent context..."} emptyStateMessage="What would you like to understand today?" suggestedPrompts={prompts} className="rounded-none border-0 shadow-none" /></section>
    </section>}
  </div>;
}

function ContextToggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#EADCD6] p-3 transition hover:bg-[#FFF9F7]"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[#A84D5F]" /><span><span className="block text-sm font-semibold text-[#65423C]">{label}</span><span className="mt-0.5 block text-xs leading-5 text-[#8D756C]">{detail}</span></span></label>; }
