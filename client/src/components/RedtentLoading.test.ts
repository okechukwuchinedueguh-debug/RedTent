import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RedtentLoading } from "./RedtentLoading";

describe("RedtentLoading", () => {
  it("starts from the R mark and reveals the remaining Redtent letters", () => {
    const markup = renderToStaticMarkup(createElement(RedtentLoading));
    expect(markup).toContain("redtent-loader__lead");
    expect(markup).toContain("redtent-loader__tail");
    expect(markup.match(/redtent-loader__letter/g)).toHaveLength(6);
    expect(markup).toContain("Making space for your story");
  });
});
