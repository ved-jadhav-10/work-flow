"use client";

import React from "react";

type AppBackgroundVariant = "app" | "hero";

export default function AppBackground({
  children,
  variant = "app",
  className = "",
}: {
  children: React.ReactNode;
  variant?: AppBackgroundVariant;
  className?: string;
}) {
  const isHero = variant === "hero";

  return (
    <div
      className={[
        "relative min-h-screen bg-background text-foreground",
        className,
      ].join(" ")}
    >
      {/* Ambient glows + vignette */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-44 -left-44 h-130 w-130 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-35 -right-40 h-140 w-140 rounded-full bg-gold/8 blur-[140px]" />

        {/* Slight central vignette (hero already adds its own) */}
        {!isHero && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(4,8,15,0.40) 0%, rgba(4,8,15,0.15) 55%, transparent 100%)",
            }}
          />
        )}

        {/* Top fade for headers */}
        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-background/60 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}

