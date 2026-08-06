import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { Lab, LineageGroup } from '../../data/types';
import type { Basemap } from '../../lib/basemap';
import { UNKNOWN_FILL, UNKNOWN_INK, fillFor, valuationStep } from '../../lib/color';
import type { Filters } from '../../lib/filters';
import { VIEW_H, VIEW_W, computeLayout } from '../../lib/layout';
import { canvasName, spaceLabel, valuationLabel } from '../../lib/format';
import { LINE_SPACING, fitLabel, refreshLabelMetrics } from '../../lib/labelFit';
import { useSimulation, type SimNode } from './useSimulation';
import { useViewport } from './useViewport';

interface Props {
  labs: Lab[];
  basemap: Basemap;
  filters: Filters;
  selected: string | null;
  selectedLineage: LineageGroup | null;
  onSelect: (slug: string | null) => void;
  onLineageSelect: (group: LineageGroup | null) => void;
}

/**
 * Smallest on-screen type we'll draw on a bubble. The threshold is in *screen*
 * pixels, not canvas units, which is what lets labels fade in as you zoom into
 * a small bubble rather than being permanently hidden.
 */
const MIN_SCREEN_FONT = 9.5;

/**
 * Drag slop: how far the pointer must travel before a press counts as a drag
 * rather than a click. Without this, a single pixel of hand tremor between
 * press and release swallowed the click entirely — and essentially no real
 * click is 0px, least of all on a trackpad.
 *
 * Touch needs more room than a mouse because fingers roll as they lift.
 */
const SLOP_MOUSE = 4;
const SLOP_TOUCH = 10;
const slopFor = (pointerType: string) => (pointerType === 'mouse' ? SLOP_MOUSE : SLOP_TOUCH);

/** Minimum on-screen hit radius, so the smallest bubbles are still clickable. */
const MIN_HIT_SCREEN = 12;

/**
 * Labels are always drawn at this font-size in user units and scaled to fit by
 * the group around them. Setting a sub-pixel font-size directly makes the
 * rasteriser paint glyphs wider than their reported metrics, so the text spills
 * out of small bubbles even though it measures as fitting.
 */
const NOMINAL_FONT = 12;

