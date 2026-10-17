"use client";

import { useEffect, useRef } from "react";

const LINES = 26;
const STEP = 14; // px between samples along a line

/**
 * Flowing silk lines behind the hero: a field of stacked waves drawn on a
 * canvas in the accent colour, bending away from the pointer. Pauses when
 * off-screen or in a background tab; with reduced motion it draws one still
 * frame. Purely decorative — the hero reads the same without it.
 */
export default function HeroWaves() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let color = "#2b55c9";
    let raf = 0;
    let visible = true;
    // pointer in canvas px, eased toward its target so the bend glides
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const readColor = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || color;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      for (let i = 0; i < LINES; i++) {
        const k = i / (LINES - 1);
        const base = h * (0.18 + k * 0.78);
        const amp = 18 + 34 * Math.sin(k * Math.PI);
        const phase = i * 0.22;
        // brightest through the middle of the band, fading at the edges
        ctx.globalAlpha = 0.12 + 0.38 * Math.sin(k * Math.PI);
        ctx.beginPath();
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          let y =
            base +
            Math.sin(x * 0.0042 + t * 0.00035 + phase) * amp +
            Math.sin(x * 0.0091 - t * 0.0005 + phase * 1.7) * amp * 0.35;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 48000) y += (dy >= 0 ? 1 : -1) * 38 * (1 - d2 / 48000);
          if (x === -STEP) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduced && visible && !document.hidden && !raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readColor();
    resize();
    draw(4000);
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) draw(4000);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColor();
      if (!raf) draw(4000);
    };
    // the canvas sits under the content, so listen on the hero section
    const host = canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - r.left;
      pointer.ty = e.clientY - r.top;
      if (pointer.x < -999) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onLeave = () => {
      pointer.tx = pointer.ty = -9999;
    };

    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onScheme);
    if (!reduced) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", onScheme);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="hero-waves pointer-events-none absolute inset-0 h-full w-full" />;
}
