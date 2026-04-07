"use client";

import "@evergraytech/ai-config/styles/base.css";

import React from "react";

function joinSummaryParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ");
}

export function DesirabilitySettingsSurface({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label="Desirability factor settings"
      className="eg-ai-config-settings-surface"
      data-eg-ai-config-surface="true"
      data-eg-ai-config-framed="true"
    >
      <header className="eg-ai-config-settings-header" data-eg-ai-config-section="settings-header">
        <h2 className="eg-ai-config-settings-title">{title}</h2>
        <p className="eg-ai-config-settings-description">{description}</p>
      </header>
      <section
        aria-label="Desirability configuration panel"
        className="eg-ai-config-panel"
        data-eg-ai-config-panel="true"
        data-eg-ai-config-framed="false"
      >
        {children}
      </section>
    </section>
  );
}

export function DesirabilitySettingsError({ message }: { message: string }) {
  return (
    <section className="eg-ai-config-setup-required" aria-label="Desirability factor error">
      <div className="eg-ai-config-setup-required-copy">
        <h2 className="eg-ai-config-setup-required-title">Factor settings could not be loaded</h2>
        <p className="eg-ai-config-setup-required-description">{message}</p>
      </div>
    </section>
  );
}

export function DesirabilityField({
  label,
  field,
  children,
}: {
  label: string;
  field: string;
  children: React.ReactNode;
}) {
  const control = React.Children.only(children);

  return (
    <label className="eg-ai-config-field" data-eg-ai-config-field={field}>
      {label}
      {control}
    </label>
  );
}

export function DesirabilitySection({
  title,
  description,
  enabled,
  onToggleEnabled,
  open,
  children,
  sectionType,
}: {
  title: string;
  description?: string;
  enabled?: boolean;
  onToggleEnabled?: (checked: boolean) => void;
  open?: boolean;
  children: React.ReactNode;
  sectionType: string;
}) {
  return (
    <details
      className="eg-ai-config-section eg-ai-config-route-section"
      data-eg-ai-config-section={sectionType}
      open={open}
    >
      <summary className="eg-ai-config-route-summary">
        <span className="eg-ai-config-route-summary-copy">
          <span className="eg-ai-config-route-summary-title">{title}</span>
          {description ? (
            <>
              <span className="eg-ai-config-route-summary-separator">—</span>
              <span className="eg-ai-config-route-summary-description">{description}</span>
            </>
          ) : null}
        </span>
        {onToggleEnabled ? (
          <label className="eg-ai-config-choice eg-ai-config-route-toggle">
            <input
              aria-label="Enable factor"
              checked={enabled ?? false}
              onChange={(event) => onToggleEnabled(event.target.checked)}
              onClick={(event) => event.stopPropagation()}
              type="checkbox"
            />
            Enabled
          </label>
        ) : null}
      </summary>
      {children}
    </details>
  );
}

export function createFactorSummary(weight: number, _isActive: boolean, prompt: string) {
  return joinSummaryParts([
    `Weight ${Number.isFinite(weight) ? weight.toFixed(2) : "0.00"}`,
    prompt.trim().replace(/\s+/g, " ") || "No prompt configured.",
  ]);
}
