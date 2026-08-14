import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { copy } from "@/lib/redtent";
import { getProfilePhotoPresentation } from "@/lib/profilePhoto";
import { copyRedtentInvitationLink, createRedtentInvitation, createShareableRedtentLink } from "@/lib/invitation";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeChoiceGroup from "@/components/ThemeChoiceGroup";
import { NotificationPreferencesCard } from "@/components/NotificationPreferencesCard";
import { AppearancePersonalization } from "@/components/AppearancePersonalization";
import { Camera, Copy, ImagePlus, Loader2, LockKeyhole, LogOut, Share2, ShieldCheck, Sparkles, Trash2, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { preference, setThemePreference, theme } = useTheme();
  const utils = trpc.useUtils();
  const profile = trpc.profile.get.useQuery();
  const photoInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [foodCulture, setFoodCulture] = useState("");
  const [preferences, setPreferences] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    if (!profile.data) return;
    setUsername(profile.data.username || "");
    setFoodCulture(profile.data.foodCulture || "");
    setPreferences(profile.data.dietaryPreferences || "");
    setRestrictions(profile.data.dietaryRestrictions || "");
    setGoals(profile.data.wellnessGoals || "");
  }, [profile.data]);

  const identity = trpc.profile.updateIdentity.useMutation({
    onSuccess: async () => {
      await Promise.all([profile.refetch(), utils.profile.get.invalidate(), utils.dashboard.overview.invalidate()]);
      setPendingPhoto(null);
      toast.success("Your Redtent identity is updated.");
    },
    onError: error => toast.error(error.message),
  });
  const save = trpc.profile.save.useMutation({
    onSuccess: async () => { await profile.refetch(); toast.success("Your Redtent preferences are saved."); },
    onError: error => toast.error(error.message),
  });
  const removePhoto = trpc.profile.removePhoto.useMutation({
    onSuccess: async () => {
      setPendingPhoto(null);
      await Promise.all([profile.refetch(), utils.profile.get.invalidate(), utils.dashboard.overview.invalidate()]);
      toast.success("Your profile photo has been removed.");
    },
    onError: error => toast.error(error.message),
  });

  const selectPhoto = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error("Choose a JPEG, PNG, or WebP profile photo."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Choose a profile photo smaller than 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setPendingPhoto(String(reader.result));
    reader.onerror = () => toast.error("That profile photo could not be read. Please choose another.");
    reader.readAsDataURL(file);
  };

  const savedPhoto = profile.data?.profilePhotoUrl || null;
  const photoState = getProfilePhotoPresentation(pendingPhoto, savedPhoto);
  const photo = photoState.kind === "photo" ? photoState.url : null;
  const photoAction = photoState.action;
  const displayName = username || profile.data?.username || user?.name || "Redtent member";
  const usernameValid = !username || /^[a-z0-9_]{3,24}$/.test(username);
  const shareableLink = createShareableRedtentLink(window.location.origin);

  const inviteFriend = async () => {
    const invitation = createRedtentInvitation(window.location.origin);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Try Redtent", text: invitation, url: window.location.origin });
        toast.success("Your Redtent invitation is ready to send.");
        return;
      }
      await navigator.clipboard.writeText(invitation);
      toast.success("Your Redtent invitation has been copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Your invitation could not be shared. Please try again.");
    }
  };

  const copyInvitationLink = async () => {
    const result = await copyRedtentInvitationLink(shareableLink, value => navigator.clipboard.writeText(value));
    if (result.copied) toast.success(result.message);
    else toast.error(result.message);
  };

  return <div className="mx-auto max-w-3xl px-4 pb-8 pt-5 sm:px-7 lg:px-10 lg:pt-9">
    <header><p className="eyebrow">Your Redtent account</p><h1 className="mt-1 font-display text-3xl sm:text-4xl">Your story stays yours.</h1><p className="mt-2 text-sm text-[#806A63]">Choose how you appear in your private Redtent space, then set the context that helps your food and wellness suggestions feel relevant.</p></header>

    <section className="rose-card mt-7 p-5 sm:p-7">
      <p className="eyebrow">Your Redtent identity</p>
      <h2 className="mt-1 font-display text-2xl">Make your space feel like yours.</h2>
      <p className="mt-2 text-sm leading-6 text-[#806A63]">Your username is unique to Redtent. Your profile photo is private to your account and can be replaced or removed whenever you choose.</p>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[1.6rem] bg-[#C76E79] text-2xl font-bold text-white shadow-[0_10px_25px_rgba(172,79,96,0.22)]">
          {photo ? <img src={photo} alt="Your selected Redtent profile" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}
          <button type="button" onClick={() => photoInput.current?.click()} className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-lg bg-[#3E2527]/80 px-2 py-1.5 text-[10px] font-bold text-white backdrop-blur"><Camera className="h-3 w-3" /> Change</button>
        </div>
        <div className="min-w-0 flex-1"><p className="text-lg font-semibold text-[#533A34]">{displayName}</p><p className="mt-1 text-sm text-[#806A63]">{user?.email || "Your secure Redtent account"}</p><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2"><button type="button" onClick={() => photoInput.current?.click()} className="inline-flex items-center gap-2 text-sm font-semibold text-[#A84D5F]"><ImagePlus className="h-4 w-4" /> {photo ? "Choose another photo" : "Add a profile photo"}</button>{photoAction !== "none" ? <button type="button" onClick={() => photoAction === "discard" ? setPendingPhoto(null) : removePhoto.mutate()} disabled={removePhoto.isPending} className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5D55] disabled:opacity-60"><Trash2 className="h-4 w-4" /> {removePhoto.isPending ? "Removing photo..." : photoAction === "discard" ? "Discard selected photo" : "Remove photo"}</button> : null}</div></div>
      </div>
      <input ref={photoInput} onChange={event => selectPhoto(event.target.files?.[0])} accept="image/jpeg,image/png,image/webp" type="file" className="hidden" />
      <label className="mt-6 block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Username</span><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9B827A]">@</span><input value={username} onChange={event => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} maxLength={24} className="field-input pl-7" placeholder="your_redtent_name" aria-describedby="username-help" /></div><span id="username-help" className={`mt-1.5 block text-xs ${username && !usernameValid ? "text-[#B04D5C]" : "text-[#8D756C]"}`}>{username && !usernameValid ? "Use 3 to 24 lowercase letters, numbers, or underscores." : "Use lowercase letters, numbers, or underscores. You can leave this blank until you are ready."}</span></label>
      <button onClick={() => identity.mutate({ username: username || undefined, photoDataUrl: pendingPhoto || undefined })} disabled={identity.isPending || !usernameValid || (!username && !pendingPhoto)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{identity.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{identity.isPending ? "Saving your identity..." : "Save profile"}</button>
    </section>

    <section className="rose-card mt-6 p-5 sm:p-6"><p className="eyebrow">Your Food Lens context</p><h2 className="mt-1 font-display text-2xl">Set only what you want Redtent to consider.</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">These details are optional and stay in your private Redtent account. They help you keep suggestions culturally relevant and practical.</p><div className="mt-5 grid gap-4"><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Food culture and familiar meals</span><input value={foodCulture} onChange={event => setFoodCulture(event.target.value)} maxLength={120} className="field-input" placeholder="e.g. Nigerian and global foods" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Preferences</span><textarea value={preferences} onChange={event => setPreferences(event.target.value)} maxLength={500} className="field-input min-h-24 resize-y" placeholder="e.g. Meals I enjoy, cooking time, budget priorities" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Restrictions or foods to avoid</span><textarea value={restrictions} onChange={event => setRestrictions(event.target.value)} maxLength={500} className="field-input min-h-24 resize-y" placeholder="Only share what you are comfortable sharing" /></label><label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7E655D]">Wellness goals</span><textarea value={goals} onChange={event => setGoals(event.target.value)} maxLength={500} className="field-input min-h-24 resize-y" placeholder="e.g. More meal variety, easier weekly planning, steady check-ins" /></label></div><button onClick={() => save.mutate({ foodCulture: foodCulture.trim() || "Nigerian and global foods", dietaryPreferences: preferences.trim() || null, dietaryRestrictions: restrictions.trim() || null, wellnessGoals: goals.trim() || null })} disabled={save.isPending || profile.isLoading} className="mt-5 rounded-xl bg-[#F4E5E0] px-5 py-3 text-sm font-semibold text-[#8E4B57] disabled:opacity-60">{save.isPending ? "Saving your preferences..." : "Save my preferences"}</button></section>

    <section className="mt-6"><NotificationPreferencesCard /></section>
    <section id="appearance-settings" className="mt-6 scroll-mt-24 grid gap-4 lg:grid-cols-2"><article className="rose-card p-5"><p className="eyebrow">Appearance</p><h2 className="mt-1 font-display text-2xl">Make Redtent comfortable to read.</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">Choose a light or dark view, or let Redtent follow your local day and night. Automatic mode uses light from 7:00 to 18:59 and dark from 19:00 to 6:59.</p><ThemeChoiceGroup preference={preference} resolvedTheme={theme} onPreferenceChange={setThemePreference} /></article><AppearancePersonalization /></section>
    <section className="mt-6"><article className="rose-card p-5"><p className="eyebrow">Share Redtent</p><h2 className="mt-1 font-display text-2xl">Invite a friend with care.</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">Share a clean public link and a simple invitation. Your cycle, food, journal, and account details are never included.</p><div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E8D9D4] bg-[#FFFDFB] p-2"><a href={shareableLink} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate px-2 py-1.5 text-sm font-medium text-[#704B4D] underline decoration-[#DAB8B8] underline-offset-4">{shareableLink}</a><button type="button" onClick={copyInvitationLink} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#DAB8B8] px-3 py-2 text-xs font-bold text-[#934755] hover:bg-[#FCECEE]"><Copy className="h-3.5 w-3.5" /> Copy link</button></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={inviteFriend} className="inline-flex items-center gap-2 rounded-xl bg-[#A84D5F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8F3F50]"><Share2 className="h-4 w-4" /> Invite a friend</button></div><p className="mt-3 flex items-center gap-1.5 text-xs text-[#8B7069]"><Copy className="h-3.5 w-3.5" /> Copy the link or open your device share sheet.</p></article></section>

    <section className="mt-6 grid gap-4 sm:grid-cols-2"><article className="rose-card p-5"><LockKeyhole className="h-6 w-6 text-[#A94F60]" /><h2 className="mt-4 font-display text-xl">Private by design</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">{copy.privateSpace}</p></article><article className="rose-card p-5"><ShieldCheck className="h-6 w-6 text-[#7A9677]" /><h2 className="mt-4 font-display text-xl">Clear, careful insights</h2><p className="mt-2 text-sm leading-6 text-[#806A63]">We make uncertainty visible. Cycle forecasts, food observations, and patterns are helpful estimates, not diagnoses or medical advice.</p></article></section>
    <section className="mt-6 rounded-2xl bg-[#F3ECEE] p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#9A5A68]" /><div><h2 className="font-semibold">How Food Lens works</h2><p className="mt-1 text-sm leading-6 text-[#725E68]">When you choose a food photo, an AI vision model offers a structured observation. It cannot see every ingredient, portion, preparation method, or personal need with certainty. Your correction overrides the visible-food label for that saved entry.</p></div></div></section>
    <Button onClick={logout} variant="outline" className="mt-7 border-[#DDBFC0] text-[#994755] hover:bg-[#FCECEE]"><LogOut className="mr-2 h-4 w-4" /> Sign out securely</Button>
  </div>;
}
