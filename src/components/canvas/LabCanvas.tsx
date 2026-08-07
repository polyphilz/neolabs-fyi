import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { DomainId, Lab, LineageGroup } from '../../data/types';
import type { Basemap } from '../../lib/basemap';
import { UNKNOWN_FILL, UNKNOWN_INK, fillFor, valuationStep } from '../../lib/color';
import { hexJitter, hexPath } from '../../lib/hex';
import {
  VIEW_H,
  VIEW_W,
  computeLayout,
  lineageGroupsOf,
  type CanvasViewId,
} from '../../lib/layout';
import {
  canvasNames,
  spaceLabel,
  valuationLabel,
  type CanvasLabel,
  type CanvasMark,
} from '../../lib/format';
import { stable } from '../../lib/precision';
import {
  LINE_SPACING,
  fitLabel,
  fitMark,
  refreshLabelMetrics,
  type FittedLabel,
  type FittedMark,
} from '../../lib/labelFit';
import { AREA_COLORS, BloomCore, ResearchBloom } from './ResearchBloom';
import { LineageRail, LineageYearAxis } from './LineageRail';
import { useSimulation, type SimNode } from './useSimulation';
import { useViewport } from './useViewport';
import { ValuationBands } from './ValuationBands';

interface Props {
  labs: Lab[];
  allLabs: Lab[];
  basemap: Basemap;
  view: CanvasViewId;
  selected: string | null;
  onSelect: (slug: string | null) => void;
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

/**
 * How much better than the bare legibility floor a name has to be before it
 * takes over from the one already on screen. Without it, a bubble sitting on
 * the exact zoom where the longer name starts to fit would flip between the two
 * on a pixel of scroll. With it, promoting needs 12% of headroom while demoting
 * only happens once the current name is genuinely too small — a deadband, not a
 * moved threshold.
 */
const PROMOTE = 1.12;

/** What chooseLabel settled on: a fitted line of type, or a fitted mark. */
type ChosenLabel =
  | { kind: 'text'; fitted: FittedLabel }
  | { kind: 'mark'; mark: CanvasMark; fitted: FittedMark };

/**
 * Longest rung that's legible at this zoom, out of the ladder in canvasNames().
 * `memory` holds which rung each lab is on, which is what makes the hysteresis
 * above possible; it's keyed by slug and self-correcting, so it survives view
 * changes without needing to be cleared.
 *
 * A mark is measured by its drawn height where type is measured by its font
 * size — near enough the same quantity for deciding whether either can be made
 * out, so both rungs answer to the one threshold.
 */
function chooseLabel(
  slug: string,
  rungs: CanvasLabel[],
  r: number,
  rot: number,
  screenScale: number,
  memory: Map<string, number>
): ChosenLabel | null {
  const current = memory.get(slug);
  for (let i = 0; i < rungs.length; i++) {
    const rung = rungs[i];
    const chosen: ChosenLabel | null =
      typeof rung === 'string'
        ? (() => {
            const fitted = fitLabel(rung, r, rot);
            return fitted ? { kind: 'text' as const, fitted } : null;
          })()
        : (() => {
            const fitted = fitMark(rung.width, rung.height, r, rot, rung.inset);
            return fitted ? { kind: 'mark' as const, mark: rung, fitted } : null;
          })();
    if (!chosen) continue;

    const size = chosen.kind === 'text' ? chosen.fitted.fontSize : chosen.fitted.height;
    // The margin governs switching, not first paint: on a fresh render there's
    // nothing on screen to flicker against, and charging it would demote a name
    // that was reading perfectly well before the ladder existed.
    const settled = current === undefined || i === current;
    const floor = settled ? MIN_SCREEN_FONT : MIN_SCREEN_FONT * PROMOTE;
    if (size * screenScale >= floor) {
      memory.set(slug, i);
      return chosen;
    }
  }
  // Nothing fits: forget the rung, so the lab starts clean when it next has room.
  memory.delete(slug);
  return null;
}

export function LabCanvas({ labs, allLabs, basemap, view, selected, onSelect }: Props) {
  /** Which rung of the name ladder each lab is currently showing. */
  const labelRung = useRef(new Map<string, number>());
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredLineage, setHoveredLineage] = useState<LineageGroup | null>(null);
  const [pinnedLineage, setPinnedLineage] = useState<LineageGroup | null>(null);
  const [hoveredArea, setHoveredArea] = useState<DomainId | null>(null);
  const [pinnedArea, setPinnedArea] = useState<DomainId | null>(null);
  const dragRef = useRef<{
    node: SimNode;
    startX: number;
    startY: number;
    pointerType: string;
    /** True once the slop threshold is crossed — i.e. a real drag. */
    dragging: boolean;
  } | null>(null);
  /** Same press-vs-drag question for the canvas background. */
  const panRef = useRef<{
    startX: number;
    startY: number;
    pointerType: string;
    moved: boolean;
    areaId: DomainId | null;
  } | null>(null);

