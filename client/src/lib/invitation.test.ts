import { describe, expect, it } from "vitest";
import { createRedtentInvitation } from "./invitation";

describe("Redtent invitations", () => {
  it("creates a shareable app invitation without including a user’s private data", () => {
    const invitation = createRedtentInvitation("https://redtent.example");
    expect(invitation).toContain("Redtent");
    expect(invitation).toContain("https://redtent.example");
    expect(invitation).not.toContain("@redtent_user");
  });
});
