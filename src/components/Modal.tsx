"use client";

import React, { type ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
}

export function Modal({ children, onClose, title }: ModalProps) {
  return (
    <dialog aria-modal="true" className="modal-backdrop" open>
      <div className="modal-surface">
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-secondary btn-compact" onClick={onClose} type="button">
            Close
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
