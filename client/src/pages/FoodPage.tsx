import { trpc } from "@/lib/trpc";
import { displayDate, phaseColors, phaseLabels } from "@/lib/redtent";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, ChevronRight, ImagePlus, Loader2, ScanLine, ShieldCheck, Sparkles, Trash2, Upload, VideoOff, Check, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "./Home";

type Phase = "menstrual" | "follicular" | "ovulation" | "luteal";
type FoodAnalysis = {
  detectedFoods: string[];
  macroEstimates: { protein: string; carbohydrates: string; fats: string; fibre: string };
  micronutrientHighlights: { nutrient: string; observation: string }[];
  phaseSpecificSuggestions: string[];
  confidence: "low" | "medium" | "high";
  limitations: string;
  safetyNote: string;
};
type CurrentAnalysis = { id: number; imageUrl: string; phase: Phase; analysis: FoodAnalysis } | null;
const scanContexts = [
  { id: "meal", label: "Meal", detail: "A plate, bowl, or snack" },
  { id: "grocery", label: "Grocery", detail: "A packaged or fresh item" },
  { id: "menu", label: "Menu", detail: "A restaurant or takeaway menu" },
  { id: "label", label: "Label", detail: "A package nutrition or ingredients label" },
  { id: "recipe", label: "Recipe", detail: "A recipe or ingredient list" },
  { id: "shelf", label: "Shelf", detail: "Several food options together" },
] as const;
type ScanContext = (typeof scanContexts)[number]["id"];

