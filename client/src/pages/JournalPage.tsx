import { trpc } from "@/lib/trpc";
import { displayDate, localDateInput, parseInputDate, phaseColors, phaseLabels } from "@/lib/redtent";
import { useState } from "react";
import { BookHeart, Edit3, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { ErrorState } from "./Home";

type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";
type EditingEntry = { id: number; title: string; body: string; phase: Phase; entryAt: Date } | null;

export default function JournalPage() {
  const utils = trpc.useUtils();
  const journal = trpc.journal.list.useQuery();
  const cycle = trpc.cycles.summary.useQuery();
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
      toast.success("Reflection saved");
      reset();
    },
    onError: error => toast.error(error.message),
  });
  const update = trpc.journal.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.journal.list.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Reflection updated");
      reset();
    },
    onError: error => toast.error(error.message),
  });
  const remove = trpc.journal.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.journal.list.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Reflection deleted");
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = () => {
    const payload = { title, body, phase, entryAt: parseInputDate(entryAt) };
    if (editing) update.mutate({ id: editing.id, ...payload });
    else create.mutate(payload);
  };

  if (journal.isLoading || cycle.isLoading) return <Loading />;
  if (journal.error || !cycle.data) return <ErrorState title="Your journal couldn’t be loaded" detail="Please check your connection and try again." />;
  const entries = journal.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-7 lg:px-10 lg:pt-9">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Private reflections</p><h1 className="mt-1 font-display text-3xl sm:text-4xl">Journal</h1><p className="mt-2 text-sm text-[#806A63]">A quiet space to notice what is unfolding.</p></div>
        <button onClick={() => begin()} className="inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> New entry</button>
      </header>
      <section className="rose-card mt-7 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{editing ? "Editing reflection" : "New reflection"}</p><h2 className="mt-1 font-display text-2xl">{editing ? "Refine your thoughts" : "What is on your mind?"}</h2></div><span className={`phase-pill ${phaseColors[phase]}`}>{phaseLabels[phase]}</span></div>
        <input value={title} onChange={event => setTitle(event.target.value)} maxLength={180} className="mt-6 w-full border-b border-[#EADAD3] bg-transparent pb-3 font-display text-2xl outline-none placeholder:text-[#BFA8A0]" placeholder="Give this moment a title" />
        <div className="mt-4 flex flex-wrap gap-2"><FormatButton label="Bold" onClick={() => setBody(value => `${value}**bold text**`)} /><FormatButton label="Emphasis" onClick={() => setBody(value => `${value}*emphasis*`)} /><FormatButton label="List" onClick={() => setBody(value => `${value}\n- `)} /></div>
        <textarea value={body} onChange={event => setBody(event.target.value)} maxLength={8000} className="mt-3 min-h-48 w-full resize-y rounded-xl border border-[#E8D9D4] bg-[#FFFDFC] p-4 text-sm leading-7 outline-none transition focus:border-[#B65B69] focus:ring-4 focus:ring-[#F8E4E5]" placeholder="Write in your own words. You can use the formatting tools above for a simple rich-text (Markdown) entry." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Cycle phase</span><select value={phase} onChange={event => setPhase(event.target.value as Phase)} className="field-input">{Object.entries(phaseLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Entry date</span><input value={entryAt} onChange={event => setEntryAt(event.target.value)} type="date" className="field-input" /></label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3"><button onClick={submit} disabled={!title.trim() || !body.trim() || create.isPending || update.isPending} className="rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{create.isPending || update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save changes" : "Save reflection"}</button>{editing && <button onClick={reset} className="rounded-xl bg-[#F4E5E0] px-5 py-3 text-sm font-semibold text-[#8E4B57]">Cancel</button>}</div>
      </section>
      <section className="mt-8"><div><p className="eyebrow">Your pages</p><h2 className="mt-1 font-display text-2xl">Recent entries</h2></div>{entries.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{entries.map(entry => <JournalCard key={entry.id} entry={{ ...entry, phase: entry.phase as Phase }} onEdit={begin} onDelete={id => remove.mutate({ id })} />)}</div> : <EmptyJournal />}</section>
    </div>
  );
}

function JournalCard({ entry, onEdit, onDelete }: { entry: NonNullable<EditingEntry>; onEdit: (entry: NonNullable<EditingEntry>) => void; onDelete: (id: number) => void }) {
  return <article className="rose-card flex min-h-56 flex-col p-5"><div className="flex items-start justify-between gap-3"><div><span className={`phase-pill text-[10px] ${phaseColors[entry.phase]}`}>{phaseLabels[entry.phase]}</span><h3 className="mt-3 font-display text-2xl leading-tight">{entry.title}</h3><p className="mt-1 text-xs text-[#957B72]">{displayDate(entry.entryAt, { month: "long", day: "numeric", year: "numeric" })}</p></div><div className="flex gap-1"><button onClick={() => onEdit(entry)} className="grid h-8 w-8 place-items-center rounded-lg text-[#A65461] hover:bg-[#FCECEE]" aria-label="Edit entry"><Edit3 className="h-3.5 w-3.5" /></button><button onClick={() => onDelete(entry.id)} className="grid h-8 w-8 place-items-center rounded-lg text-[#A65461] hover:bg-[#FCECEE]" aria-label="Delete entry"><Trash2 className="h-3.5 w-3.5" /></button></div></div><div className="prose prose-sm mt-4 line-clamp-4 max-w-none text-[#6E5650]"><Streamdown>{entry.body}</Streamdown></div></article>;
}
function EmptyJournal() { return <div className="rose-card mt-4 grid min-h-44 place-items-center p-6 text-center"><BookHeart className="h-7 w-7 text-[#BE6C76]" /><p className="mt-3 text-sm text-[#806A63]">Your journal is waiting whenever you are ready.</p></div>; }
function Loading() { return <div className="mx-auto max-w-5xl px-4 py-16 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#B45263]" /></div>; }
function FormatButton({ label, onClick }: { label: string; onClick: () => void }) { return <button onClick={onClick} type="button" className="rounded-lg bg-[#F6E9E5] px-3 py-1.5 text-xs font-bold text-[#815B55] hover:bg-[#EFD9D2]">{label}</button>; }
