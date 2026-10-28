"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export function useEscape(active: boolean, onEscape: () => void) {
  const cb = useRef(onEscape);
  useEffect(() => {
    cb.current = onEscape;
  });
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
}

// Shared across stacked overlays, so closing one dialog never unlocks the page
// while another is still open, and closing both in one render always unlocks.
let lockCount = 0;

export function useBodyLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = "";
    };
  }, [active]);
}

/**
 * Next.js keeps visited pages alive with <Activity>. Transient overlays should
 * close when their page is hidden, so returning to it doesn't reopen them.
 */
export function useCloseOnHide(open: boolean, close: () => void) {
  const state = useRef({ open, close });
  const mounted = useRef(false);
  useLayoutEffect(() => {
    state.current = { open, close };
  });
  useLayoutEffect(() => {
    const s = state;
    const m = mounted;
    m.current = true;
    return () => {
      m.current = false;
      if (!s.current.open) return;
      const fn = s.current.close;
      // Strict Mode disconnects and reconnects effects in the same commit;
      // only close if the component is still hidden afterwards.
      queueMicrotask(() => {
        if (!m.current) fn();
      });
    };
  }, []);
}

export function useOutsideClick(ref: RefObject<HTMLElement | null>, active: boolean, onOutside: () => void) {
  const cb = useRef(onOutside);
  useEffect(() => {
    cb.current = onOutside;
  });
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [active, ref]);
}
