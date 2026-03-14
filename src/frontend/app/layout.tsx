import Link from "next/link";
import React, { type ReactNode } from "react";

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="app-shell">
          <nav aria-label="Primary" className="app-nav">
            <Link href="/jobs">Jobs</Link>
            <Link href="/skills">Skills</Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
