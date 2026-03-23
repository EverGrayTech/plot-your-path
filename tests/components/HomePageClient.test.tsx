import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";

import { HomePageClient } from "../../src/components/HomePageClient";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

describe("HomePageClient", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockReset();
  });

  it("renders the dismiss action for first-time visitors", async () => {
    render(<HomePageClient />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Dismiss Introduction/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole("link", { name: /Help/i })).not.toBeInTheDocument();
  });

  it("stores the dismissal preference and redirects to roles", async () => {
    render(<HomePageClient />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Dismiss Introduction/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Dismiss Introduction/i }));

    expect(window.localStorage.getItem("pyp-home-overview-dismissed")).toBe("true");
    expect(mockPush).toHaveBeenCalledWith("/roles");
  });

  it("still renders the introduction controls even when dismissal was previously set", async () => {
    window.localStorage.setItem("pyp-home-overview-dismissed", "true");

    render(<HomePageClient />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Dismiss Introduction/i })).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
