export type ProfilePhotoAction = "discard" | "remove" | "none";
export type ProfilePhotoPresentation = { kind: "photo"; url: string; action: Exclude<ProfilePhotoAction, "none"> } | { kind: "fallback"; action: "none" };

export function resolveProfilePhoto(pendingPhoto?: string | null, savedPhoto?: string | null) {
  return pendingPhoto || savedPhoto || null;
}

export function getProfilePhotoAction(pendingPhoto?: string | null, savedPhoto?: string | null): ProfilePhotoAction {
  if (pendingPhoto) return "discard";
  if (savedPhoto) return "remove";
  return "none";
}

export function getProfilePhotoPresentation(pendingPhoto?: string | null, savedPhoto?: string | null): ProfilePhotoPresentation {
  const url = resolveProfilePhoto(pendingPhoto, savedPhoto);
  const action = getProfilePhotoAction(pendingPhoto, savedPhoto);
  return url && action !== "none" ? { kind: "photo", url, action } : { kind: "fallback", action: "none" };
}
