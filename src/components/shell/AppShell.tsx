"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { type ReactNode, useCallback, useState } from "react";

interface NavItem {
  href: string;
  label: string;
}

const primaryNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/roles", label: "Roles" },
  { href: "/skills", label: "Skills" },
];

const utilityNav: NavItem[] = [{ href: "/settings", label: "Settings" }];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidenavOpen, setSidenavOpen] = useState(false);

  const closeSidenav = useCallback(() => setSidenavOpen(false), []);
  const toggleSidenav = useCallback(() => setSidenavOpen((prev) => !prev), []);

  return (
    <div className="shell">
      {/* Top App Bar */}
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
          <button
            aria-label={sidenavOpen ? "Close navigation" : "Open navigation"}
            className="topbar-toggle"
            onClick={toggleSidenav}
            type="button"
          >
            ☰
          </button>
          <Link className="topbar-identity" href="/">
            Plot Your Path
          </Link>
        </div>
        <div className="topbar-actions">{/* Tier 2 utility controls can go here */}</div>
      </header>

      {/* Mobile overlay */}
      <div
        aria-hidden="true"
        className={`sidenav-overlay${sidenavOpen ? " sidenav-overlay--visible" : ""}`}
        onClick={closeSidenav}
        onKeyDown={closeSidenav}
        role="presentation"
      />

      {/* Side Navigation */}
      <nav aria-label="Primary" className={`sidenav${sidenavOpen ? " sidenav--open" : ""}`}>
        <div className="sidenav-primary">
          {primaryNav.map((item) => (
            <Link
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="sidenav-link"
              href={item.href}
              key={item.href}
              onClick={closeSidenav}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="sidenav-utility">
          {utilityNav.map((item) => (
            <Link
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="sidenav-link sidenav-link--utility"
              href={item.href}
              key={item.href}
              onClick={closeSidenav}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Workspace Container */}
      <main className="workspace">{children}</main>
    </div>
  );
}
