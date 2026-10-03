"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the mailto link beside this still works
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="label glass cursor-pointer rounded-full px-5 py-2.5 text-muted transition-colors hover:border-[var(--line-strong)] hover:text-fg"
      aria-live="polite"
    >
      {copied ? "Copied ✓" : "Copy email"}
    </button>
  );
}
