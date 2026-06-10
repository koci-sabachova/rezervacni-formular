"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileOnload";

let scriptLoaded = false;
const onloadQueue: Array<() => void> = [];

function loadScript() {
  if (scriptLoaded) return;
  if (typeof window === "undefined") return;
  if (document.querySelector(`script[src^="${SCRIPT_SRC.split("?")[0]}"]`)) {
    scriptLoaded = true;
    return;
  }
  (window as unknown as { __turnstileOnload: () => void }).__turnstileOnload =
    () => {
      scriptLoaded = true;
      while (onloadQueue.length) {
        const fn = onloadQueue.shift();
        fn?.();
      }
    };
  const s = document.createElement("script");
  s.src = SCRIPT_SRC;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

export function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    loadScript();
    const render = () => {
      if (!containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "error-callback": () => onToken(""),
        "expired-callback": () => onToken(""),
        theme: "dark",
      });
    };
    if (window.turnstile) {
      render();
    } else {
      onloadQueue.push(render);
    }
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;
  return (
    <div className="surface-muted">
      <div ref={containerRef} />
    </div>
  );
}
