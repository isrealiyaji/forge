"use client";

import { useEffect, useRef } from "react";

const SPACING = 46;
const RADIUS = 230;
const EASE = 0.14;
const GOLD = [207, 154, 46] as const; // --gold, same value in both themes
const RIPPLE_DURATION_MS = 900;
const RIPPLE_SPEED = 820; // px/s outward

type Point = { x: number; y: number; ox: number; oy: number };
type Ripple = { x: number; y: number; startedAt: number };

const CursorGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points: Point[] = [];
    let cols = 0;

    const target = { x: -9999, y: -9999 };
    const smoothed = { x: -9999, y: -9999 };
    const prevSmoothed = { x: -9999, y: -9999 };
    let active = false;
    let energy = 0; // 0..1, rises with cursor speed, decays when still
    const ripples: Ripple[] = [];

    const buildGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      points = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          points.push({ x, y, ox: x, oy: y });
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      active = true;
    };
    const onLeave = () => {
      active = false;
    };
    const onDown = (e: PointerEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, startedAt: performance.now() });
    };

    let raf = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      prevSmoothed.x = smoothed.x;
      prevSmoothed.y = smoothed.y;
      smoothed.x += (target.x - smoothed.x) * EASE;
      smoothed.y += (target.y - smoothed.y) * EASE;

      const speed = Math.hypot(smoothed.x - prevSmoothed.x, smoothed.y - prevSmoothed.y) / Math.max(dt, 1 / 120);
      const speedFactor = Math.min(speed / 1400, 1);
      energy += (speedFactor - energy) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const radiusSq = RADIUS * RADIUS;
      const pushStrength = 14 + energy * 16;

      for (const p of points) {
        const dx = p.ox - smoothed.x;
        const dy = p.oy - smoothed.y;
        const distSq = dx * dx + dy * dy;
        let px = p.ox;
        let py = p.oy;

        if (distSq <= radiusSq) {
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / RADIUS;
          const eased = t * t * (3 - 2 * t); // smoothstep — gentler than a raw power curve
          const angle = Math.atan2(dy, dx);
          px += Math.cos(angle) * eased * pushStrength;
          py += Math.sin(angle) * eased * pushStrength;
        }

        for (const ripple of ripples) {
          const age = (now - ripple.startedAt) / 1000;
          const ringRadius = age * RIPPLE_SPEED;
          const rdx = p.ox - ripple.x;
          const rdy = p.oy - ripple.y;
          const dist = Math.hypot(rdx, rdy);
          const band = Math.abs(dist - ringRadius);
          if (band < 60) {
            const fade = 1 - age / (RIPPLE_DURATION_MS / 1000);
            if (fade > 0) {
              const strength = (1 - band / 60) * fade * 20;
              const angle = Math.atan2(rdy, rdx);
              px += Math.cos(angle) * strength;
              py += Math.sin(angle) * strength;
            }
          }
        }

        p.x = px;
        p.y = py;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].startedAt > RIPPLE_DURATION_MS) ripples.splice(i, 1);
      }

      if (active || smoothed.x > -9000) {
        const glowRadius = RADIUS * (0.5 + energy * 0.3);
        const glow = ctx.createRadialGradient(
          smoothed.x,
          smoothed.y,
          0,
          smoothed.x,
          smoothed.y,
          glowRadius,
        );
        glow.addColorStop(0, `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${0.05 + energy * 0.06})`);
        glow.addColorStop(1, `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(smoothed.x - glowRadius, smoothed.y - glowRadius, glowRadius * 2, glowRadius * 2);

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const dx = p.ox - smoothed.x;
          const dy = p.oy - smoothed.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > radiusSq) continue;
          const falloff = 1 - Math.sqrt(distSq) / RADIUS;
          const alpha = falloff * (0.5 + energy * 0.3);

          const neighbors = [
            (i + 1) % cols !== 0 ? points[i + 1] : null,
            points[i + cols] ?? null,
            (i + 1) % cols !== 0 ? points[i + cols + 1] : null,
          ];
          for (const neighbor of neighbors) {
            if (!neighbor) continue;
            const ndx = neighbor.ox - smoothed.x;
            const ndy = neighbor.oy - smoothed.y;
            if (ndx * ndx + ndy * ndy > radiusSq) continue;
            ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${alpha * 0.55})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }

          ctx.fillStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4 + energy * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    buildGrid();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", buildGrid);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", buildGrid);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
};

export default CursorGrid;
