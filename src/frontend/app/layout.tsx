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
          {children}
        </main>
      </body>
    </html>
  );
}
