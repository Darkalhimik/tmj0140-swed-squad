"use client";

import { ExternalLink, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const FRAME_W = 1280;
const FRAME_H = 800;

/**
 * The concept screen, live and clickable, scaled into the column.
 * It only loads on request so the page stays light with five previews.
 */
export function LivePreview({ route, label }: { route: string; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry!.contentRect.width / FRAME_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-line bg-canvas px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-surface px-3 py-0.5 text-center font-mono text-[11px] text-ink-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
          concept{route.split("?")[0]}
        </span>
        <Link href={route} className="inline-flex items-center gap-1 text-[12px] font-medium text-teal hover:underline" target="_blank">
          Open
          <ExternalLink className="size-3" />
        </Link>
      </div>
      <div ref={box} className="relative w-full" style={{ height: FRAME_H * scale }}>
        {on ? (
          <iframe
            src={route}
            title={`Concept: ${label}`}
            className="absolute top-0 left-0 origin-top-left border-0"
            style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(135deg,var(--color-canvas)_0_12px,var(--color-subtle)_12px_24px)]">
            <p className="text-sm font-medium text-ink">{label}</p>
            <Button variant="primary" leading={<Play className="size-4" />} onClick={() => setOn(true)}>
              Show the live screen
            </Button>
            <p className="text-[12px] text-ink-3">It&apos;s the real prototype — you can click through it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