export default function FoodPage() {
  const utils = trpc.useUtils();
  const galleryInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const [selected, setSelected] = useState<{ dataUrl: string; filename: string; lensMode: "before" | "after"; scanContext: ScanContext } | null>(null);
  const [lensMode, setLensMode] = useState<"before" | "after">("before");
  const [scanContext, setScanContext] = useState<ScanContext>("meal");
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<CurrentAnalysis>(null);
  const overview = trpc.dashboard.overview.useQuery();
  const foods = trpc.food.list.useQuery();
  const analyse = trpc.food.analyse.useMutation({
    onSuccess: async result => {
      setCurrentAnalysis(result as CurrentAnalysis);
      setSelected(null);
      await Promise.all([utils.food.list.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Your food observation is ready");
    },
    onError: error => toast.error(error.message || "We couldn’t analyse that image. Please try another photo."),
  });
  const remove = trpc.food.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.food.list.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Food snapshot removed");
    },
    onError: error => toast.error(error.message),
  });
  const correct = trpc.food.correct.useMutation({
    onSuccess: async () => { await Promise.all([utils.food.list.invalidate(), utils.dashboard.overview.invalidate()]); toast.success("Your correction has been saved to Food Lens."); },
    onError: error => toast.error(error.message),
  });

  const stopCamera = () => {
    cameraStream.current?.getTracks().forEach(track => track.stop());
    cameraStream.current = null;
    setCameraOpen(false);
  };

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStream.current) videoRef.current.srcObject = cameraStream.current;
  }, [cameraOpen]);
  useEffect(() => () => stopCamera(), []);

  const handleFile = (file?: File) => {
    if (!file) return;
    setCameraMessage(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setCameraMessage("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCameraMessage("Choose an image smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSelected({ dataUrl: String(reader.result), filename: file.name || "food-lens", lensMode, scanContext });
    reader.onerror = () => setCameraMessage("We couldn’t read that image. Please try again.");
    reader.readAsDataURL(file);
  };
  const launchCamera = async () => {
    setCameraMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("This browser cannot open a camera. Choose a photo from your gallery instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      cameraStream.current = stream;
      setCameraOpen(true);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      setCameraMessage(name === "NotAllowedError" || name === "SecurityError" ? "Camera access was denied. You can choose a photo from your gallery instead." : "We couldn’t access a camera on this device. You can choose a photo from your gallery instead.");
    }
  };
  const captureCameraPhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      setCameraMessage("The camera is still getting ready. Please try again or choose a photo from your gallery.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraMessage("We couldn’t capture that image. Choose a photo from your gallery instead.");
      stopCamera();
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setSelected({ dataUrl: canvas.toDataURL("image/jpeg", 0.9), filename: `redtent-camera-${Date.now()}.jpg`, lensMode, scanContext });
    stopCamera();
  };

  if (overview.isLoading || foods.isLoading) return <Loading />;
  if (overview.error || foods.error || !overview.data) return <ErrorState title="Your food space couldn’t be loaded" detail="Please check your connection and try again." />;
  const activePhase = overview.data.summary.phase as Phase;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-7 lg:px-10 lg:pt-9">
      <header><p className="eyebrow">Food Lens</p><h1 className="mt-1 font-display text-3xl sm:text-4xl">Snap it. Ask it. Understand it.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#806A63]">Food Lens helps you explore what is visible in a meal with cultural context, uncertainty, and gentle ideas. It is never a scorecard for your body or food choices.</p></header>
      <section className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[1.7rem] bg-[#512F37] p-6 text-[#FFF9F7] shadow-[0_18px_50px_rgba(77,36,47,0.2)] sm:p-8">
          <span className={`phase-pill ${phaseColors[activePhase]}`}>Your current phase: {phaseLabels[activePhase]}</span>
          <h2 className="mt-5 font-display text-3xl">See food in your real life.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#F0DEDA]">Start with a meal, grocery, menu, label, recipe, or shelf. Food Lens looks only at what is visible, then returns flexible context for your current cycle phase.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1.5"><button onClick={() => setLensMode("before")} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${lensMode === "before" ? "bg-white text-[#713647]" : "text-white"}`}>Before You Eat</button><button onClick={() => setLensMode("after")} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${lensMode === "after" ? "bg-white text-[#713647]" : "text-white"}`}>I Ate This</button></div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{scanContexts.map(context => <button key={context.id} onClick={() => setScanContext(context.id)} className={`rounded-xl border px-3 py-2 text-left transition ${scanContext === context.id ? "border-white bg-white text-[#713647]" : "border-white/20 bg-white/5 text-white hover:bg-white/10"}`}><span className="block text-xs font-bold">{context.label}</span><span className={`mt-0.5 block text-[10px] leading-4 ${scanContext === context.id ? "text-[#8B6470]" : "text-[#F1D9D9]"}`}>{context.detail}</span></button>)}</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={launchCamera} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#713647] transition hover:bg-[#FAEDEC]"><Camera className="h-4 w-4" /> Snap food</button>
            <button onClick={() => galleryInput.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"><ImagePlus className="h-4 w-4" /> Choose from gallery</button>
          </div>
          <input ref={galleryInput} onChange={event => handleFile(event.target.files?.[0])} accept="image/jpeg,image/png,image/webp" type="file" className="hidden" />
          {cameraMessage && <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-white/10 p-3 text-xs leading-5 text-[#F4D5D2]"><p className="flex gap-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{cameraMessage}</p><button onClick={() => galleryInput.current?.click()} className="shrink-0 font-bold text-white underline underline-offset-2">Gallery</button></div>}
        </div>
        <aside className="rose-card p-6"><ShieldCheck className="h-7 w-7 text-[#778F72]" /><h2 className="mt-4 font-display text-2xl">Helpful context, never judgment.</h2><p className="mt-3 text-sm leading-6 text-[#806A63]">A photo cannot confirm every ingredient, portion, recipe, label, or personal health need. Redtent shows its uncertainty and lets your correction lead.</p><ul className="mt-5 space-y-2 text-sm text-[#6E5650]"><li className="flex gap-2"><Check className="h-4 w-4 text-[#B65464]" /> Visible foods and approximate macro ranges</li><li className="flex gap-2"><Check className="h-4 w-4 text-[#B65464]" /> Flexible meal ideas for your cycle phase</li><li className="flex gap-2"><Check className="h-4 w-4 text-[#B65464]" /> A growing private Food Lens timeline</li></ul></aside>
      </section>
      {selected && <section className="rose-card mt-7 overflow-hidden p-4 sm:p-6"><div className="grid gap-5 sm:grid-cols-[220px_1fr]"><img src={selected.dataUrl} className="h-52 w-full rounded-2xl object-cover sm:h-44" alt="Selected Food Lens image ready for analysis" /><div className="flex flex-col items-start"><p className="eyebrow">{selected.lensMode === "before" ? "Before You Eat" : "I Ate This"} · {scanContexts.find(context => context.id === selected.scanContext)?.label}</p><h2 className="mt-1 font-display text-2xl">This context is yours to understand, not judge.</h2><p className="mt-3 text-sm leading-6 text-[#806A63]">Your image and Food Lens observation stay in your Redtent account. You can correct what Redtent sees or remove it whenever you choose.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => analyse.mutate(selected)} disabled={analyse.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{analyse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}{analyse.isPending ? "Looking through Food Lens..." : "Understand this"}</button><button onClick={() => setSelected(null)} disabled={analyse.isPending} className="rounded-xl bg-[#F4E5E0] px-4 py-3 text-sm font-semibold text-[#8E4B57]">Choose a different image</button></div></div></div></section>}
      {currentAnalysis && <AnalysisResult result={currentAnalysis} onDismiss={() => setCurrentAnalysis(null)} onCorrect={(foods, notes) => correct.mutate({ id: currentAnalysis.id, detectedFoods: foods, userNotes: notes })} correcting={correct.isPending} />}
      <section className="mt-8"><div className="flex items-end justify-between"><div><p className="eyebrow">Your Food Lens timeline</p><h2 className="mt-1 font-display text-2xl">Return to what you have chosen to understand.</h2></div><span className="text-xs text-[#8D756C]">{foods.data?.length || 0} saved</span></div>{foods.data?.length ? <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{foods.data.map(entry => <FoodHistoryCard key={entry.id} entry={entry} onDelete={id => remove.mutate({ id })} />)}</div> : <div className="rose-card mt-4 grid min-h-48 place-items-center p-6 text-center"><Upload className="h-7 w-7 text-[#BE6C76]" /><p className="mt-3 max-w-md text-sm leading-6 text-[#806A63]">Your Food Lens timeline begins whenever you want a little more context. There is no pressure to log every meal.</p></div>}</section>
      <p className="mt-8 max-w-3xl text-xs leading-5 text-[#927B74]">AI food recognition and nutrition estimates can be inaccurate. Redtent does not diagnose health conditions or prescribe dietary treatment. For personal nutrition or medical guidance, speak with a qualified clinician or registered dietitian.</p>
      {cameraOpen && <CameraDialog videoRef={videoRef} onCapture={captureCameraPhoto} onClose={stopCamera} />}
    </div>
  );
}

function AnalysisResult({ result, onDismiss, onCorrect, correcting }: { result: NonNullable<CurrentAnalysis>; onDismiss: () => void; onCorrect: (foods: string[], notes: string | null) => void; correcting: boolean }) {
  const { analysis, phase, imageUrl } = result;
  const macros = [["Protein", analysis.macroEstimates.protein], ["Carbohydrates", analysis.macroEstimates.carbohydrates], ["Fats", analysis.macroEstimates.fats], ["Fibre", analysis.macroEstimates.fibre]];
  const [correction, setCorrection] = useState(analysis.detectedFoods.join(", "));
  const [note, setNote] = useState("");
  return <section className="mt-7 overflow-hidden rounded-[1.7rem] border border-[#E6D7D3] bg-[#FFFDFB] shadow-[0_16px_45px_rgba(107,65,60,0.1)]"><div className="border-b border-[#EDE0DB] bg-[#FCF4F0] p-5 sm:flex sm:items-center sm:justify-between sm:p-7"><div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-[#B45263]" /><div><p className="eyebrow">Food Lens observation</p><h2 className="mt-1 font-display text-2xl">What this meal may provide</h2></div></div><button onClick={onDismiss} className="mt-4 text-sm font-semibold text-[#A84D5F] sm:mt-0">Hide result</button></div><div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.65fr_1.35fr]"><img src={imageUrl} alt="Food Lens analysis" className="h-56 w-full rounded-2xl object-cover" /><div><div className="flex flex-wrap items-center gap-2"><span className={`phase-pill ${phaseColors[phase]}`}>{phaseLabels[phase]} phase</span><span className="text-xs font-semibold capitalize text-[#8A746C]">{analysis.confidence} visual confidence</span></div><p className="mt-4 text-sm font-semibold">What is visible: <span className="font-normal text-[#806A63]">{analysis.detectedFoods.join(", ") || "Food details are not clear"}</span></p><div className="mt-5 grid grid-cols-2 gap-3">{macros.map(([label, value]) => <div key={label} className="rounded-xl bg-[#F9EFEB] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#9B7D74]">{label}</p><p className="mt-1 text-sm font-bold text-[#633F3A]">~{value}</p></div>)}</div></div></div><div className="grid gap-6 border-t border-[#F0E4DF] p-5 sm:grid-cols-2 sm:p-7"><div><p className="eyebrow">Micronutrient highlights</p><div className="mt-3 space-y-3">{analysis.micronutrientHighlights.map(item => <div key={item.nutrient} className="rounded-xl bg-[#F6F0EA] p-3"><p className="text-sm font-bold text-[#654B42]">{item.nutrient}</p><p className="mt-1 text-xs leading-5 text-[#806A63]">{item.observation}</p></div>)}</div></div><div><p className="eyebrow">What could complement it</p><div className="mt-3 space-y-3">{analysis.phaseSpecificSuggestions.map((suggestion, index) => <p key={index} className="rounded-xl border border-[#EBDDD8] p-3 text-sm leading-6 text-[#6F554D]"><ChevronRight className="mr-1 inline h-4 w-4 text-[#B45263]" />{suggestion}</p>)}</div></div></div><div className="border-t border-[#F0E4DF] bg-[#FBF7F4] p-5"><p className="eyebrow">Help Food Lens learn from your correction</p><p className="mt-1 text-xs leading-5 text-[#806A63]">If a visible food is wrong, your correction is the source of truth for this saved entry.</p><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input value={correction} onChange={event => setCorrection(event.target.value)} placeholder="e.g. Jollof rice, turkey, plantain" className="rounded-xl border border-[#E5D5D0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B45263]" /><input value={note} onChange={event => setNote(event.target.value)} placeholder="Optional note" className="rounded-xl border border-[#E5D5D0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B45263]" /><button onClick={() => onCorrect(correction.split(",").map(value => value.trim()).filter(Boolean), note || null)} disabled={correcting || !correction.trim()} className="rounded-xl bg-[#A84D5F] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Save correction</button></div><p className="mt-4 text-xs leading-5 text-[#806A63]">{analysis.limitations} {analysis.safetyNote}</p></div></section>;
}

function FoodHistoryCard({ entry, onDelete }: { entry: { id: number; imageUrl: string; phase: Phase; lensMode: "before" | "after"; scanContext: ScanContext; analysisJson: string; createdAt: Date }; onDelete: (id: number) => void }) {
  let analysis: FoodAnalysis | null = null; try { analysis = JSON.parse(entry.analysisJson) as FoodAnalysis; } catch { analysis = null; }
  return <article className="rose-card overflow-hidden"><img src={entry.imageUrl} alt="Saved Food Lens snapshot" className="h-36 w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><span className={`phase-pill text-[10px] ${phaseColors[entry.phase]}`}>{scanContexts.find(context => context.id === entry.scanContext)?.label || "Food Lens"}</span><p className="mt-3 text-sm font-semibold">{analysis?.detectedFoods?.slice(0, 2).join(" · ") || "Food Lens snapshot"}</p><p className="mt-1 text-xs text-[#8D756C]">{displayDate(entry.createdAt, { month: "short", day: "numeric", year: "numeric" })}</p></div><button onClick={() => onDelete(entry.id)} className="grid h-8 w-8 place-items-center rounded-lg text-[#A65461] hover:bg-[#FCECEE]" aria-label="Delete Food Lens snapshot"><Trash2 className="h-3.5 w-3.5" /></button></div></div></article>;
}
function CameraDialog({ videoRef, onCapture, onClose }: { videoRef: React.RefObject<HTMLVideoElement | null>; onCapture: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#2F1A1E]/70 p-4"><div className="w-full max-w-xl overflow-hidden rounded-[1.7rem] bg-[#1F1517] p-4 shadow-2xl"><div className="mb-3 flex items-center justify-between px-1 text-white"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#E8B7B7]">Camera</p><p className="mt-1 font-display text-xl">Frame your meal</p></div><button onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-bold text-[#F4D5D2] hover:bg-white/10">Close</button></div><video ref={videoRef} autoPlay muted playsInline className="max-h-[60vh] w-full rounded-2xl bg-black object-cover" /><div className="mt-4 flex gap-3"><button onClick={onCapture} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#713647]"><Camera className="h-4 w-4" /> Capture photo</button><button onClick={onClose} className="rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white"><VideoOff className="h-4 w-4" /></button></div></div></div>;
}
function Loading() { return <div className="mx-auto max-w-6xl px-4 py-16 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#B45263]" /></div>; }
