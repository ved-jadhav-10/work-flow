"use client";

import React from "react";
import { cn } from "@/lib/cn";

export default function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface border border-border backdrop-blur-md",
        "shadow-[0_12px_44px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

