"use client";

import React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

export default function GlassButton({
  variant = "secondary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const styles: Record<Variant, string> = {
    primary:
      "bg-white/10 hover:bg-white/[0.17] border border-white/20 text-white backdrop-blur-sm",
    secondary:
      "bg-surface-2 hover:bg-surface-3 border border-border text-white/90",
    ghost: "bg-transparent hover:bg-white/[0.06] text-white/80",
  };

  return (
    <button className={cn(base, styles[variant], className)} {...props} />
  );
}

