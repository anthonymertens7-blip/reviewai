"use client";

import { useEffect, useState } from "react";

// Combine la préférence explicite de l'app (réglage Accessibilité, data-reduce-motion sur <html>)
// et la préférence système, pour les animations pilotées en JS (ex: incrémentation de chiffre) que
// la règle CSS globale [data-reduce-motion="true"] (voir globals.css) ne peut pas neutraliser
// elle-même — celle-ci ne coupe que les transitions/animations CSS.
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => {
      setReduced(mql.matches || document.documentElement.getAttribute("data-reduce-motion") === "true");
    };
    check();

    mql.addEventListener("change", check);
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduce-motion"] });

    return () => {
      mql.removeEventListener("change", check);
      observer.disconnect();
    };
  }, []);

  return reduced;
}
