"use client";

import { useEffect, useRef } from "react";

const SPACING = 46;
const RADIUS = 230;
const EASE = 0.14;
const GOLD = [207, 154, 46] as const; // --gold, same value in both themes

type Point = { x: number; y: number; ox: number; oy: number };

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

    const target = { x: -9999, y: -9999 };
    const smoothed = { x: -9999, y: -9999 };
    let active = false;

    const buildGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / SPACING) + 1;
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

    let raf = 0;
    const tick = () => {
      smoothed.x += (target.x - smoothed.x) * EASE;
      smoothed.y += (target.y - smoothed.y) * EASE;

      ctx.clearRect(0, 0, width, height);

      const radiusSq = RADIUS * RADIUS;
      const cols = Math.ceil(width / SPACING) + 1;

      for (const p of points) {
        const dx = p.ox - smoothed.x;
        const dy = p.oy - smoothed.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq) {
          p.x = p.ox;
          p.y = p.oy;
          continue;
        }
        const dist = Math.sqrt(distSq);
        const falloff = 1 - dist / RADIUS;
        const push = falloff * falloff * 16;
        const angle = Math.atan2(dy, dx);
        p.x = p.ox + Math.cos(angle) * push;
        p.y = p.oy + Math.sin(angle) * push;
      }

      if (active || smoothed.x > -9000) {
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const dx = p.ox - smoothed.x;
          const dy = p.oy - smoothed.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > radiusSq) continue;
          const falloff = 1 - Math.sqrt(distSq) / RADIUS;
          const alpha = falloff * 0.55;

          // connect to the neighbor on the right and below for a mesh look
          const right = points[i + 1];
          if (right && (i + 1) % cols !== 0) {
            const rdx = right.ox - smoothed.x;
            const rdy = right.oy - smoothed.y;
            if (rdx * rdx + rdy * rdy <= radiusSq) {
              ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${alpha * 0.6})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(right.x, right.y);
              ctx.stroke();
            }
          }
          const below = points[i + cols];
          if (below) {
            const bdx = below.ox - smoothed.x;
            const bdy = below.oy - smoothed.y;
            if (bdx * bdx + bdy * bdy <= radiusSq) {
              ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${alpha * 0.6})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(below.x, below.y);
              ctx.stroke();
            }
          }

          ctx.fillStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", buildGrid);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
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
