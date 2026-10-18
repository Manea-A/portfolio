"use client";

import { useEffect, useRef } from "react";

/*
 * "Complexity to clarity" behind the hero. Forty-odd threads cross the hero
 * from left to right. On the left each one wanders and loops through a
 * slowly shifting curl-noise field (complexity); as it travels right the
 * swirl lets go and the thread eases into its own evenly spaced lane
 * (clarity). Small pulses run along the threads like data moving through a
 * system, and the pointer twists whatever it passes over.
 *
 * Pauses off-screen and in background tabs; reduced motion gets one still
 * frame of the same picture.
 */

const THREADS = 42;
const STEP = 7; // px per integration step along a thread
const MAX_STEPS = 420;

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

export default function ClarityField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let muted = "#5c5d65";
    let accent = "#2b55c9";
    let raf = 0;
    let visible = true;
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };
    // each thread: where it enters, and a phase for its pulse
    const seeds = Array.from({ length: THREADS }, (_, i) => ({
      y: (i + Math.random()) / THREADS,
      phase: Math.random(),
      speed: 0.6 + Math.random() * 0.6,
    }));
    const pts = new Float32Array(MAX_STEPS * 2);

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      muted = cs.getPropertyValue("--muted").trim() || muted;
      accent = cs.getPropertyValue("--accent").trim() || accent;
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

    // trace one thread through the field; returns the number of points
    const trace = (entry: number, lane: number, t: number) => {
      let x = -20;
      let y = entry * h;
      const laneY = h * (0.1 + 0.8 * ((lane + 0.5) / THREADS));
      let n = 0;
      for (; n < MAX_STEPS && x < w + 20; n++) {
        pts[n * 2] = x;
        pts[n * 2 + 1] = y;
        // 1 = tangled, 0 = resolved
        const chaos = 1 - smooth(w * 0.16, w * 0.6, x);
        // curl noise from a moving stream function: swirls without clumping
        const k1 = 0.0058;
        const k2 = 0.0069;
        const k3 = 0.0037;
        const s1 = x * k1 + t;
        const s2 = y * k2 - t * 0.8;
        const s3 = (x * 0.7 - y) * k3 + t * 1.3;
        let vx = (-k2 * Math.sin(s1) * Math.sin(s2) - 0.6 * k3 * Math.cos(s3)) * 300;
        let vy = -(k1 * Math.cos(s1) * Math.cos(s2) + 0.42 * k3 * Math.cos(s3)) * 300;
        vx = vx * chaos + 0.85 + (1 - chaos) * 1.2;
        vy = vy * chaos + Math.max(-1, Math.min(1, (laneY - y) * 0.035)) * (1 - chaos);
        // the pointer twists what it passes
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          const f = (1 - d2 / 22000) * 1.6;
          vx += (-dy / 70) * f;
          vy += (dx / 70) * f;
        }
        const len = Math.hypot(vx, vy) || 1;
        x += (vx / len) * STEP;
        y += (vy / len) * STEP;
      }
      return n;
    };

    // lanes are handed out in entry order so threads never cross on the right
    const order = seeds.map((s, i) => [s.y, i] as const).sort((a, b) => a[0] - b[0]);

    const draw = (time: number) => {
      const t = time * 0.00012;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, muted);
      grad.addColorStop(0.35, muted);
      grad.addColorStop(0.75, accent);
      ctx.lineJoin = "round";
      ctx.strokeStyle = grad;

      order.forEach(([entry, i], lane) => {
        const seed = seeds[i];
        const n = trace(entry, lane, t + i * 0.013);
        ctx.globalAlpha = 0.26;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let k = 1; k < n; k++) ctx.lineTo(pts[k * 2], pts[k * 2 + 1]);
        ctx.stroke();

        // a short pulse travelling along the thread
        if (!reduced && n > 1) {
          const head = Math.floor(((time * 0.00006 * seed.speed + seed.phase) % 1) * (n - 1));
          const tail = Math.max(0, head - 12);
          ctx.globalAlpha = 0.85;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pts[tail * 2], pts[tail * 2 + 1]);
          for (let k = tail + 1; k <= head; k++) ctx.lineTo(pts[k * 2], pts[k * 2 + 1]);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduced && visible && !document.hidden && !raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readColors();
    resize();
    draw(0);
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColors();
      if (!raf) draw(performance.now());
    };
    const host = canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - r.left;
      pointer.ty = e.clientY - r.top;
      if (pointer.x < -1e3) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onLeave = () => {
      pointer.tx = pointer.ty = pointer.x = pointer.y = -1e4;
    };
    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onScheme);
    window.addEventListener("themechange", onScheme);
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
      window.removeEventListener("themechange", onScheme);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="clarity-field pointer-events-none absolute inset-0 h-full w-full" />;
}
