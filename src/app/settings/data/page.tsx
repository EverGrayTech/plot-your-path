import React from "react";

import { DataManagementPanel } from "../../../components/DataManagementPanel";

export default function YourDataPage() {
  return (
    <>
      <header className="page-header">
        <h1>Your Data</h1>
      </header>
      <p className="page-description">Back up, restore, or reset your browser-local workspace.</p>

      <DataManagementPanel />
    </>
  );
}
