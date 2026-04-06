import React from "react";

export default function DesirabilityFactorsPage() {
  return (
    <>
      <header className="page-header">
        <h1>Desirability Factors</h1>
      </header>
      <p className="page-description">
        Configure the factors, prompts, and weights used to score role desirability.
      </p>
      <section className="card" aria-label="Desirability factor settings">
        <div className="structured-message structured-message-info">
          <h3>Settings relocation in progress</h3>
          <p>
            Desirability factor management is being promoted from the roles workflow into this
            dedicated settings section.
          </p>
          <p>
            For now, continue using the existing factor controls from the Roles experience until the
            full page-level editor is cut over.
          </p>
        </div>
      </section>
    </>
  );
}
