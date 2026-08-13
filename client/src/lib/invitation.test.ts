import { describe, expect, it } from "vitest";
import { copyRedtentInvitationLink, createRedtentInvitation, createShareableRedtentLink, REDTENT_PUBLIC_URL } from "./invitation";

describe("Redtent invitations", () => {
  it("creates a shareable app invitation without including a user’s private data", () => {
    const invitation = createRedtentInvitation("https://redtent.example");
    expect(invitation).toContain("Redtent");
    expect(invitation).toContain("https://redtent.example");
    expect(invitation).not.toContain("@redtent_user");
  });

  it("generates a clean public app link without preserving private paths or parameters", () => {
    expect(createShareableRedtentLink("https://redtent.example/profile?appearance=dark")).toBe("https://redtent.example");
  });

  it("never exposes a local development host in a copied invitation link", () => {
    expect(createShareableRedtentLink("http://127.0.0.1:3000/profile")).toBe(REDTENT_PUBLIC_URL);
    expect(createShareableRedtentLink("https://3000-preview.manus.computer/profile")).toBe(REDTENT_PUBLIC_URL);
  });

  it("reports clear feedback for successful and failed copy-link actions", async () => {
    await expect(copyRedtentInvitationLink("https://redtent.example", async () => undefined)).resolves.toEqual({ copied: true, message: "Your Redtent link is copied. It is ready to send." });
    await expect(copyRedtentInvitationLink("https://redtent.example", async () => { throw new Error("clipboard unavailable"); })).resolves.toEqual({ copied: false, message: "The link could not be copied. Please select it and try again." });
  });
});
