"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

type Card = { slug: string; title: string; shot: string; domain: string };

/* fanned layout: back, middle, front */
const LAYOUT = [
  { x: "-20%", y: "-10%", rotate: -8, z: 0, scale: 0.8 },
  { x: "20%", y: "-2%", rotate: 6, z: 1, scale: 0.84 },
  { x: "-2%", y: "26%", rotate: -1.5, z: 2, scale: 0.92 },
];

/**
 * Three live products stacked in perspective. The whole stack tilts toward
 * the pointer (Motion springs); each card lifts on hover and links to its
 * case study. Server-rendered in its final position — motion only adds.
 */
export default function HeroShowcase({ cards }: { cards: Card[] }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto aspect-[5/4] w-full max-w-[560px] [perspective:1400px]"
    >
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative h-full w-full [transform-style:preserve-3d]">
        {cards.slice(0, 3).map((c, i) => {
          const l = LAYOUT[i];
          return (
            <motion.div
              key={c.slug}
              className="absolute left-[8%] top-[8%] w-[84%]"
              style={{ x: l.x, y: l.y, rotate: l.rotate, scale: l.scale, zIndex: l.z }}
              whileHover={reduced ? undefined : { rotate: 0, scale: l.scale + 0.04, zIndex: 5 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <Link
                href={`/work/${c.slug}`}
                className="block overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]"
              >
                <span className="flex items-center gap-1.5 border-b border-line bg-bg/80 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff5f57]/80" />
                  <span className="h-2 w-2 rounded-full bg-[#febc2e]/80" />
                  <span className="h-2 w-2 rounded-full bg-[#28c840]/80" />
                  <span className="meta ml-2 text-[0.625rem] text-muted">{c.domain}</span>
                </span>
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={c.shot}
                    alt={`${c.title} live site`}
                    width={1200}
                    height={3500}
                    sizes="460px"
                    priority={i === 2}
                    className="absolute inset-x-0 top-0 h-auto w-full"
                  />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
