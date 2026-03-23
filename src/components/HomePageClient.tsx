"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const OVERVIEW_DISMISSED_KEY = "pyp-home-overview-dismissed";

export function HomePageClient() {
  const router = useRouter();

  const dismissOverview = () => {
    window.localStorage.setItem(OVERVIEW_DISMISSED_KEY, "true");
    router.push("/roles");
  };

  return (
    <div className="home-hero-dismiss">
      <button className="btn btn-secondary btn-compact" onClick={dismissOverview} type="button">
        Dismiss Introduction
      </button>
    </div>
  );
}
