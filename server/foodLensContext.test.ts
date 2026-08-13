import { describe, expect, it } from "vitest";
import { foodLensContextCopy, foodLensContexts } from "./foodLensContext";

describe("Food Lens capture contexts", () => {
  it("supports every approved capture context with a specific safety instruction", () => {
    expect(foodLensContexts).toEqual(["meal", "grocery", "menu", "label", "recipe", "shelf"]);
    foodLensContexts.forEach(context => {
      expect(foodLensContextCopy[context].label).toBeTruthy();
      expect(foodLensContextCopy[context].assistantInstruction).toMatch(/only|legible|visible/i);
    });
  });

  it("does not treat a label or menu as verified nutrition data", () => {
    expect(foodLensContextCopy.label.assistantInstruction).toContain("Do not invent");
    expect(foodLensContextCopy.menu.assistantInstruction).toContain("without assuming");
  });
});
