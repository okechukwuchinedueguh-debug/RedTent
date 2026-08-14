import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

const { setAccentIntensity, setHighContrast } = vi.hoisted(() => ({ setAccentIntensity: vi.fn(), setHighContrast: vi.fn() }));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ accentIntensity: "balanced", setAccentIntensity, highContrast: false, setHighContrast }),
}));

import { AppearancePersonalization } from "./AppearancePersonalization";

it("renders the saved visual-emphasis and high-contrast choices", () => {
  const markup = renderToStaticMarkup(<AppearancePersonalization />);

  expect(markup).toContain("Gentle");
  expect(markup).toContain("Balanced");
  expect(markup).toContain("Bold");
  expect(markup).toContain("High contrast");
  expect(markup).toContain('aria-checked="false"');
  expect(setAccentIntensity).not.toHaveBeenCalled();
  expect(setHighContrast).not.toHaveBeenCalled();
});
