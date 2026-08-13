import { trpc } from "@/lib/trpc";
import { displayDate, localDateInput, parseInputDate, phaseColors, phaseLabels } from "@/lib/redtent";
import { BookHeart, Edit3, Loader2, MessageCircleHeart, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { useLocation } from "wouter";
import { ErrorState } from "./Home";

type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";
type EditingEntry = { id: number; title: string; body: string; phase: Phase; entryAt: Date } | null;
type SavedConversation = { id: number; title: string; updatedAt: Date };

export default function JournalPage() {
  const utils = trpc.useUtils();
  const journal = trpc.journal.list.useQuery();
  const cycle = trpc.cycles.summary.useQuery();
  const conversations = trpc.ask.conversations.list.useQuery();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState<EditingEntry>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<Phase>("follicular");
  const [entryAt, setEntryAt] = useState(localDateInput());

  const reset = () => {
    setEditing(null);
    setTitle("");
    setBody("");
    setPhase((cycle.data?.summary.phase || "follicular") as Phase);
    setEntryAt(localDateInput());
  };

  const create = trpc.journal.create.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.journal.list.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Your entry is saved in Your Space");
      reset();
    },
    onError: error => toast.error(error.message),
  });
  const update = trpc.journal.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.journal.list.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Your entry is updated");
      reset();
    },
    onError: error => toast.error(error.message),
  });
  const remove = trpc.journal.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.journal.list.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Your entry was removed");
    },
    onError: error => toast.error(error.message),
  });
  const removeConversation = trpc.ask.conversations.delete.useMutation({
    onSuccess: async () => {
      await utils.ask.conversations.list.invalidate();
      toast.success("Saved conversation removed");
    },
    onError: error => toast.error(error.message),
  });

  const begin = (entry?: EditingEntry) => {
    if (entry) {
      setEditing(entry);
      setTitle(entry.title);
      setBody(entry.body);
      setPhase(entry.phase);
      setEntryAt(localDateInput(new Date(entry.entryAt)));
    } else {
      reset();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    const payload = { title, body, phase, entryAt: parseInputDate(entryAt) };
    if (editing) update.mutate({ id: editing.id, ...payload });
    else create.mutate(payload);
  };

  if (journal.isLoading || cycle.isLoading || conversations.isLoading) return <Loading />;
  if (journal.error || !cycle.data) return <ErrorState title="Your Space is not loading yet" detail="Refresh to return to your private place for reflection." />;

  const entries = journal.data ?? [];
  const savedConversations = (conversations.data ?? []) as SavedConversation[];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-48 pt-5 sm:px-7 sm:pb-12 lg:px-10 lg:pt-9">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your Space</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">Your private place to tell your own story.</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#806A63]">Keep thoughts, feelings, meals, cycle observations, and saved Ask Redtent conversations together in the words that feel true to you.</p>
        </div>
        <button onClick={() => begin()} className="inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-4 py-3 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Add to Your Space
        </button>
      </header>

      <SavedConversationLibrary
        conversations={savedConversations}
        hasError={Boolean(conversations.error)}
        onOpen={id => setLocation(`/ask?conversation=${id}`)}
        onDelete={id => removeConversation.mutate({ id })}
        onRetry={() => conversations.refetch()}
      />

      <section className="rose-card mt-8 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{editing ? "Refine your entry" : "A moment for you"}</p>
            <h2 className="mt-1 font-display text-2xl">{editing ? "What feels truer now?" : "What is asking to be noticed?"}</h2>
            <p className="mt-2 text-sm text-[#806A63]">Write the detail you will be grateful to remember when you look back.</p>
          </div>
          <span className={`phase-pill ${phaseColors[phase]}`}>{phaseLabels[phase]} phase</span>
        </div>
        <input value={title} onChange={event => setTitle(event.target.value)} maxLength={180} className="mt-6 w-full border-b border-[#EADAD3] bg-transparent pb-3 font-display text-2xl outline-none placeholder:text-[#BFA8A0]" placeholder="Give this moment a name" />
        <div className="mt-4 flex flex-wrap gap-2">
          <FormatButton label="Bold" onClick={() => setBody(value => `${value}**bold text**`)} />
          <FormatButton label="Emphasis" onClick={() => setBody(value => `${value}*emphasis*`)} />
          <FormatButton label="List" onClick={() => setBody(value => `${value}\n- `)} />
        </div>
        <textarea value={body} onChange={event => setBody(event.target.value)} maxLength={8000} className="mt-3 min-h-48 w-full resize-y rounded-xl border border-[#E8D9D4] bg-[#FFFDFC] p-4 text-sm leading-7 outline-none transition focus:border-[#B65B69] focus:ring-4 focus:ring-[#F8E4E5]" placeholder="What happened? What helped? What do you want to carry forward?" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Cycle phase</span><select value={phase} onChange={event => setPhase(event.target.value as Phase)} className="field-input">{Object.entries(phaseLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Entry date</span><input value={entryAt} onChange={event => setEntryAt(event.target.value)} type="date" className="field-input" /></label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={submit} disabled={!title.trim() || !body.trim() || create.isPending || update.isPending} className="rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{create.isPending || update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save my changes" : "Save to Your Space"}</button>
          {editing && <button onClick={reset} className="rounded-xl bg-[#F4E5E0] px-5 py-3 text-sm font-semibold text-[#8E4B57]">Keep writing later</button>}
        </div>
      </section>

      <section className="mt-8">
        <div><p className="eyebrow">Your story so far</p><h2 className="mt-1 font-display text-2xl">Return to what you have learned.</h2></div>
        {entries.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{entries.map(entry => <JournalCard key={entry.id} entry={{ ...entry, phase: entry.phase as Phase }} onEdit={begin} onDelete={id => remove.mutate({ id })} />)}</div> : <EmptyJournal />}
      </section>
    </div>
  );
}

