import React from "react";

import { redirect } from "next/navigation";

import CapturePage from "../../../src/frontend/app/page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("CapturePage", () => {
  it("redirects root route to /jobs", () => {
    CapturePage();

    expect(redirect).toHaveBeenCalledWith("/jobs");
  });
});
