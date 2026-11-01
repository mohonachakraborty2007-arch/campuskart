"use client";

import { useEffect, useRef } from "react";

const CELL_SIZE = 56;
const INFLUENCE_RADIUS = 240;
const MAX_WARP = 22;
const LERP_SPEED = 0.1;

const LINE_BASE = { r: 244, g: 245, b: 250, a: 0.09 };
const LINE_ACTIVE = { r: 124, g: 92, b: 255, a: 0.95 };
const NODE_BASE = { r: 244, g: 245, b: 250, a: 0.16 };
const NODE_ACTIVE = { r: 168, g: 148, b: 255, a: 1 };
const GLOW = "124,92,255";
const RIPPLE = "124,92,255";
const NODE_BASE_RADIUS = 1.6;
const NODE_ACTIVE_RADIUS = 3.2;

function lerpN(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(base, active, t) {
    const r = Math.round(lerpN(base.r, active.r, t));
    const g = Math.round(lerpN(base.g, active.g, t));
    const b = Math.round(lerpN(base.b, active.b, t));
    const a = lerpN(base.a, active.a, t);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

function getWarpedPoint(gx, gy, col, row, mouse, ripples, cols, rows) {
    // keep the outer edge of the grid pinned in place
    const edge = 1.5;
    const colPin = Math.min(col / edge, (cols - 1 - col) / edge, 1);
    const rowPin = Math.min(row / edge, (rows - 1 - row) / edge, 1);
    const pin = colPin * colPin * rowPin * rowPin;

    const dx = gx - mouse.x;
    const dy = gy - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pin;

    let rx = 0;
    let ry = 0;
    for (const r of ripples) {
        const rdx = gx - r.x;
        const rdy = gy - r.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = 55;
        const diff = rdist - r.radius;
        if (Math.abs(diff) < waveWidth) {
            const strength =
                (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pin;
            const angle = Math.atan2(rdy, rdx);
            const sign = diff < 0 ? -1 : 1;
            rx += Math.cos(angle) * strength * sign * -1;
            ry += Math.sin(angle) * strength * sign * -1;
        }
    }

    if (dist < INFLUENCE_RADIUS && dist > 0 && pin > 0) {
        const t = dist / INFLUENCE_RADIUS;
        const eased = (1 - t) * (1 - t) * Math.min(1, dist / 60);
        const warp = eased * MAX_WARP * pin;
        const angle = Math.atan2(dy, dx);
        return {
            pt: {
                x: gx - Math.cos(angle) * warp + rx,
                y: gy - Math.sin(angle) * warp + ry,
            },
            proximity,
        };
    }

    return { pt: { x: gx + rx, y: gy + ry }, proximity };
}

export default function KineticGrid({ children, className = "" }) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        let W = 0;
        let H = 0;
        let raf = 0;
        let visible = true;
        const mouse = { x: -9999, y: -9999 };
        const target = { x: -9999, y: -9999 };
        const ripples = [];

        function drawFrame(now) {
            if (!W || !H) return;
            ctx.clearRect(0, 0, W, H);

            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                const age = (now - r.born) / 1000;
                r.radius = Math.max(0, age * 400);
                r.opacity = Math.max(0, 1 - age * 1.2);
                if (r.opacity <= 0) ripples.splice(i, 1);
            }

            const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
            const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
            const cellW = W / (cols - 1);
            const cellH = H / (rows - 1);

            const pts = [];
            const prox = [];
            for (let row = 0; row < rows; row++) {
                pts[row] = [];
                prox[row] = [];
                for (let col = 0; col < cols; col++) {
                    const { pt, proximity } = getWarpedPoint(
                        col * cellW,
                        row * cellH,
                        col,
                        row,
                        mouse,
                        ripples,
                        cols,
                        rows
                    );
                    pts[row][col] = pt;
                    prox[row][col] = proximity;
                }
            }

            const seg = (p1, p2, a, b) => {
                const avg = (a + b) / 2;
                const t = avg * avg * (3 - 2 * avg);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = lerpColor(LINE_BASE, LINE_ACTIVE, t);
                ctx.lineWidth = lerpN(0.8, 1.5, t);
                ctx.stroke();
            };

            for (let row = 0; row < rows; row++)
                for (let col = 0; col < cols - 1; col++)
                    seg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);

            for (let col = 0; col < cols; col++)
                for (let row = 0; row < rows - 1; row++)
                    seg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const p = pts[row][col];
                    const pr = prox[row][col];
                    const t = pr * pr * (3 - 2 * pr);
                    const radius = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

                    if (t > 0.3) {
                        const glowR = radius + lerpN(0, 6, (t - 0.3) / 0.7);
                        const grd = ctx.createRadialGradient(
                            p.x,
                            p.y,
                            radius * 0.5,
                            p.x,
                            p.y,
                            glowR
                        );
                        grd.addColorStop(0, `rgba(${GLOW},${(t * 0.3).toFixed(3)})`);
                        grd.addColorStop(1, `rgba(${GLOW},0)`);
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
                        ctx.fillStyle = grd;
                        ctx.fill();
                    }

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = lerpColor(NODE_BASE, NODE_ACTIVE, t);
                    ctx.fill();
                }
            }

            for (const r of ripples) {
                ctx.beginPath();
                ctx.arc(r.x, r.y, Math.max(0, r.radius), 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${RIPPLE},${(r.opacity * 0.28).toFixed(3)})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        function tick(now) {
            mouse.x = lerpN(mouse.x, target.x, LERP_SPEED);
            mouse.y = lerpN(mouse.y, target.y, LERP_SPEED);
            drawFrame(now);
            raf = requestAnimationFrame(tick);
        }

        function start() {
            if (reduceMotion || raf) return;
            raf = requestAnimationFrame(tick);
        }
        function stop() {
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
        }

        function resize() {
            const rect = wrap.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = rect.width;
            H = rect.height;
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawFrame(performance.now());
        }

        function inside(e, rect) {
            return (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );
        }

        function onMove(e) {
            const rect = wrap.getBoundingClientRect();
            if (!inside(e, rect)) {
                mouse.x = mouse.y = target.x = target.y = -9999;
                return;
            }
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (mouse.x === -9999) {
                mouse.x = x;
                mouse.y = y;
            }
            target.x = x;
            target.y = y;
        }

        function onClick(e) {
            const rect = wrap.getBoundingClientRect();
            if (!inside(e, rect)) return;
            ripples.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                radius: 0,
                opacity: 1,
                born: performance.now(),
            });
        }

        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(wrap);

        let io;
        if (!reduceMotion) {
            window.addEventListener("mousemove", onMove);
            window.addEventListener("click", onClick);
            io = new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting;
                if (visible) start();
                else stop();
            });
            io.observe(wrap);
            start();
        }

        return () => {
            stop();
            resizeObserver.disconnect();
            io?.disconnect();
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("click", onClick);
        };
    }, []);

    return (
        <div
            ref={wrapRef}
            className={`relative isolate overflow-hidden ${className}`}
        >
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
                style={{
                    maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, black 55%, transparent 100%)",
                }}
            />
            {children}
        </div>
    );
}