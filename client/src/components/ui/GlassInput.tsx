"use client";

import React from "react";
import { cn } from "@/lib/cn";

export default function GlassInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl px-3.5 py-2.5 text-sm",
        "bg-surface-2 border border-border text-white placeholder:text-muted-2",
        "focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20",
        className
      )}
      {...props}
    />
  );
}

