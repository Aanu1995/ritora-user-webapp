"use client";

import { useLayoutEffect } from "react";

/**
 * Forces the marketing landing page to render in light mode regardless of
 * the user's system preference. Cleans up when the component unmounts so
 * the rest of the app (dashboard, etc.) follows the user's preference again.
 *
 * Pair this with the inline pre-paint script in page.tsx to avoid a dark→
 * light flash on first load.
 */
export function LandingThemeLock() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "light");
    return () => {
      if (previous) {
        root.setAttribute("data-theme", previous);
      } else {
        root.removeAttribute("data-theme");
      }
    };
  }, []);

  return null;
}
