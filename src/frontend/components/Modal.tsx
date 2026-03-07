"use client";

import React, { type ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
}

export function Modal({ children, onClose, title }: ModalProps) {
  return (
    <dialog
      aria-modal="true"
      open
      style={{
        background: "rgba(0, 0, 0, 0.45)",
        border: "none",
        inset: 0,
        margin: 0,
        padding: "2rem 1rem",
        position: "fixed",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          margin: "0 auto",
          maxHeight: "90vh",
          maxWidth: 760,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        <header
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} type="button">
            Close
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
