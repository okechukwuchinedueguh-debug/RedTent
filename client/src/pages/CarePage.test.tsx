import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("wouter", () => ({ useLocation: () => ["/care", vi.fn()] }));
vi.mock("sonner", () => ({ toast: { message: vi.fn() } }));

import CarePage from "./CarePage";

it("presents care navigation without unverified listings, booking, or diagnostic claims", () => {
  const markup = renderToStaticMarkup(<CarePage />);

  expect(markup).toContain("Find care, when a next step feels useful.");
  expect(markup).toContain("Understand your body. Connect with care.");
  expect(markup).toContain("locally verified partners");
  expect(markup).toContain("Doctors");
  expect(markup).toContain("Pharmacy &amp; labs");
  expect(markup).toContain("The Redtent health journey");
  expect(markup).toContain("Menstruation");
  expect(markup).toContain("Menopause");
  expect(markup).toContain("Care navigation is not medical advice.");
  expect(markup).not.toContain("Book now");
});
