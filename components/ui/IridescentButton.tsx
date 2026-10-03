"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

/**
 * Iridescent ring button — recreation of the "iridescent home button"
 * effect (recent.design / Jakub Wuzik): a dark pill whose border is a
 * slowly rotating pearl gradient with a soft halo, intensifying on
 * hover/press. The ring itself lives in globals.css (.irid-btn); this
 * component adds the polymorphic element + Motion lift/press states.
 *
 * Renders <Link> for internal hrefs, <a> for downloads/external
 * targets, <button> otherwise.
 */

const MotionLink = motion.create(Link);

type Size = "sm" | "md" | "icon";

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2",
  md: "px-7 py-3.5",
  icon: "h-10 w-10 justify-center p-0",
};

type BaseProps = {
  children: ReactNode;
  size?: Size;
  className?: string;
  href?: string;
  download?: boolean;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function IridescentButton({
  children,
  size = "sm",
  className = "",
  href,
  download,
  target,
  rel,
  onClick,
  type = "button",
  ...aria
}: BaseProps) {
  const reduced = useReducedMotion();

  const cls = `irid-btn inline-flex cursor-pointer items-center gap-2 ${SIZES[size]} ${className}`;
  const motionProps = reduced
    ? {}
    : ({
        whileHover: { y: -1 },
        whileTap: { scale: 0.97 },
        transition: { type: "spring", stiffness: 420, damping: 32 },
      } as ComponentProps<typeof motion.button>);

  // mailto/tel/external and download/target all render a plain <a>
  const isExternal = !!href && /^(mailto:|tel:|https?:)/.test(href);

  if (href && (download || target || isExternal)) {
    return (
      <motion.a
        href={href}
        download={download}
        target={target}
        rel={rel}
        className={cls}
        onClick={onClick}
        {...aria}
        {...(motionProps as ComponentProps<typeof motion.a>)}
      >
        {children}
      </motion.a>
    );
  }

  if (href) {
    return (
      <MotionLink
        href={href}
        className={cls}
        onClick={onClick}
        {...aria}
        {...(motionProps as ComponentProps<typeof MotionLink>)}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button type={type} className={cls} onClick={onClick} {...aria} {...motionProps}>
      {children}
    </motion.button>
  );
}
