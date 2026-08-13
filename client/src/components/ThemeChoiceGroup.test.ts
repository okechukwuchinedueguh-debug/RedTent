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

  it("sends the selected preference when each rendered control is activated", () => {
    const selected: string[] = [];
    const tree = ThemeChoiceGroup({ preference: "light", resolvedTheme: "light", onPreferenceChange: value => selected.push(value) }) as unknown as { props: { children: Array<{ props: { children: Array<{ props: { onClick: () => void } }> } }> } };
    const buttons = tree.props.children[0].props.children;
    buttons[0].props.onClick();
    buttons[1].props.onClick();
    buttons[2].props.onClick();
    expect(selected).toEqual(["light", "dark", "auto"]);
  });
});
