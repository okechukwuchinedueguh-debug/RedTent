import { describe, expect, it } from "vitest";
import { buildAskRedtentSystemPrompt } from "./askRedtent";

describe("Ask Redtent context prompt", () => {
  it("uses only the selected user-provided context and maintains safety boundaries", () => {
    const prompt = buildAskRedtentSystemPrompt({
      phase: "luteal",
      cycleDay: 22,
      foodCulture: "Nigerian foods",
      dietaryPreferences: "Quick dinners",
      dietaryRestrictions: null,
      wellnessGoals: "More meal variety",
      wellness: [{ mood: "low", energy: "low", sleepQuality: "fair", symptoms: "[\"Bloating\"]" }],
      food: [{ phase: "luteal", detectedFoods: ["Jollof rice", "Turkey"] }],
      journal: [],
    });

    expect(prompt).toContain("Jollof rice, Turkey");
    expect(prompt).toContain("Do not diagnose");
    expect(prompt).toContain("No journal context was shared");
    expect(prompt).toContain("not provided");
  });
});