export function LabCanvas({
  labs,
  basemap,
  filters,
  selected,
  selectedLineage,
  onSelect,
  onLineageSelect,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredLineage, setHoveredLineage] = useState<LineageGroup | null>(null);
  const dragRef = useRef<{
    node: SimNode;
    startX: number;
    startY: number;
    pointerType: string;
    /** True once the slop threshold is crossed — i.e. a real drag. */
    dragging: boolean;
  } | null>(null);
  /** Same press-vs-drag question for the canvas background. */
  const panRef = useRef<{ startX: number; startY: number; pointerType: string; moved: boolean } | null>(
    null
  );

  const layout = useMemo(
    () => computeLayout(filters.view, labs, basemap),
    [filters.view, labs, basemap]
  );

  const { nodes, reheat, cool } = useSimulation(labs, layout);
  const vp = useViewport(svgRef, VIEW_W, VIEW_H);
  const { transform } = vp;

  // How many screen pixels one canvas unit occupies at zoom 1. Needed to decide
  // legibility, and it changes with the viewport, so watch for resizes rather
  // than measuring on every frame.
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width && height) setFitScale(Math.min(width / VIEW_W, height / VIEW_H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  /** Canvas units -> screen pixels, including zoom. */
  const screenScale = transform.k * fitScale;

  // Label fitting measures real text, but only after mount — measuring during
  // SSR would desync server and client HTML. Re-measure once webfonts land,
  // since until then the browser is measuring the fallback face.
  const [, remeasure] = useState(0);
  useEffect(() => {
    const apply = () => {
      refreshLabelMetrics();
      remeasure((n) => n + 1);
    };
    apply();
    document.fonts?.ready.then(apply).catch(() => {});
  }, []);

  /**
   * Paint order: largest first, so small bubbles land on top and their hit
   * targets win. Previously this was data order, and small nodes stayed
   * clickable only by luck.
   */
  const drawOrder = useMemo(() => [...nodes].sort((a, b) => b.r - a.r), [nodes]);

  const positions = useMemo(() => {
    const map = new Map<string, SimNode>();
    for (const n of nodes) map.set(n.slug, n);
    return map;
  }, [nodes]);

  const onNodePointerDown = useCallback((e: React.PointerEvent, node: SimNode) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    // Deliberately does not pin the node or reheat the simulation yet: until
    // the pointer proves it's a drag, this might be a click, and a click
    // should leave the layout perfectly still.
    dragRef.current = {
      node,
      startX: e.clientX,
      startY: e.clientY,
      pointerType: e.pointerType,
      dragging: false,
    };
  }, []);

  const onNodePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (!drag.dragging) {
        const travelled = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
        if (travelled < slopFor(drag.pointerType)) return;
        drag.dragging = true;
        reheat(0.35);
      }

      const p = vp.toCanvas(e.clientX, e.clientY);
      drag.node.fx = p.x;
      drag.node.fy = p.y;
    },
    [vp, reheat]
  );

  const onNodePointerUp = useCallback(
    (e: React.PointerEvent, node: SimNode) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;

      if (drag.dragging) {
        // A drag manipulates; it never selects.
        node.fx = null;
        node.fy = null;
        cool();
        return;
      }

      e.stopPropagation();
      onSelect(node.slug === selected ? null : node.slug);
    },
    [cool, onSelect, selected]
  );

  const onBackgroundDown = useCallback(
    (e: React.PointerEvent) => {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        pointerType: e.pointerType,
        moved: false,
      };
      vp.startPan(e);
    },
    [vp]
  );

  const onBackgroundMove = useCallback(
    (e: React.PointerEvent) => {
      const pan = panRef.current;
      if (pan && !pan.moved) {
        const travelled = Math.hypot(e.clientX - pan.startX, e.clientY - pan.startY);
        if (travelled >= slopFor(pan.pointerType)) pan.moved = true;
      }
      vp.movePan(e);
    },
    [vp]
  );

  const onBackgroundUp = useCallback(
    (e: React.PointerEvent) => {
      const pan = panRef.current;
      panRef.current = null;
      vp.endPan(e);
      // Only a genuine tap on empty canvas dismisses the panel. Panning used to
      // count as a click on the background and closed whatever you were reading.
      if (pan && !pan.moved) onSelect(null);
    },
    [vp, onSelect]
  );

  /** Hit radius in canvas units that yields MIN_HIT_SCREEN pixels on screen. */
  const hitRadius = MIN_HIT_SCREEN / Math.max(screenScale, 0.0001);

  const dec = layout.decorations;
  const active = hovered ?? selected;
  const activeLineage = hoveredLineage ?? selectedLineage;
  const activeNode = active ? positions.get(active) : null;

  return (
    <div className="canvas-shell">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="canvas-svg"
        role="application"
        aria-label={`Neolab map, ${filters.view} view. ${labs.length} labs shown. A sortable table of the same data is available at /table.`}
        onPointerDown={onBackgroundDown}
        onPointerMove={onBackgroundMove}
        onPointerUp={onBackgroundUp}
        onPointerCancel={onBackgroundUp}
      >
        {/* Hit surface so gestures over empty canvas still reach the SVG.
            Dismissal is handled by the pointer handlers above, which can tell
            a tap from a pan; a bare onClick here could not. */}
        <rect
          x={-VIEW_W * 4}
          y={-VIEW_H * 4}
          width={VIEW_W * 9}
          height={VIEW_H * 9}
          fill="transparent"
        />

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {dec.basemap && (
            <g transform={dec.basemap.transform} className="basemap" aria-hidden="true">
              <path d={dec.basemap.graticule} className="basemap-graticule" />
              <path d={dec.basemap.land} className="basemap-land" />
            </g>
          )}

          {dec.clusters && (
            <g className="cluster-labels" aria-hidden="true">
              {dec.clusters.map((c) => {
                return (
                  <g key={c.id} transform={`translate(${c.x},${c.labelY})`}>
                    <text className="cluster-title" textAnchor="middle">
                      {c.label}
                    </text>
                    <text className="cluster-count" textAnchor="middle" y={14}>
                      {c.count} {c.count === 1 ? 'lab' : 'labs'}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {dec.edges && (
            <g className="lineage-edges" aria-hidden="true">
              {dec.edges.map((e) => {
                const from = positions.get(e.from);
                const hub = dec.hubs?.find((h) => h.id === e.toHub);
                if (!from || !hub) return null;
                const isActive = active === e.from || activeLineage === e.toHub;
                return (
                  <line
                    key={`${e.from}-${e.toHub}`}
                    x1={from.x}
                    y1={from.y}
                    x2={hub.x}
                    y2={hub.y}
                    className={isActive ? 'edge edge-active' : 'edge'}
                  />
                );
              })}
            </g>
          )}

          {dec.hubs && (
            <g className="lineage-hubs">
              {dec.hubs.map((h) => {
                const isActive = activeLineage === h.id;
                const isSelected = selectedLineage === h.id;
                return (
                <g
                  key={h.id}
                  transform={`translate(${h.x},${h.y})`}
                  className={`lineage-hub${isActive ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${h.label} lineage, ${h.count} ${h.count === 1 ? 'lab' : 'labs'}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    onLineageSelect(isSelected ? null : h.id);
                  }}
                  onPointerEnter={() => setHoveredLineage(h.id)}
                  onPointerLeave={() => setHoveredLineage((group) => (group === h.id ? null : group))}
                  onFocus={() => setHoveredLineage(h.id)}
                  onBlur={() => setHoveredLineage((group) => (group === h.id ? null : group))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLineageSelect(isSelected ? null : h.id);
                    }
                  }}
                >
                  <circle r={30} className="hub-disc" />
                  <text className="hub-count" textAnchor="middle" dy={5}>
                    {h.count}
                  </text>
                </g>
                );
              })}
            </g>
          )}

          <g className="bubbles">
            {drawOrder.map((n) => {
              const isActive = active === n.slug;
              const isSelected = selected === n.slug;
              const unknown = n.lab.valuation.qualifier === 'undisclosed' || Boolean(n.lab.structure);
              const step = valuationStep(n.lab.valuation.usdM);
              const fitted = fitLabel(canvasName(n.lab), n.r);
              // Drawn only once the fitted type would actually be readable.
              const label = fitted && fitted.fontSize * screenScale >= MIN_SCREEN_FONT ? fitted : null;
              return (
                <g
                  key={n.slug}
                  transform={`translate(${n.x},${n.y})`}
                  className={`bubble${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`}
                  onPointerDown={(e) => onNodePointerDown(e, n)}
                  onPointerMove={onNodePointerMove}
                  onPointerUp={(e) => onNodePointerUp(e, n)}
                  onPointerEnter={() => setHovered(n.slug)}
                  onPointerLeave={() => setHovered((h) => (h === n.slug ? null : h))}
                  tabIndex={0}
                  role="button"
                  aria-label={`${n.lab.name}, ${valuationLabel(n.lab.valuation)}, ${spaceLabel(n.lab)}, founded ${n.lab.year}`}
                  onFocus={() => setHovered(n.slug)}
                  onBlur={() => setHovered((h) => (h === n.slug ? null : h))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(n.slug === selected ? null : n.slug);
                    }
                  }}
                >
                  <circle
                    r={n.r}
                    fill={unknown ? UNKNOWN_FILL : fillFor(n.lab.valuation.usdM)}
                    strokeWidth={Math.min(2, n.r * 0.12)}
                    className="bubble-disc"
                  />
                  {/* A $335M lab is ~10px across, which is a miserable target.
                      This pads it out to a usable size without changing what's
                      drawn. Sized in screen pixels, so it holds at any zoom. */}
                  {hitRadius > n.r && <circle r={hitRadius} className="bubble-hit" />}
                  {label && (
                    <g transform={`scale(${label.fontSize / NOMINAL_FONT})`}>
                      <text
                        className="bubble-label"
                        textAnchor="middle"
                        style={{
                          fontSize: NOMINAL_FONT,
                          fill: unknown ? UNKNOWN_INK : `var(--on-seq-${step})`,
                        }}
                      >
                        {label.lines.map((line, i) => (
                          <tspan
                            key={line + i}
                            x={0}
                            y={
                              (i - (label.lines.length - 1) / 2) * NOMINAL_FONT * LINE_SPACING +
                              NOMINAL_FONT * 0.34
                            }
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Hub names ride above the bubbles — a hub the labs cover up can't
              do its job of naming what the cluster is. */}
          {dec.hubs && (
            <g className="lineage-hub-labels" aria-hidden="true">
              {dec.hubs.map((h) => (
                <text key={h.id} className="hub-label" textAnchor="middle" x={h.x} y={h.y - 38}>
                  {h.label}
                </text>
              ))}
            </g>
          )}
        </g>

      </svg>

      {activeNode && <Tooltip node={activeNode} transform={transform} fit={vp.fit} />}

      <div className="hud hud-bottom-right">
        <div className="island island-zoom">
          <button type="button" onClick={() => vp.zoomBy(1.4)} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => vp.zoomBy(1 / 1.4)} aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={vp.reset} aria-label="Reset zoom">
            ⤢
          </button>
        </div>
      </div>
    </div>
  );
}

interface TipProps {
  node: SimNode;
  transform: { k: number; x: number; y: number };
  fit: () => { rect: DOMRect; scale: number; insetX: number; insetY: number } | null;
}

/**
 * Plain HTML, positioned over the SVG rather than drawn inside it.
 *
 * The previous version was an SVG <rect> + <text> whose width and height were
 * estimated from character counts — which clipped the last line and truncated
 * long names. Letting the browser lay out real text removes the guesswork; we
 * only have to place the box and keep it inside the canvas.
 */
function Tooltip({ node, transform, fit }: TipProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Position after layout, reading the box's real size, and write straight to
  // the DOM node so there is no second render and therefore no flicker.
  useLayoutEffect(() => {
    const el = ref.current;
    const f = fit();
    if (!el || !f) return;

    const cx = f.insetX + (node.x * transform.k + transform.x) * f.scale;
    const cy = f.insetY + (node.y * transform.k + transform.y) * f.scale;
    const r = node.r * transform.k * f.scale;

    const { width, height } = el.getBoundingClientRect();
    const GAP = 12;
    const EDGE = 10;

    // Prefer below the bubble; flip above when there isn't room.
    let top = cy + r + GAP;
    if (top + height > f.rect.height - EDGE) {
      const above = cy - r - GAP - height;
      top = above >= EDGE ? above : Math.max(EDGE, f.rect.height - height - EDGE);
    }

    const left = Math.min(
      Math.max(cx - width / 2, EDGE),
      Math.max(EDGE, f.rect.width - width - EDGE)
    );

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.visibility = 'visible';
  }, [node, node.x, node.y, node.r, transform, fit]);

  const { lab } = node;

  return (
    <div ref={ref} className="tooltip" role="tooltip">
      <p className="tooltip-title">{lab.name}</p>
      <p className="tooltip-value">{valuationLabel(lab.valuation)}</p>
      <p className="tooltip-line">{spaceLabel(lab)}</p>
      <p className="tooltip-line">
        {lab.location.city} · founded {lab.year}
      </p>
    </div>
  );
}
