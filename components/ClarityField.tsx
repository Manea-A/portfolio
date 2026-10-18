"use client";

import { useEffect, useRef } from "react";

/*
 * "Complexity to clarity", drawn on one fixed canvas behind the home page.
 *
 * In the hero, threads enter on the left and wander through two layers of
 * curl noise, each on its own path, so they cross and knot (complexity).
 * Moving right the turbulence eases off and every thread settles into its
 * own evenly spaced lane (clarity).
 *
 * On wide screens the lanes then bend down, like a highway interchange,
 * into a tidy bundle of rails in the page margin. The rails run the length
 * of the page and switch sides at each section with a smooth S-curve, so
 * scrolling feels like following the system down. Scrolling also speeds up
 * the pulses travelling along the rails.
 *
 * Narrow screens keep the hero part only. Reduced motion redraws on scroll
 * without animating.
 */

const THREADS = 42;
const STEP = 7; // px per integration step in the hero
const MAX_STEPS = 520;
const CONTENT = 1152; // max-w-6xl
const TURN = 170; // px a lane takes to bend from horizontal to vertical
const CROSS = 300; // px a rail takes to cross to the other side

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export default function ClarityField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = 0;
    let vh = 0;
    let muted = "#5c5d65";
    let mutedSoft = "rgba(92,93,101,.5)";
    let accent = "#2b55c9";
    let raf = 0;
    let frame = 0;

    // layout, in document coordinates
    let heroTop = 0;
    let heroH = 0;
    let docH = 0;
    let sectionTops: number[] = [];
    let rail = false;
    let railRight = 0;
    let railLeft = 0;
    let gap = 2.4;

    let scrollY = window.scrollY;
    let pulseShift = 0; // extra pulse travel earned by scrolling
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };

    const seeds = Array.from({ length: THREADS }, (_, i) => ({
      y: (i + Math.random()) / THREADS,
      phase: Math.random(),
      speed: 0.6 + Math.random() * 0.7,
      wobble: Math.random() * 10,
    }));
    // lanes are handed out in entry order so threads never cross once resolved
    const order = seeds.map((s, i) => [s.y, i] as const).sort((a, b) => a[0] - b[0]);
    const pts = new Float32Array((MAX_STEPS + 24) * 2);

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      muted = cs.getPropertyValue("--muted").trim() || muted;
      accent = cs.getPropertyValue("--accent").trim() || accent;
      ctx.fillStyle = muted;
      const hex = ctx.fillStyle;
      const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
      mutedSoft = `rgba(${r},${g},${b},0.45)`;
    };

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scrollY = window.scrollY;
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const hr = hero?.getBoundingClientRect();
      heroTop = (hr?.top ?? 0) + scrollY;
      heroH = hr?.height ?? vh;
      docH = document.documentElement.scrollHeight;
      sectionTops = [...document.querySelectorAll<HTMLElement>("main > section")]
        .slice(1)
        .map((s) => s.getBoundingClientRect().top + scrollY);

      const margin = (vw - CONTENT) / 2;
      rail = margin >= 96;
      gap = Math.min(2.4, (margin - 36) / THREADS);
      railRight = vw - margin / 2;
      railLeft = margin / 2;
    };

    // which side the rails sit on below the hero: right, then alternate
    // from the work section on, crossing over around each section's top
    const railX = (y: number) => {
      let x = railRight;
      sectionTops.forEach((top, k) => {
        const side = k < 2 ? railRight : k % 2 === 0 ? railLeft : railRight;
        x += (side - x) * smooth(top - CROSS / 2, top + CROSS / 2, y);
      });
      return x;
    };
    const laneOffset = (lane: number) => ((THREADS - 1) / 2 - lane) * gap;
    // a point on a rail, offset perpendicular to the bundle's direction so the
    // lines keep their spacing through a crossing instead of bunching up
    const railPoint = (y: number, off: number): [number, number] => {
      const dxdy = (railX(y + 1) - railX(y - 1)) / 2;
      const len = Math.hypot(dxdy, 1);
      return [railX(y) + off / len, y - (off * dxdy) / len];
    };

    // Trace one hero thread in document coordinates. Returns its point count.
    const trace = (entry: number, lane: number, t: number, wobble: number) => {
      const h = heroH;
      let x = -20;
      let y = entry * h;
      const laneY = h * (0.1 + 0.8 * ((lane + 0.5) / THREADS));
      const endX = rail ? railRight - 90 - (THREADS - lane) * 2.2 : vw + 20;
      const px = pointer.x;
      const py = pointer.y + scrollY - heroTop;
      let n = 0;
      for (; n < MAX_STEPS && x < endX; n++) {
        pts[n * 2] = x;
        pts[n * 2 + 1] = y + heroTop;
        // 1 = tangled, 0 = resolved
        const chaos = 1 - smooth(vw * 0.08, vw * 0.62, x);
        // two octaves of curl noise; each thread gets its own slice of time,
        // so they cross and knot instead of running side by side
        const tt = t + wobble;
        const s1 = x * 0.0058 + tt;
        const s2 = y * 0.0069 - tt * 0.8;
        const s3 = (x * 0.7 - y) * 0.0037 + tt * 1.3;
        const s4 = x * 0.016 - tt * 1.7;
        const s5 = y * 0.019 + tt * 1.1;
        let vx = -0.0069 * Math.sin(s1) * Math.sin(s2) - 0.0022 * Math.cos(s3) - 0.0085 * Math.sin(s4) * Math.sin(s5);
        let vy = -(0.0058 * Math.cos(s1) * Math.cos(s2) + 0.0016 * Math.cos(s3) + 0.0072 * Math.cos(s4) * Math.cos(s5));
        vx = vx * 380 * chaos + 0.75 + (1 - chaos) * 1.3;
        vy = vy * 380 * chaos + Math.max(-1, Math.min(1, (laneY - y) * 0.03)) * (1 - chaos);
        // the pointer twists what it passes
        const dx = x - px;
        const dy = y - py;
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
      if (!rail) return n;
      // bend down into this lane's rail
      const x0 = x;
      const y0 = y + heroTop;
      const x3 = railRight + laneOffset(lane);
      const y3 = y0 + TURN;
      for (let k = 1; k <= 20; k++) {
        const u = k / 20;
        const a = (1 - u) ** 3;
        const b = 3 * (1 - u) ** 2 * u;
        const c = 3 * (1 - u) * u * u;
        const d = u ** 3;
        pts[n * 2] = a * x0 + b * (x0 + (x3 - x0) * 0.75) + c * x3 + d * x3;
        pts[n * 2 + 1] = a * y0 + b * y0 + c * (y0 + TURN * 0.35) + d * y3;
        n++;
      }
      return n;
    };

    const draw = (time: number) => {
      const t = time * 0.00012;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      ctx.clearRect(0, 0, vw, vh);
      ctx.lineJoin = "round";
      const heroVisible = heroTop + heroH + TURN > scrollY;
      const grad = ctx.createLinearGradient(0, 0, vw, 0);
      grad.addColorStop(0, mutedSoft);
      grad.addColorStop(0.3, muted);
      grad.addColorStop(0.72, accent);

      order.forEach(([entry, i], lane) => {
        const seed = seeds[i];
        let railStart = heroTop + heroH * 0.9 + TURN;

        if (heroVisible || rail) {
          const n = trace(entry, lane, t, seed.wobble);
          railStart = pts[(n - 1) * 2 + 1];
          if (heroVisible) {
            ctx.strokeStyle = grad;
            ctx.globalAlpha = 0.28;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1] - scrollY);
            for (let k = 1; k < n; k++) ctx.lineTo(pts[k * 2], pts[k * 2 + 1] - scrollY);
            ctx.stroke();
            if (!reduced) {
              const head = Math.floor(((time * 0.00006 * seed.speed + seed.phase) % 1) * (n - 1));
              const tail = Math.max(0, head - 12);
              ctx.globalAlpha = 0.85;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(pts[tail * 2], pts[tail * 2 + 1] - scrollY);
              for (let k = tail + 1; k <= head; k++) ctx.lineTo(pts[k * 2], pts[k * 2 + 1] - scrollY);
              ctx.stroke();
            }
          }
        }

        if (!rail) return;
        // the rail: from the end of the bend to the bottom of the page,
        // only the part that is on screen
        const from = Math.max(railStart, scrollY - 20);
        const to = Math.min(docH, scrollY + vh + 20);
        if (to <= from) return;
        const off = laneOffset(lane);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        // straight runs and crossings are drawn as separate strokes so a
        // crossing can be lighter than the rail
        let y = from;
        let crossing = false;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        let p = railPoint(y, off);
        ctx.moveTo(p[0], p[1] - scrollY);
        while (y < to) {
          const slope = Math.abs(railX(y + 1) - railX(y - 1)) / 2;
          y += 8 / Math.max(1, slope);
          p = railPoint(y, off);
          ctx.lineTo(p[0], p[1] - scrollY);
          if (slope > 0.3 !== crossing) {
            ctx.stroke();
            crossing = !crossing;
            ctx.globalAlpha = crossing ? 0.16 : 0.3;
            ctx.beginPath();
            ctx.moveTo(p[0], p[1] - scrollY);
          }
        }
        ctx.stroke();

        if (reduced) return;
        // a pulse running down the rail; scrolling pushes it along
        const length = docH - railStart;
        const head = railStart + ((time * 0.11 * seed.speed + pulseShift * seed.speed + seed.phase * length) % length);
        if (head > scrollY - 60 && head - 60 < scrollY + vh) {
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          let q = Math.max(railStart, head - 60);
          let pt = railPoint(q, off);
          ctx.moveTo(pt[0], pt[1] - scrollY);
          while (q < head) {
            q += 6 / Math.max(1, Math.abs(railX(q + 1) - railX(q - 1)) / 2);
            pt = railPoint(q, off);
            ctx.lineTo(pt[0], pt[1] - scrollY);
          }
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      // full rate while the hero is on screen, half rate further down
      const heroVisible = heroTop + heroH > scrollY;
      if (heroVisible || frame++ % 2 === 0) draw(time);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduced && !document.hidden && !raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readColors();
    measure();
    draw(performance.now());
    start();

    const onScroll = () => {
      const y = window.scrollY;
      pulseShift += Math.abs(y - scrollY) * 1.4;
      scrollY = y;
      if (reduced) draw(0);
    };
    const onResize = () => {
      measure();
      draw(performance.now());
    };
    // page height changes as images load
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    const onVisibility = () => (document.hidden ? stop() : start());
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColors();
      draw(performance.now());
    };
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      if (pointer.x < -1e3) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onLeave = () => {
      pointer.tx = pointer.ty = pointer.x = pointer.y = -1e4;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onScheme);
    window.addEventListener("themechange", onScheme);
    if (!reduced) {
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", onScheme);
      window.removeEventListener("themechange", onScheme);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
