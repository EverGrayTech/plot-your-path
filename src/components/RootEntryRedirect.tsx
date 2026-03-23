"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const OVERVIEW_DISMISSED_KEY = "pyp-home-overview-dismissed";

export function RootEntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    const storedValue = window.localStorage.getItem(OVERVIEW_DISMISSED_KEY);

    router.replace(storedValue === "true" ? "/roles" : "/introduction");
  }, [router]);

  return null;
}
