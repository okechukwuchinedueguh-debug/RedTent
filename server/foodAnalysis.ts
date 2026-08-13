import { z } from "zod";

export const foodAnalysisSchema = z.object({
  detectedFoods: z.array(z.string()).max(8),
  macroEstimates: z.object({
    protein: z.string(),
    carbohydrates: z.string(),
    fats: z.string(),
    fibre: z.string(),
  }),
  micronutrientHighlights: z.array(z.object({
    nutrient: z.string(),
    observation: z.string(),
  })).max(5),
  phaseSpecificSuggestions: z.array(z.string()).min(1).max(4),
  confidence: z.enum(["low", "medium", "high"]),
  limitations: z.string(),
  safetyNote: z.string(),
});

export const visionOutputSchema = {
  type: "object",
  properties: {
    detectedFoods: { type: "array", items: { type: "string" }, maxItems: 8 },
    macroEstimates: {
      type: "object",
      properties: {
        protein: { type: "string" },
        carbohydrates: { type: "string" },
        fats: { type: "string" },
        fibre: { type: "string" },
      },
      required: ["protein", "carbohydrates", "fats", "fibre"],
      additionalProperties: false,
    },
    micronutrientHighlights: {
      type: "array",
      items: {
        type: "object",
        properties: { nutrient: { type: "string" }, observation: { type: "string" } },
        required: ["nutrient", "observation"],
        additionalProperties: false,
      },
      maxItems: 5,
    },
    phaseSpecificSuggestions: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    limitations: { type: "string" },
    safetyNote: { type: "string" },
  },
  required: ["detectedFoods", "macroEstimates", "micronutrientHighlights", "phaseSpecificSuggestions", "confidence", "limitations", "safetyNote"],
  additionalProperties: false,
} as const;
