import { trpc } from "@/lib/trpc";
import { displayDate, phaseColors, phaseLabels } from "@/lib/redtent";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, ChevronRight, ImagePlus, Loader2, ScanLine, ShieldCheck, Sparkles, Trash2, Upload, VideoOff } from "lucide-react";
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
type CurrentAnalysis = { imageUrl: string; phase: Phase; analysis: FoodAnalysis } | null;

export default function FoodPage() {
  const utils = trpc.useUtils();
  const galleryInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const [selected, setSelected] = useState<{ dataUrl: string; filename: string } | null>(null);
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
    reader.onload = () => setSelected({ dataUrl: String(reader.result), filename: file.name || "meal" });
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
    setSelected({ dataUrl: canvas.toDataURL("image/jpeg", 0.9), filename: `redtent-camera-${Date.now()}.jpg` });
    stopCamera();
  };

  if (overview.isLoading || foods.isLoading) return <Loading />;
  if (overview.error || foods.error || !overview.data) return <ErrorState title="Your food space couldn’t be loaded" detail="Please check your connection and try again." />;
  const activePhase = overview.data.summary.phase as Phase;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-7 lg:px-10 lg:pt-9">
      <header><p className="eyebrow">Food observations</p><h1 className="mt-1 font-display text-3xl sm:text-4xl">See a meal with a little more context.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#806A63]">Take or choose a food photo for an AI vision-based, cycle-aware nutrition observation. This is general wellbeing information—not a measure of worth or a medical assessment.</p></header>
      <section className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[1.7rem] bg-[#512F37] p-6 text-[#FFF9F7] shadow-[0_18px_50px_rgba(77,36,47,0.2)] sm:p-8">
          <span className={`phase-pill ${phaseColors[activePhase]}`}>Your current phase: {phaseLabels[activePhase]}</span>
          <h2 className="mt-5 font-display text-3xl">Snap your food</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#F0DEDA]">We look at visible foods only. You will receive macro estimates, micronutrient highlights, and gentle ideas tailored to your current cycle phase.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={launchCamera} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#713647] transition hover:bg-[#FAEDEC]"><Camera className="h-4 w-4" /> Use camera</button>
            <button onClick={() => galleryInput.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"><ImagePlus className="h-4 w-4" /> Choose from gallery</button>
          </div>
          <input ref={galleryInput} onChange={event => handleFile(event.target.files?.[0])} accept="image/jpeg,image/png,image/webp" type="file" className="hidden" />
          {cameraMessage && <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-white/10 p-3 text-xs leading-5 text-[#F4D5D2]"><p className="flex gap-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{cameraMessage}</p><button onClick={() => galleryInput.current?.click()} className="shrink-0 font-bold text-white underline underline-offset-2">Gallery</button></div>}
        </div>
        <aside className="rose-card p-6"><ShieldCheck className="h-7 w-7 text-[#778F72]" /><h2 className="mt-4 font-display text-2xl">A careful, flexible lens.</h2><p className="mt-3 text-sm leading-6 text-[#806A63]">Photos cannot reliably show portions, ingredients, cooking methods, or personal health needs. Redtent labels uncertainty and never treats an image estimate as fact.</p><ul className="mt-5 space-y-2 text-sm text-[#6E5650]"><li className="flex gap-2"><span className="text-[#B65464]">•</span> Approximate macro ranges</li><li className="flex gap-2"><span className="text-[#B65464]">•</span> Visible-food micronutrient observations</li><li className="flex gap-2"><span className="text-[#B65464]">•</span> Cycle-phase-specific, non-prescriptive ideas</li></ul></aside>
      </section>
      {selected && <section className="rose-card mt-7 overflow-hidden p-4 sm:p-6"><div className="grid gap-5 sm:grid-cols-[220px_1fr]"><img src={selected.dataUrl} className="h-52 w-full rounded-2xl object-cover sm:h-44" alt="Selected food to analyse" /><div className="flex flex-col items-start"><p className="eyebrow">Ready to analyse</p><h2 className="mt-1 font-display text-2xl">Your food photo is private to you.</h2><p className="mt-3 text-sm leading-6 text-[#806A63]">The analysis will be stored only in your Redtent account with this photo reference. You can remove it from your history any time.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => analyse.mutate(selected)} disabled={analyse.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{analyse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}{analyse.isPending ? "Analysing your meal…" : "Analyse meal"}</button><button onClick={() => setSelected(null)} disabled={analyse.isPending} className="rounded-xl bg-[#F4E5E0] px-4 py-3 text-sm font-semibold text-[#8E4B57]">Choose another</button></div></div></div></section>}
      {currentAnalysis && <AnalysisResult result={currentAnalysis} onDismiss={() => setCurrentAnalysis(null)} />}
      <section className="mt-8"><div className="flex items-end justify-between"><div><p className="eyebrow">Your history</p><h2 className="mt-1 font-display text-2xl">Food snapshots</h2></div><span className="text-xs text-[#8D756C]">{foods.data?.length || 0} saved</span></div>{foods.data?.length ? <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{foods.data.map(entry => <FoodHistoryCard key={entry.id} entry={entry} onDelete={id => remove.mutate({ id })} />)}</div> : <div className="rose-card mt-4 grid min-h-48 place-items-center p-6 text-center"><Upload className="h-7 w-7 text-[#BE6C76]" /><p className="mt-3 max-w-md text-sm leading-6 text-[#806A63]">No food snapshots yet. Start only when an extra layer of context would feel useful.</p></div>}</section>
      <p className="mt-8 max-w-3xl text-xs leading-5 text-[#927B74]">AI food recognition and nutrition estimates can be inaccurate. Redtent does not diagnose health conditions or prescribe dietary treatment. For personal nutrition or medical guidance, speak with a qualified clinician or registered dietitian.</p>
      {cameraOpen && <CameraDialog videoRef={videoRef} onCapture={captureCameraPhoto} onClose={stopCamera} />}
    </div>
  );
}

function AnalysisResult({ result, onDismiss }: { result: NonNullable<CurrentAnalysis>; onDismiss: () => void }) {
  const { analysis, phase, imageUrl } = result;
  const macros = [["Protein", analysis.macroEstimates.protein], ["Carbohydrates", analysis.macroEstimates.carbohydrates], ["Fats", analysis.macroEstimates.fats], ["Fibre", analysis.macroEstimates.fibre]];
  return <section className="mt-7 overflow-hidden rounded-[1.7rem] border border-[#E6D7D3] bg-[#FFFDFB] shadow-[0_16px_45px_rgba(107,65,60,0.1)]"><div className="border-b border-[#EDE0DB] bg-[#FCF4F0] p-5 sm:flex sm:items-center sm:justify-between sm:p-7"><div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-[#B45263]" /><div><p className="eyebrow">AI food observation</p><h2 className="mt-1 font-display text-2xl">A thoughtful snapshot of your meal</h2></div></div><button onClick={onDismiss} className="mt-4 text-sm font-semibold text-[#A84D5F] sm:mt-0">Hide result</button></div><div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.65fr_1.35fr]"><img src={imageUrl} alt="Analysed meal" className="h-56 w-full rounded-2xl object-cover" /><div><div className="flex flex-wrap items-center gap-2"><span className={`phase-pill ${phaseColors[phase]}`}>{phaseLabels[phase]} phase</span><span className="text-xs font-semibold capitalize text-[#8A746C]">{analysis.confidence} visual confidence</span></div><p className="mt-4 text-sm font-semibold">Looks like: <span className="font-normal text-[#806A63]">{analysis.detectedFoods.join(", ") || "An unrecognised meal"}</span></p><div className="mt-5 grid grid-cols-2 gap-3">{macros.map(([label, value]) => <div key={label} className="rounded-xl bg-[#F9EFEB] p-3"><p className="text-xs font-bold uppercase tracking-wide text-[#9B7D74]">{label}</p><p className="mt-1 text-sm font-bold text-[#633F3A]">~{value}</p></div>)}</div></div></div><div className="grid gap-6 border-t border-[#F0E4DF] p-5 sm:grid-cols-2 sm:p-7"><div><p className="eyebrow">Micronutrient highlights</p><div className="mt-3 space-y-3">{analysis.micronutrientHighlights.map(item => <div key={item.nutrient} className="rounded-xl bg-[#F6F0EA] p-3"><p className="text-sm font-bold text-[#654B42]">{item.nutrient}</p><p className="mt-1 text-xs leading-5 text-[#806A63]">{item.observation}</p></div>)}</div></div><div><p className="eyebrow">For your {phaseLabels[phase].toLowerCase()} phase</p><div className="mt-3 space-y-3">{analysis.phaseSpecificSuggestions.map((suggestion, index) => <p key={index} className="rounded-xl border border-[#EBDDD8] p-3 text-sm leading-6 text-[#6F554D]"><ChevronRight className="mr-1 inline h-4 w-4 text-[#B45263]" />{suggestion}</p>)}</div></div></div><div className="border-t border-[#F0E4DF] bg-[#FBF7F4] px-5 py-4 text-xs leading-5 text-[#806A63]">{analysis.limitations} {analysis.safetyNote}</div></section>;
}

function FoodHistoryCard({ entry, onDelete }: { entry: { id: number; imageUrl: string; phase: Phase; analysisJson: string; createdAt: Date }; onDelete: (id: number) => void }) {
  let analysis: FoodAnalysis | null = null; try { analysis = JSON.parse(entry.analysisJson) as FoodAnalysis; } catch { analysis = null; }
  return <article className="rose-card overflow-hidden"><img src={entry.imageUrl} alt="Saved food snapshot" className="h-36 w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><span className={`phase-pill text-[10px] ${phaseColors[entry.phase]}`}>{phaseLabels[entry.phase]}</span><p className="mt-3 text-sm font-semibold">{analysis?.detectedFoods?.slice(0, 2).join(" · ") || "Food snapshot"}</p><p className="mt-1 text-xs text-[#8D756C]">{displayDate(entry.createdAt, { month: "short", day: "numeric", year: "numeric" })}</p></div><button onClick={() => onDelete(entry.id)} className="grid h-8 w-8 place-items-center rounded-lg text-[#A65461] hover:bg-[#FCECEE]" aria-label="Delete food snapshot"><Trash2 className="h-3.5 w-3.5" /></button></div></div></article>;
}
function CameraDialog({ videoRef, onCapture, onClose }: { videoRef: React.RefObject<HTMLVideoElement | null>; onCapture: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#2F1A1E]/70 p-4"><div className="w-full max-w-xl overflow-hidden rounded-[1.7rem] bg-[#1F1517] p-4 shadow-2xl"><div className="mb-3 flex items-center justify-between px-1 text-white"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#E8B7B7]">Camera</p><p className="mt-1 font-display text-xl">Frame your meal</p></div><button onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-bold text-[#F4D5D2] hover:bg-white/10">Close</button></div><video ref={videoRef} autoPlay muted playsInline className="max-h-[60vh] w-full rounded-2xl bg-black object-cover" /><div className="mt-4 flex gap-3"><button onClick={onCapture} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#713647]"><Camera className="h-4 w-4" /> Capture photo</button><button onClick={onClose} className="rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white"><VideoOff className="h-4 w-4" /></button></div></div></div>;
}
function Loading() { return <div className="mx-auto max-w-6xl px-4 py-16 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#B45263]" /></div>; }
