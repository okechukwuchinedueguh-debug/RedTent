export const foodLensContexts = ["meal", "grocery", "menu", "label", "recipe", "shelf"] as const;
export type FoodLensContext = (typeof foodLensContexts)[number];

export const foodLensContextCopy: Record<FoodLensContext, { label: string; detail: string; assistantInstruction: string }> = {
  meal: { label: "Meal", detail: "A plate, bowl, or snack", assistantInstruction: "Identify only food visibly present in a meal or snack." },
  grocery: { label: "Grocery", detail: "A packaged or fresh grocery item", assistantInstruction: "Identify only a visibly supported grocery item and invite the user to confirm products or ingredients." },
  menu: { label: "Menu", detail: "A restaurant or takeaway menu", assistantInstruction: "Read only legible visible menu text and offer general comparison ideas without assuming preparation or portions." },
  label: { label: "Label", detail: "A package nutrition or ingredient label", assistantInstruction: "Read only legible visible package text. Do not invent unreadable label values, ingredients, or portions." },
  recipe: { label: "Recipe", detail: "A written recipe or ingredient list", assistantInstruction: "Use only visibly legible recipe or ingredient information and clarify when preparation details are missing." },
  shelf: { label: "Shelf", detail: "Several food options on a shelf", assistantInstruction: "Describe only clearly visible food options and avoid assumptions about stock, price, ingredient lists, or suitability." },
};
