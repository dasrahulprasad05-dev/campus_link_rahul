'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ────────────────────────────────────────────
   useScrollAnimation – Intersection Observer
   reveals elements when they enter the viewport
   ──────────────────────────────────────────── */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // only animate once
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ────────────────────────────────────────────
   useCountUp – Animated number counting
   Counts from 0 to target on visibility trigger
   ──────────────────────────────────────────── */
export function useCountUp(
  target: number,
  isVisible: boolean,
  duration: number = 1800
) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isVisible || hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, target, duration]);

  return count;
}

/* ────────────────────────────────────────────
   parseNumericValue – Extract number + suffix
   e.g. "842+" → { num: 842, suffix: "+" }
   e.g. "78%"  → { num: 78,  suffix: "%" }
   e.g. "126"  → { num: 126, suffix: "" }
   ──────────────────────────────────────────── */
export function parseNumericValue(val: string): { num: number; suffix: string } {
  const match = val.match(/^([\d.]+)(.*)$/);
  if (match) {
    return { num: parseFloat(match[1]), suffix: match[2] };
  }
  return { num: 0, suffix: val };
}
