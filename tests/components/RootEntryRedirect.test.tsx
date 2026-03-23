import { render, waitFor } from "@testing-library/react";

import { RootEntryRedirect } from "../../src/components/RootEntryRedirect";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("RootEntryRedirect", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockReplace.mockReset();
  });

  it("redirects to introduction when no dismissal preference is stored", async () => {
    render(<RootEntryRedirect />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/introduction");
    });
  });

  it("redirects to roles when the introduction was dismissed", async () => {
    window.localStorage.setItem("pyp-home-overview-dismissed", "true");

    render(<RootEntryRedirect />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/roles");
    });
  });
});
