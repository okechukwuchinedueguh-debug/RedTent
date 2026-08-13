export const REDTENT_PUBLIC_URL = "https://redtentapp-n2tdag4a.manus.space";

export function createShareableRedtentLink(appUrl: string) {
  const candidate = new URL(appUrl);
  const isLocalHost = candidate.hostname === "localhost" || candidate.hostname === "127.0.0.1" || candidate.hostname.endsWith(".manus.computer");
  return new URL("/", isLocalHost ? REDTENT_PUBLIC_URL : candidate.origin).toString().replace(/\/$/, "");
}

export function createRedtentInvitation(appUrl: string) {
  const shareableLink = createShareableRedtentLink(appUrl);
  return `I’m using Redtent, a private space to notice your cycle, food, mood, and personal patterns with more care. Join me here: ${shareableLink}`;
}

export async function copyRedtentInvitationLink(link: string, writeText: (value: string) => Promise<void>) {
  try {
    await writeText(link);
    return { copied: true as const, message: "Your Redtent link is copied. It is ready to send." };
  } catch {
    return { copied: false as const, message: "The link could not be copied. Please select it and try again." };
  }
}
