import Link from "next/link";
import React, { type ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            margin: "0 auto",
            maxWidth: 760,
            padding: "2rem 1rem",
            fontFamily: "sans-serif",
          }}
        >
          <nav
            aria-label="Primary"
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Link href="/jobs">Jobs</Link>
            <Link href="/skills">Skills</Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