  const layout = useMemo(
    () => computeLayout(view, labs, basemap, allLabs),
    [view, labs, basemap, allLabs]
  );

  useEffect(() => {
    if (view !== 'area') setPinnedArea(null);
    if (view !== 'lineage') setPinnedLineage(null);
  }, [view]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinnedArea(null);
        setPinnedLineage(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
      // Rungs chosen against the fallback face are worthless, and worse than
      // worthless once the hysteresis is holding one in place: the first paint
      // measures type generously, drops a lab to its short name, and then the
      // promotion margin keeps it there even though the real font fits.
      labelRung.current.clear();
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
      const rawAreaId =
        e.target instanceof Element
          ? e.target.closest<SVGGElement>('[data-area-id]')?.dataset.areaId
          : undefined;
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        pointerType: e.pointerType,
        moved: false,
        areaId:
          view === 'area' && rawAreaId && rawAreaId in AREA_COLORS
            ? (rawAreaId as DomainId)
            : null,
      };
      vp.startPan(e);
    },
    [vp, view]
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
      if (pan && !pan.moved) {
        onSelect(null);
        setPinnedLineage(null);
        if (pan.areaId) {
          setPinnedArea((current) => (current === pan.areaId ? null : pan.areaId));
        } else {
          setPinnedArea(null);
        }
      }
    },
    [vp, onSelect]
  );

  /** Hit radius in canvas units that yields MIN_HIT_SCREEN pixels on screen. */
  const hitRadius = MIN_HIT_SCREEN / Math.max(screenScale, 0.0001);

  const dec = layout.decorations;
  const active = hovered ?? selected;
  const activeNode = active ? positions.get(active) : null;
  const activeArea =
    view === 'area' ? (hoveredArea ?? activeNode?.lab.domain ?? pinnedArea) : null;
  // Hover beats pin while it lasts, the same contract the research bloom uses:
  // a pin is a frame you keep, not a lock on what you can look at next.
  const activeLineage = view === 'lineage' ? (hoveredLineage ?? pinnedLineage) : null;

  const groupsBySlug = useMemo(() => {
    const map = new Map<string, LineageGroup[]>();
    for (const lab of labs) map.set(lab.slug, lineageGroupsOf(lab));
    return map;
  }, [labs]);

  /**
   * With an origin active, how many of its labs each other origin also claims.
   * This is the reading the view is really for: pin Google and the overlap
   * segment on the DeepMind row says 13 of those 27 came out of both.
   */
  const lineageOverlap = useMemo(() => {
    const map = new Map<LineageGroup, number>();
    if (!activeLineage) return map;
    for (const groups of groupsBySlug.values()) {
      if (!groups.includes(activeLineage)) continue;
      for (const g of groups) {
        if (g !== activeLineage) map.set(g, (map.get(g) ?? 0) + 1);
      }
    }
    return map;
  }, [activeLineage, groupsBySlug]);

  /**
   * Four states, and the one that matters is `secondary`: a lab tied to the
   * active origin keeps visible dotted lines back to its *other* origins. That
   * is what stops "pinned on Google" from implying these labs are only Google.
   */
  const edgeState = useCallback(
    (from: string, toGroup: LineageGroup) => {
      if (active === from) return 'live';
      if (activeLineage) {
        if (toGroup === activeLineage) return 'live';
        return groupsBySlug.get(from)?.includes(activeLineage) ? 'secondary' : 'dim';
      }
      return active ? 'dim' : 'ghost';
    },
    [active, activeLineage, groupsBySlug]
  );

  return (
    <div className="canvas-shell">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="canvas-svg"
        role="application"
        aria-label={`Neolab map, ${view} view. ${labs.length} labs shown. The same labs are available as a sortable table from the Table view.`}
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

          {dec.valuationBands && <ValuationBands axis={dec.valuationBands} />}

          {dec.areaAtlas && (
            <ResearchBloom
              atlas={dec.areaAtlas}
              activeArea={activeArea}
              pinnedArea={pinnedArea}
              onHover={setHoveredArea}
              onToggle={(domain) => setPinnedArea((current) => (current === domain ? null : domain))}
            />
          )}

          {dec.yearAxis && <LineageYearAxis axis={dec.yearAxis} />}

          {dec.edges && dec.lineageRail && (
            <g className="lineage-edges" aria-hidden="true">
              {dec.edges.map((e) => {
                const node = positions.get(e.from);
                const row = dec.lineageRail!.rows.find((r) => r.id === e.toGroup);
                if (!node || !row) return null;
                const state = edgeState(e.from, e.toGroup);
                return (
                  <path
                    key={`${e.from}-${e.toGroup}`}
                    d={edgePath(dec.lineageRail!.anchorX, row.y, node.x - node.r - 3, node.y)}
                    className={`edge is-${state}`}
                    markerEnd={state === 'live' ? 'url(#lineage-arrow)' : undefined}
                  />
                );
              })}
            </g>
          )}

          <g className="bubbles">
            {drawOrder.map((n) => {
              const isActive = active === n.slug;
              const isSelected = selected === n.slug;
              const areaMuted = Boolean(activeArea && n.lab.domain !== activeArea);
              const areaHighlighted = activeArea === n.lab.domain;
              const inLineage = activeLineage
                ? Boolean(groupsBySlug.get(n.slug)?.includes(activeLineage))
                : false;
              const lineageMuted = Boolean(activeLineage) && !inLineage;
              const unknown = n.lab.valuation.qualifier === 'undisclosed' || Boolean(n.lab.structure);
              const step = valuationStep(n.lab.valuation.usdM);
              // Rotation and scale are per-lab and stable; the label has to be
              // fitted to the hexagon as actually drawn, not the packing circle.
              const jitter = hexJitter(n.slug);
              const shapeR = n.r * jitter.scale;
              // Longest name that's actually readable at this zoom, or nothing.
              const label = chooseLabel(
                n.slug,
                canvasNames(n.lab),
                shapeR,
                jitter.rot,
                screenScale,
                labelRung.current
              );
              return (
                <g
                  key={n.slug}
                  transform={`translate(${n.x},${n.y})`}
                  className={`bubble${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}${areaMuted ? ' is-area-muted' : ''}${areaHighlighted ? ' is-area-highlighted' : ''}${lineageMuted ? ' is-lineage-muted' : ''}${inLineage ? ' is-lineage-lit' : ''}`}
                  style={{ '--area-color': AREA_COLORS[n.lab.domain] } as React.CSSProperties}
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
                  <path
                    d={hexPath(shapeR, jitter.corner, jitter.rot)}
                    fill={unknown ? UNKNOWN_FILL : fillFor(n.lab.valuation.usdM)}
                    strokeWidth={Math.min(2, n.r * 0.12)}
                    className="bubble-disc"
                  />
                  {/* A $335M lab is ~10px across, which is a miserable target.
                      This pads it out to a usable size without changing what's
                      drawn. Sized in screen pixels, so it holds at any zoom. */}
                  {hitRadius > n.r && <circle r={hitRadius} className="bubble-hit" />}
                  {label?.kind === 'text' && (
                    <g transform={`scale(${label.fitted.fontSize / NOMINAL_FONT})`}>
                      <text
                        className="bubble-label"
                        textAnchor="middle"
                        style={{
                          fontSize: NOMINAL_FONT,
                          fill: unknown ? UNKNOWN_INK : `var(--on-seq-${step})`,
                        }}
                      >
                        {label.fitted.lines.map((line, i) => (
                          <tspan
                            key={line + i}
                            x={0}
                            y={
                              (i - (label.fitted.lines.length - 1) / 2) *
                                NOMINAL_FONT *
                                LINE_SPACING +
                              NOMINAL_FONT * 0.34
                            }
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  )}
                  {/* Same ink as the type it stands in for — the mark carries no
                      colour of its own, so it reads as a label rather than as a
                      second thing sitting on the hexagon. */}
                  {label?.kind === 'mark' && (
                    <g
                      className="bubble-mark"
                      // Ink is set once, as `color`, so fills and strokes in the
                      // artwork both follow it via currentColor.
                      style={{ color: unknown ? UNKNOWN_INK : `var(--on-seq-${step})` }}
                      transform={`scale(${label.fitted.scale}) translate(${-(label.mark.x + label.mark.width / 2)},${-(label.mark.y + label.mark.height / 2)})`}
                    >
                      {label.mark.shapes.map((shape) => (
                        <path
                          key={shape.d}
                          d={shape.d}
                          fill={shape.strokeWidth ? 'none' : 'currentColor'}
                          fillRule={shape.fillRule}
                          stroke={shape.strokeWidth ? 'currentColor' : 'none'}
                          strokeWidth={shape.strokeWidth}
                          strokeLinecap={shape.linecap}
                          strokeLinejoin={shape.linecap}
                        />
                      ))}
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {dec.areaAtlas && (
            <BloomCore
              atlas={dec.areaAtlas}
              activeSector={
                activeArea
                  ? dec.areaAtlas.sectors.find((sector) => sector.id === activeArea) ?? null
                  : null
              }
            />
          )}

          {/* Drawn after the bubbles: the rail is the anchor of the whole view,
              and a lab drifting over it would cover the ranking. Nothing in the
              field reaches x=248, but zoom and drag both can. */}
          {dec.lineageRail && (
            <LineageRail
              rail={dec.lineageRail}
              activeGroup={activeLineage}
              pinnedGroup={pinnedLineage}
              overlap={lineageOverlap}
              onHover={setHoveredLineage}
              onToggle={(group) =>
                setPinnedLineage((current) => (current === group ? null : group))
              }
            />
          )}
        </g>

        <defs>
          <marker
            id="lineage-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" className="lineage-arrowhead" />
          </marker>
        </defs>
      </svg>

      {activeNode && <Tooltip node={activeNode} transform={transform} fit={vp.fit} />}
    </div>
  );
}

/**
 * Rail row to lab, as a curve that leaves and arrives horizontally.
 *
 * Straight segments at this density read as a hairball because every line
 * crosses the field at its own angle. Forcing a horizontal departure makes the
 * whole bundle travel the same way — which is what turns 193 lines into a
 * legible flow, and what makes direction readable before the arrowhead is.
 */
function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const bend = Math.max(40, (x2 - x1) * 0.42);
  return `M ${stable(x1)} ${stable(y1)} C ${stable(x1 + bend)} ${stable(y1)}, ${stable(x2 - bend)} ${stable(y2)}, ${stable(x2)} ${stable(y2)}`;
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
