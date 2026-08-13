import { describe, expect, it } from "vitest";
import { foodAnalysisSchema } from "./foodAnalysis";

const validAnalysis = {
  detectedFoods: ["grain bowl", "vegetables"],
  macroEstimates: { protein: "~20–30 g", carbohydrates: "~40–55 g", fats: "~12–18 g", fibre: "~6–10 g" },
  micronutrientHighlights: [{ nutrient: "Iron", observation: "May be present in visible legumes and greens." }],
  phaseSpecificSuggestions: ["If it fits your preferences, pair this with a vitamin C source during the menstrual phase."],
  confidence: "medium",
  limitations: "Portions and preparation are not visible with certainty.",
  safetyNote: "This is general wellness information, not medical advice.",
};

describe("food analysis validation", () => {
  it("accepts a complete structured nutrition observation", () => {
    expect(foodAnalysisSchema.parse(validAnalysis)).toEqual(validAnalysis);
  });

  it("rejects a response missing required phase-specific suggestions", () => {
    const invalid = { ...validAnalysis, phaseSpecificSuggestions: [] };
    expect(() => foodAnalysisSchema.parse(invalid)).toThrow();
  });

  it("rejects unbounded nutrition output with an unsupported confidence label", () => {
    const invalid = { ...validAnalysis, confidence: "certain" };
    expect(() => foodAnalysisSchema.parse(invalid)).toThrow();
  });
});
