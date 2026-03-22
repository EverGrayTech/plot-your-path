import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";

import { AppShell } from "../../../src/components/shell/AppShell";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("@evergraytech/design-system", () => ({
  EverGrayTechLogo: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="evergray-tech-logo" {...props} />,
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

describe("AppShell", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/roles/detail");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders navigation and marks active routes", () => {
    render(
      <AppShell>
        <div>Main content</div>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Plot Your Path home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "EverGray Tech company site" })).toHaveAttribute(
      "href",
      "https://evergraytech.com",
    );
    expect(screen.getByTestId("evergray-tech-logo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Roles" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("toggles the sidenav from the menu button and closes on overlay click", () => {
    render(
      <AppShell>
        <div>Main content</div>
      </AppShell>,
    );

    const toggle = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Close navigation" })).toBeInTheDocument();

    const overlay = document.querySelector(".sidenav-overlay") as HTMLElement;
    fireEvent.click(overlay);

    expect(screen.getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
  });

  it("closes the sidenav when a nav link is clicked", () => {
    render(
      <AppShell>
        <div>Main content</div>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.click(screen.getByRole("link", { name: "Skills" }));

    expect(screen.getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
  });
});
