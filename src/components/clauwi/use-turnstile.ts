"use client";

import { useEffect, useRef } from "react";
import { TURNSTILE_SITEKEY } from "@/lib/clauwi/turnstile-sitekey";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; action?: string }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

/**
 * Renders a Cloudflare Turnstile widget into the returned container ref.
 * The page must load https://challenges.cloudflare.com/turnstile/v0/api.js.
 *
 * Turnstile's implicit `data-sitekey` auto-render only scans the DOM once,
 * when its script first loads — it never picks up a form that mounts later
 * (client-side navigation, the course @modal overlay). So render explicitly
 * every time the component mounts, polling briefly in case the script
 * (loaded lazily) isn't ready yet.
 */
export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const render = () => {
      if (cancelled || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile?.render(containerRef.current, {
        sitekey: TURNSTILE_SITEKEY,
        action: "turnstile-spin-v1",
      });
    };

    if (window.turnstile) {
      render();
    } else {
      interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          render();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      // Reset the ref (not just remove the widget) so a remount — e.g. React
      // Strict Mode's dev-only double-invoke, or the form mounting again
      // later — re-renders instead of seeing a stale id and skipping.
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
    };
  }, []);

  /** Get a fresh token after a failed attempt consumed the previous one. */
  const reset = () => window.turnstile?.reset(widgetIdRef.current);

  return { containerRef, reset };
}
