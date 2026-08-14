// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

const { success } = vi.hoisted(() => ({ success: vi.fn() }));

vi.mock("sonner", () => ({ toast: { success } }));

import { ThemeProvider, useTheme } from "./ThemeContext";

function AppearanceActions() {
  const { setThemePreference, setAccentIntensity, highContrast, setHighContrast } = useTheme();
  return <div>
    <button onClick={() => setThemePreference("dark")}>Use dark</button>
    <button onClick={() => setAccentIntensity("bold")}>Use bold</button>
    <button onClick={() => setHighContrast(!highContrast)}>Toggle high contrast</button>
  </div>;
}

beforeEach(() => {
  window.localStorage.clear();
  success.mockClear();
});

it("confirms each changed appearance preference without announcing unchanged selections", async () => {
  const user = userEvent.setup();
  render(<ThemeProvider><AppearanceActions /></ThemeProvider>);

  await user.click(screen.getByRole("button", { name: "Use dark" }));
  await user.click(screen.getByRole("button", { name: "Use bold" }));
  await user.click(screen.getByRole("button", { name: "Toggle high contrast" }));

  expect(success).toHaveBeenNthCalledWith(1, "Appearance updated: Dark mode.");
  expect(success).toHaveBeenNthCalledWith(2, "Appearance updated: Bold accents.");
  expect(success).toHaveBeenNthCalledWith(3, "Appearance updated: High contrast on.");

  await user.click(screen.getByRole("button", { name: "Use dark" }));
  expect(success).toHaveBeenCalledTimes(3);
});
