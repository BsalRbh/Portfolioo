"use client";
import { useEffect, useRef } from "react";

/** Closes the parent <details> menu on outside click/tap or Escape. */
export function SwitcherDismiss() {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const details = ref.current?.closest("details");
    if (!details) return;

    const onPointer = (e: PointerEvent) => {
      if (details.open && !details.contains(e.target as Node)) details.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && details.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return <span ref={ref} hidden />;
}