export function SavedConversationLibrary({ conversations, hasError, onOpen, onDelete, onRetry }: { conversations: SavedConversation[]; hasError: boolean; onOpen: (id: number) => void; onDelete: (id: number) => void; onRetry: () => void }) {
  return <section className="mt-7">
    <div><p className="eyebrow">Saved Ask Redtent conversations</p><h2 className="mt-1 font-display text-2xl">Return to a conversation when it is useful.</h2><p className="mt-2 text-sm text-[#806A63]">Only you can see conversations you choose to save.</p></div>
    {hasError ? <div role="alert" className="rose-card mt-4 grid min-h-36 place-items-center p-6 text-center"><MessageCircleHeart className="h-7 w-7 text-[#BE6C76]" /><p className="mt-3 text-sm text-[#806A63]">Your saved conversations are not loading right now. Your existing conversations remain private.</p><button onClick={onRetry} className="mt-4 rounded-xl bg-[#F4E5E0] px-4 py-2.5 text-sm font-semibold text-[#8E4B57]">Try again</button></div> : conversations.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{conversations.map(conversation => <article key={conversation.id} className="rose-card flex min-h-44 flex-col p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F7E7E3] text-[#B45263]"><MessageCircleHeart className="h-4 w-4" /></div><div><p className="eyebrow">Ask Redtent</p><h3 className="mt-1 line-clamp-2 font-display text-xl leading-tight">{conversation.title}</h3><p className="mt-2 text-xs text-[#957B72]">Saved {displayDate(conversation.updatedAt, { month: "long", day: "numeric", year: "numeric" })}</p></div></div><button onClick={() => onDelete(conversation.id)} aria-label="Remove saved conversation" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#A65461] hover:bg-[#FCECEE]"><Trash2 className="h-3.5 w-3.5" /></button></div><button onClick={() => onOpen(conversation.id)} className="mt-auto self-start rounded-xl bg-[#F4E5E0] px-4 py-2.5 text-sm font-semibold text-[#8E4B57] hover:bg-[#EFD9D2]">Open conversation</button></article>)}</div> : <div className="rose-card mt-4 grid min-h-36 place-items-center p-6 text-center"><MessageCircleHeart className="h-7 w-7 text-[#BE6C76]" /><p className="mt-3 text-sm text-[#806A63]">When a conversation feels worth returning to, save it from Ask Redtent and it will appear here.</p></div>}
  </section>;
}

function JournalCard({ entry, onEdit, onDelete }: { entry: NonNullable<EditingEntry>; onEdit: (entry: NonNullable<EditingEntry>) => void; onDelete: (id: number) => void }) {
  return <article className="rose-card flex min-h-56 flex-col p-5"><div className="flex items-start justify-between gap-3"><div><span className={`phase-pill text-[10px] ${phaseColors[entry.phase]}`}>{phaseLabels[entry.phase]} phase</span><h3 className="mt-3 font-display text-2xl leading-tight">{entry.title}</h3><p className="mt-1 text-xs text-[#957B72]">{displayDate(entry.entryAt, { month: "long", day: "numeric", year: "numeric" })}</p></div><div className="flex gap-1"><button onClick={() => onEdit(entry)} className="grid h-8 w-8 place-items-center rounded-lg text-[#A65461] hover:bg-[#FCECEE]" aria-label="Edit reflection"><Edit3 className="h-3.5 w-3.5" /></button><button onClick={() => onDelete(entry.id)} className="grid h-8 w-8 place-items-center rounded-lg text-[#A65461] hover:bg-[#FCECEE]" aria-label="Delete reflection"><Trash2 className="h-3.5 w-3.5" /></button></div></div><div className="prose prose-sm mt-4 line-clamp-4 max-w-none text-[#6E5650]"><Streamdown>{entry.body}</Streamdown></div></article>;
}

function EmptyJournal() { return <div className="rose-card mt-4 grid min-h-44 place-items-center p-6 text-center"><BookHeart className="h-7 w-7 text-[#BE6C76]" /><p className="mt-3 text-sm text-[#806A63]">Your next insight might begin with a single honest sentence. Start when you are ready.</p></div>; }
function Loading() { return <div className="mx-auto max-w-5xl px-4 py-16 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#B45263]" /></div>; }
function FormatButton({ label, onClick }: { label: string; onClick: () => void }) { return <button onClick={onClick} type="button" className="rounded-lg bg-[#F6E9E5] px-3 py-1.5 text-xs font-bold text-[#815B55] hover:bg-[#EFD9D2]">{label}</button>; }
