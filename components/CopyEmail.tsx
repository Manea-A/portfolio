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
      className="cursor-pointer rounded-full border border-line-strong px-5 py-3 text-sm font-medium transition-colors hover:bg-bg"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
