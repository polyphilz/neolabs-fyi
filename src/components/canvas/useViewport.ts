import { useCallback, useEffect, useRef, useState } from 'react';

export interface Transform {
  k: number;
  x: number;
  y: number;
}

const MIN_K = 0.5;
const MAX_K = 8;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Safari-only pinch events. Not in lib.dom, so declare the bits we use. */
interface GestureEventLike extends Event {
  scale: number;
  clientX: number;
  clientY: number;
}

/**
 * Hand-rolled pan/zoom rather than d3-zoom: we need the same screen→canvas
 * coordinate conversion for node dragging anyway, and doing it here keeps
 * d3-selection out of the bundle.
 *
 * Wheel and gesture listeners are attached natively with `passive: false`.
 * React registers wheel handlers passively at the root, which silently makes
 * `preventDefault()` a no-op — the symptom being that a trackpad pinch zooms
 * the whole page instead of the canvas.
 */
export function useViewport(
  svgRef: React.RefObject<SVGSVGElement | null>,
  viewW: number,
  viewH: number
) {
  const [transform, setTransform] = useState<Transform>({ k: 1, x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  // Kept in a ref so the native listeners never close over a stale transform.
  const tRef = useRef(transform);
  tRef.current = transform;

  /** How the viewBox is fitted into the element, given preserveAspectRatio. */
  const fit = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scale = Math.min(rect.width / viewW, rect.height / viewH);
    return {
      rect,
      scale,
      insetX: (rect.width - viewW * scale) / 2,
      insetY: (rect.height - viewH * scale) / 2,
    };
  }, [svgRef, viewW, viewH]);

  /** Screen (client) coords → canvas coords. */
  const toCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const f = fit();
      if (!f) return { x: 0, y: 0 };
      const vx = (clientX - f.rect.left - f.insetX) / f.scale;
      const vy = (clientY - f.rect.top - f.insetY) / f.scale;
      const t = tRef.current;
      return { x: (vx - t.x) / t.k, y: (vy - t.y) / t.k };
    },
    [fit]
  );

  /** Zoom by `factor`, holding the given client point fixed on screen. */
  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const f = fit();
      if (!f) return;
      const px = (clientX - f.rect.left - f.insetX) / f.scale;
      const py = (clientY - f.rect.top - f.insetY) / f.scale;
      setTransform((t) => {
        const k = clamp(t.k * factor, MIN_K, MAX_K);
        return { k, x: px - ((px - t.x) / t.k) * k, y: py - ((py - t.y) / t.k) * k };
      });
    },
    [fit]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // A trackpad pinch arrives as a wheel event with ctrlKey set. Anything
      // else is a two-finger scroll, which pans — the map convention.
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.pow(2, -e.deltaY * 0.01), e.clientX, e.clientY);
        return;
      }
      const f = fit();
      if (!f) return;
      setTransform((t) => ({
        ...t,
        x: t.x - e.deltaX / f.scale,
        y: t.y - e.deltaY / f.scale,
      }));
    };

    // Safari dispatches its own pinch events and will zoom the page unless
    // they're cancelled here.
    let gestureStart = 1;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      gestureStart = (e as GestureEventLike).scale;
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as GestureEventLike;
      if (gestureStart > 0) zoomAt(g.scale / gestureStart, g.clientX, g.clientY);
      gestureStart = g.scale;
    };
    const onGestureEnd = (e: Event) => e.preventDefault();

    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('gesturestart', onGestureStart, { passive: false });
    svg.addEventListener('gesturechange', onGestureChange, { passive: false });
    svg.addEventListener('gestureend', onGestureEnd, { passive: false });
    return () => {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('gesturestart', onGestureStart);
      svg.removeEventListener('gesturechange', onGestureChange);
      svg.removeEventListener('gestureend', onGestureEnd);
    };
  }, [svgRef, fit, zoomAt]);

  // --- touch pinch (mobile) ------------------------------------------------
  // Pointer events rather than touch events, since the canvas already uses
  // pointer capture for dragging and `touch-action: none` suppresses natives.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number } | null>(null);

  const startPan = useCallback(
    (e: React.PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) };
        panRef.current = null;
        return;
      }
      panRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    },
    [transform]
  );

  const movePan = useCallback(
    (e: React.PointerEvent) => {
      if (pointers.current.has(e.pointerId)) {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (pinch.current && pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch.current.dist > 0) {
          zoomAt(dist / pinch.current.dist, (a.x + b.x) / 2, (a.y + b.y) / 2);
        }
        pinch.current.dist = dist;
        return;
      }

      const pan = panRef.current;
      if (!pan) return;
      const f = fit();
      if (!f) return;
      setTransform((t) => ({
        ...t,
        x: pan.tx + (e.clientX - pan.x) / f.scale,
        y: pan.ty + (e.clientY - pan.y) / f.scale,
      }));
    },
    [fit, zoomAt]
  );

  const endPan = useCallback((e?: React.PointerEvent) => {
    if (e) pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    panRef.current = null;
  }, []);

  return { transform, toCanvas, fit, startPan, movePan, endPan };
}
