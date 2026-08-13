import { describe, expect, it } from "vitest";
import { getProfilePhotoAction, getProfilePhotoPresentation, resolveProfilePhoto } from "./profilePhoto";

describe("profile photo presentation", () => {
  it("uses a pending replacement before the saved photo", () => {
    expect(resolveProfilePhoto("data:image/png;base64,pending", "/manus-storage/saved.png")).toBe("data:image/png;base64,pending");
    expect(getProfilePhotoAction("data:image/png;base64,pending", "/manus-storage/saved.png")).toBe("discard");
  });

  it("removes a saved photo and returns to the fallback-avatar state", () => {
    expect(getProfilePhotoAction(null, "/manus-storage/saved.png")).toBe("remove");
    const afterRemoval = getProfilePhotoPresentation(null, null);
    expect(resolveProfilePhoto(null, null)).toBeNull();
    expect(afterRemoval).toEqual({ kind: "fallback", action: "none" });
    expect("url" in afterRemoval).toBe(false);
  });
});
