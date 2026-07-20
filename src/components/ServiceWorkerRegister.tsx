"use client";

import { useEffect } from "react";

// Registers the offline-fallback service worker (see public/sw.js) — split
// into its own component so the registration effect doesn't clutter the
// root layout, and so it only ever runs client-side.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed", err);
      });
    }
  }, []);

  return null;
}
