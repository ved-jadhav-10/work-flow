"use client";

import { useRef, useEffect } from "react";

/* ── Types ─────────────────────────────────────────────────────── */
interface Star {
  x: number;
  y: number;
  baseSize: number;
  opacity: number;
  twinkleSpeed: number; // radians per frame
  twinklePhase: number;
  driftX: number; // px per frame
  driftY: number; // px per frame (negative = upward)
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number; // velocity x px/frame
  vy: number; // velocity y px/frame
  length: number; // trail length in px
  alpha: number; // current opacity
  decay: number; // opacity lost per frame
  active: boolean;
}

/* ── Helper: seeded-ish deterministic randomiser ────────────────── */
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/* ── Component ──────────────────────────────────────────────────── */
export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let frameCount = 0;
    // Frame number at which the next shooting star spawns
    let nextSpawnFrame = 60 + Math.floor(Math.random() * 90); // first one in ~1-2.5s

    /* Spawn a new shooting star from a random top/left edge position */
    const spawnShootingStar = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      // angle between ~15° and ~45° downward-right
      const angleDeg = 15 + Math.random() * 30;
      const angleRad = (angleDeg * Math.PI) / 180;
      const speed = 8 + Math.random() * 10;
      shootingStars.push({
        x: Math.random() * w * 0.8,          // start across top 80% width
        y: Math.random() * h * 0.4,           // start in top 40% height
        vx: Math.cos(angleRad) * speed,
        vy: Math.sin(angleRad) * speed,
        length: 80 + Math.random() * 120,
        alpha: 0.9 + Math.random() * 0.1,
        decay: 0.012 + Math.random() * 0.008,
        active: true,
      });
    };

    /* Resize handler — keeps canvas crisp on any screen */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    };

    /* Build initial star array */
    const buildStars = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = Math.round((w * h) / 12000); // ~160 on 1920×1080, fewer on small screens

      stars = Array.from({ length: count }, (_, i) => {
        const r = pseudoRandom;
        const sizeRoll = r(i + 1);
        return {
          x: r(i * 3 + 0.1) * w,
          y: r(i * 3 + 0.2) * h * 0.75, // keep them in top 75 %
          baseSize: sizeRoll < 0.06 ? 1.8          // 6 % accent stars
                  : sizeRoll < 0.25 ? 1.0           // 19 % medium
                  : 0.5,                              // 75 % tiny
          opacity: sizeRoll < 0.06 ? 0.85
                 : sizeRoll < 0.25 ? 0.5
                 : 0.22,
          twinkleSpeed: 0.008 + r(i * 7 + 0.4) * 0.018,  // slow gentle pulse
          twinklePhase: r(i * 11 + 0.5) * Math.PI * 2,
          driftX: (r(i * 13 + 0.6) - 0.5) * 0.04,        // very slow lateral wander
          driftY: -(0.01 + r(i * 17 + 0.7) * 0.03),       // gentle upward float
        };
      });
    };

    /* Animation loop */
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      frameCount++;
      // Spawn a shooting star every 2–4 seconds (120–240 frames at 60 fps)
      if (frameCount >= nextSpawnFrame) {
        spawnShootingStar();
        nextSpawnFrame = frameCount + 120 + Math.floor(Math.random() * 120);
      }

      /* ── Shooting stars ── */
      for (const ss of shootingStars) {
        if (!ss.active) continue;

        // Draw trail as a gradient line
        const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length;
        const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.7, `rgba(220,230,255,${ss.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(255,255,255,${ss.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bright head dot
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${ss.alpha})`;
        ctx.fill();

        // Advance position
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.alpha -= ss.decay;

        if (ss.alpha <= 0 || ss.x > w + 50 || ss.y > h + 50) {
          ss.active = false;
        }
      }
      // Clean up inactive shooting stars
      shootingStars = shootingStars.filter((ss) => ss.active);

      for (const s of stars) {
        /* Animate twinkle */
        s.twinklePhase += s.twinkleSpeed;
        const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
        const alpha = s.opacity * (0.3 + 0.7 * twinkle); // never fully invisible

        /* Drift */
        s.x += s.driftX;
        s.y += s.driftY;

        /* Wrap around */
        if (s.y < -4) s.y = h * 0.75;
        if (s.x < -4) s.x = w;
        if (s.x > w + 4) s.x = 0;

        /* Draw */
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.baseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();

        /* Soft glow for accent stars */
        if (s.baseSize > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.baseSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,210,255,${alpha * 0.12})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, mixBlendMode: "screen" }}
    />
  );
}
