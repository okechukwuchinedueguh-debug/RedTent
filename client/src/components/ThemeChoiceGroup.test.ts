import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import ThemeChoiceGroup from "./ThemeChoiceGroup";

describe("ThemeChoiceGroup", () => {
  it.each(["light", "dark", "auto"] as const)("marks %s as the selected theme control", preference => {
    const markup = renderToStaticMarkup(createElement(ThemeChoiceGroup, { preference, resolvedTheme: preference === "auto" ? "dark" : preference, onPreferenceChange: () => undefined }));
    expect(markup.match(/aria-pressed="true"/g)).toHaveLength(1);
    const selectedButton = markup.match(/<button[^>]*aria-pressed="true"[^>]*>(.*?)<\/button>/)?.[1];
    expect(selectedButton).toContain(`${preference[0].toUpperCase()}${preference.slice(1)}`);
    expect(markup).toContain("Currently using");
  });
});
