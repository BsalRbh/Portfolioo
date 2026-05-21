"use client";
import { useEffect, useRef, useState } from "react";

type Props = { value: string };

/**
 * Renders the leading number of a section index (e.g. "03 / 08") and animates
 * it from 0 up to the target the first time the label enters the viewport.
 * The total ("/ 08") is left untouched.
 */
export function SectionIdx({ value }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const match = value.match(/^(\d+)\s*\/\s*(.+)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const total = match ? match[2] : value;
  const [current, setCurrent] = useState(target);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || playedRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || playedRef.current) continue;
          playedRef.current = true;
          // Animate from 0 → target, ticking ~80ms per step, then overshoot by 1 and settle.
          let n = 0;
          setCurrent(0);
          const id = setInterval(() => {
            n += 1;
            if (n < target) setCurrent(n);
            else if (n === target) setCurrent(target + 1);
            else {
              setCurrent(target);
              clearInterval(id);
            }
          }, 70);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span ref={ref} className="idx">
      {pad(current)} / {total}
    </span>
  );
}
